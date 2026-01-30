"""Workflow execution engine for GenXAI."""

import asyncio
import copy
from typing import Any, Dict, List, Optional
import logging

from genxai.core.graph.engine import Graph
from genxai.core.graph.nodes import InputNode, OutputNode, AgentNode, NodeType
from genxai.core.graph.edges import Edge, ConditionalEdge
from genxai.core.agent.base import Agent, AgentFactory
from genxai.core.agent.registry import AgentRegistry
from genxai.tools.registry import ToolRegistry
from genxai.tools.builtin.computation.calculator import CalculatorTool
from genxai.tools.builtin.file.file_reader import FileReaderTool

logger = logging.getLogger(__name__)


class EnhancedGraph(Graph):
    """Enhanced graph with agent execution support.
    
    This extends the base Graph class to provide real agent execution
    with tool integration. It's the recommended way to execute workflows
    in GenXAI.
    """

    async def _execute_node_logic(self, node: Any, state: Dict[str, Any]) -> Any:
        """Execute node logic with actual agent execution.

        Args:
            node: Node to execute
            state: Current state

        Returns:
            Result of node execution
        """
        if node.type == NodeType.INPUT:
            # IMPORTANT: Avoid returning the exact same `dict` object stored under
            # `state["input"]`. If we do, the engine will store that same object
            # under the input node id (e.g. "start"), creating shared references
            # which Python's `json.dumps` treats as circular.
            return copy.deepcopy(state.get("input"))
        
        elif node.type == NodeType.OUTPUT:
            # IMPORTANT: never return the live `state` dict. The engine stores the
            # node result back into `state[node_id]`, so returning `state` would
            # create a self-referential structure (circular reference) that can't
            # be JSON-serialized for persistence.
            # Also deep-copy to avoid shared references (json can't encode those).
            return copy.deepcopy(state)
        
        elif node.type == NodeType.AGENT:
            # Get agent from registry
            agent_id = node.config.data.get("agent_id")
            if not agent_id:
                raise ValueError(f"Agent node '{node.id}' missing agent_id in config.data")
            
            agent = AgentRegistry.get(agent_id)
            if agent is None:
                raise ValueError(f"Agent '{agent_id}' not found in registry")
            
            # Prepare task from state
            task = state.get("task", "Process the input data")
            
            # Execute agent with tools if available
            result = await self._execute_agent_with_tools(agent, task, state)
            
            return result
        
        else:
            # Default behavior
            return {"node_id": node.id, "type": node.type.value}

    async def _execute_agent_with_tools(
        self, agent: Agent, task: str, state: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute agent with tool support using AgentRuntime.

        Args:
            agent: Agent to execute
            task: Task description
            state: Current state

        Returns:
            Execution result
        """
        logger.debug(f"Executing agent '{agent.id}' ({agent.config.role})")
        
        # Use AgentRuntime for full integration
        from genxai.core.agent.runtime import AgentRuntime
        
        runtime = AgentRuntime(agent=agent, enable_memory=True)
        
        # Load tools from registry
        if agent.config.tools:
            tools = {}
            for tool_name in agent.config.tools:
                tool = ToolRegistry.get(tool_name)
                if tool:
                    tools[tool_name] = tool
            runtime.set_tools(tools)
            logger.debug(f"Loaded {len(tools)} tools for agent")
        
        # Execute agent with full runtime support
        result = await runtime.execute(task, context=state)
        
        return result

    async def _execute_tool_for_task(
        self, tool: Any, tool_name: str, task: str, state: Dict[str, Any]
    ) -> Any:
        """Execute a tool based on the task.

        Args:
            tool: Tool instance
            tool_name: Tool name
            task: Task description
            state: Current state

        Returns:
            Tool execution result or None
        """
        try:
            # Calculator tool
            if tool_name == "calculator":
                # Check if task involves calculation
                if any(op in task.lower() for op in ["calculate", "compute", "add", "multiply", "+"]):
                    # Extract expression from state or use default
                    expression = state.get("expression", "10 * 5 + 3")
                    logger.debug(f"Executing calculator: {expression}")
                    result = await tool.execute(expression=expression)
                    if result.success:
                        logger.debug(f"Calculator result: {result.data['result']}")
                        return result.data
            
            # File reader tool
            elif tool_name == "file_reader":
                # Check if task involves file reading
                if any(word in task.lower() for word in ["read", "file", "load"]):
                    # Get file path from state
                    file_path = state.get("file_path")
                    
                    if file_path:
                        logger.debug(f"Reading file: {file_path}")
                        result = await tool.execute(path=file_path)
                        if result.success:
                            logger.debug(f"Read {result.data['lines']} lines")
                            return result.data
        
        except Exception as e:
            logger.error(f"Tool execution failed: {e}")
        
        return None


class WorkflowExecutor:
    """Executes workflows using GenXAI engine.
    
    This is the main class for executing workflows programmatically.
    It handles agent creation, tool registration, graph building,
    and execution.
    
    Example:
        ```python
        executor = WorkflowExecutor(openai_api_key="sk-...")
        result = await executor.execute(nodes, edges, input_data)
        ```
    """

    def __init__(
        self, 
        openai_api_key: Optional[str] = None, 
        anthropic_api_key: Optional[str] = None,
        register_builtin_tools: bool = True
    ):
        """Initialize workflow executor.

        Args:
            openai_api_key: OpenAI API key
            anthropic_api_key: Anthropic API key
            register_builtin_tools: Whether to register built-in tools
        """
        self.openai_api_key = openai_api_key
        self.anthropic_api_key = anthropic_api_key
        
        if register_builtin_tools:
            self._setup_tools()

    def _setup_tools(self) -> None:
        """Register built-in tools."""
        # Register calculator tool
        if not ToolRegistry.get("calculator"):
            calculator = CalculatorTool()
            ToolRegistry.register(calculator)
            logger.info("Registered calculator tool")

        # Register file reader tool
        if not ToolRegistry.get("file_reader"):
            file_reader = FileReaderTool()
            ToolRegistry.register(file_reader)
            logger.info("Registered file_reader tool")

    def _create_agents_from_nodes(self, nodes: List[Dict[str, Any]]) -> None:
        """Create and register agents from workflow nodes.

        Args:
            nodes: List of workflow nodes
        """
        for node in nodes:
            if node.get("type") == "agent":
                agent_id = node.get("id")
                config = node.get("config", {})
                
                # Extract agent configuration
                role = config.get("role", "Agent")
                goal = config.get("goal", "Process tasks")
                backstory = config.get("backstory", "")
                tools = config.get("tools", [])
                llm_model = config.get("llm_model", "gpt-4")
                temperature = config.get("temperature", 0.7)

                # Create agent
                agent = AgentFactory.create_agent(
                    id=agent_id,
                    role=role,
                    goal=goal,
                    backstory=backstory,
                    tools=tools,
                    llm_model=llm_model,
                    temperature=temperature,
                )

                # Register agent
                AgentRegistry.register(agent)
                logger.info(f"Created and registered agent: {agent_id}")

    def _build_graph(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> EnhancedGraph:
        """Build GenXAI graph from workflow definition.

        Args:
            nodes: List of workflow nodes
            edges: List of workflow edges

        Returns:
            Constructed graph
        """
        graph = EnhancedGraph(name="workflow")

        # Add nodes
        for node in nodes:
            node_id = node.get("id")
            node_type = node.get("type")

            # Support some common aliases used by the Studio UI
            # - "start" behaves like an input node
            # - "end" behaves like an output node
            if node_type in {"input", "start"}:
                graph.add_node(InputNode(id=node_id))
            elif node_type in {"output", "end"}:
                graph.add_node(OutputNode(id=node_id))
            elif node_type == "agent":
                graph.add_node(AgentNode(id=node_id, agent_id=node_id))
            else:
                logger.warning(f"Unknown node type: {node_type}")

        # Add edges
        for edge in edges:
            source = edge.get("source")
            target = edge.get("target")
            condition = edge.get("condition")

            if condition:
                # Conditional edge
                graph.add_edge(
                    ConditionalEdge(
                        source=source,
                        target=target,
                        condition=lambda state, cond=condition: self._evaluate_condition(state, cond),
                    )
                )
            else:
                # Regular edge
                graph.add_edge(Edge(source=source, target=target))

        return graph

    def _evaluate_condition(self, state: Dict[str, Any], condition: str) -> bool:
        """Evaluate a condition string.

        Args:
            state: Current workflow state
            condition: Condition expression

        Returns:
            Boolean result
        """
        # Simple condition evaluation (can be enhanced)
        try:
            # For now, just check if condition key exists in state
            return condition in state
        except Exception as e:
            logger.error(f"Error evaluating condition: {e}")
            return False

    async def execute(
        self, 
        nodes: List[Dict[str, Any]], 
        edges: List[Dict[str, Any]], 
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a workflow.

        Args:
            nodes: Workflow nodes
            edges: Workflow edges
            input_data: Input data for execution

        Returns:
            Execution result with status, result, and metadata
        """
        try:
            logger.info("Starting workflow execution")

            # Create agents from nodes
            self._create_agents_from_nodes(nodes)

            # Build graph
            graph = self._build_graph(nodes, edges)

            # Validate graph
            graph.validate()
            logger.info(f"Graph validated: {len(graph.nodes)} nodes, {len(graph.edges)} edges")

            # Execute graph
            result = await graph.run(input_data=input_data)

            logger.info("Workflow execution completed successfully")

            return {
                "status": "success",
                "result": result,
                "nodes_executed": len(graph.nodes),
                "message": "Workflow executed successfully"
            }

        except Exception as e:
            logger.error(f"Workflow execution failed: {e}", exc_info=True)
            return {
                "status": "error",
                "error": str(e),
                "message": f"Workflow execution failed: {str(e)}"
            }

        finally:
            # Cleanup: Clear registries for next execution
            AgentRegistry.clear()
            logger.info("Cleared agent registry")


def execute_workflow_sync(
    nodes: List[Dict[str, Any]],
    edges: List[Dict[str, Any]],
    input_data: Dict[str, Any],
    openai_api_key: Optional[str] = None,
    anthropic_api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """Synchronous wrapper for workflow execution.
    
    This is a convenience function for executing workflows in
    synchronous contexts.

    Args:
        nodes: Workflow nodes
        edges: Workflow edges
        input_data: Input data
        openai_api_key: OpenAI API key
        anthropic_api_key: Anthropic API key

    Returns:
        Execution result
    """
    executor = WorkflowExecutor(
        openai_api_key=openai_api_key,
        anthropic_api_key=anthropic_api_key
    )
    
    # Run async execution in sync context
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(
            executor.execute(nodes, edges, input_data)
        )
        return result
    finally:
        loop.close()


async def execute_workflow_async(
    nodes: List[Dict[str, Any]],
    edges: List[Dict[str, Any]],
    input_data: Dict[str, Any],
    openai_api_key: Optional[str] = None,
    anthropic_api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """Async convenience function for workflow execution.

    This is the correct entry point when you're *already* inside an asyncio
    event loop (e.g. FastAPI/Uvicorn request handlers).

    Args:
        nodes: Workflow nodes
        edges: Workflow edges
        input_data: Input data
        openai_api_key: OpenAI API key
        anthropic_api_key: Anthropic API key

    Returns:
        Execution result
    """
    executor = WorkflowExecutor(
        openai_api_key=openai_api_key,
        anthropic_api_key=anthropic_api_key,
    )
    return await executor.execute(nodes, edges, input_data)
