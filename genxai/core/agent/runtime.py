"""Agent runtime for executing agents with LLM integration."""

from typing import Any, Dict, Optional
import asyncio
import time
import logging

from genxai.core.agent.base import Agent

logger = logging.getLogger(__name__)


class AgentExecutionError(Exception):
    """Exception raised during agent execution."""

    pass


class AgentRuntime:
    """Runtime for executing agents."""

    def __init__(self, agent: Agent) -> None:
        """Initialize agent runtime.

        Args:
            agent: Agent to execute
        """
        self.agent = agent
        self._llm_provider: Optional[Any] = None
        self._tools: Dict[str, Any] = {}
        self._memory: Optional[Any] = None

    async def execute(
        self,
        task: str,
        context: Optional[Dict[str, Any]] = None,
        timeout: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Execute agent with given task.

        Args:
            task: Task description
            context: Execution context
            timeout: Execution timeout in seconds

        Returns:
            Execution result

        Raises:
            AgentExecutionError: If execution fails
            asyncio.TimeoutError: If execution times out
        """
        start_time = time.time()
        
        if context is None:
            context = {}

        # Apply timeout
        execution_timeout = timeout or self.agent.config.max_execution_time
        
        try:
            if execution_timeout:
                result = await asyncio.wait_for(
                    self._execute_internal(task, context),
                    timeout=execution_timeout
                )
            else:
                result = await self._execute_internal(task, context)
            
            execution_time = time.time() - start_time
            result["execution_time"] = execution_time
            
            return result
            
        except asyncio.TimeoutError:
            logger.error(f"Agent {self.agent.id} execution timed out after {execution_timeout}s")
            raise
        except Exception as e:
            logger.error(f"Agent {self.agent.id} execution failed: {e}")
            raise AgentExecutionError(f"Agent execution failed: {e}") from e

    async def _execute_internal(
        self,
        task: str,
        context: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Internal execution logic.

        Args:
            task: Task description
            context: Execution context

        Returns:
            Execution result
        """
        logger.info(f"Executing agent {self.agent.id}: {task}")
        
        # Build prompt
        prompt = self._build_prompt(task, context)
        
        # Get LLM response (placeholder - will be implemented with actual LLM)
        response = await self._get_llm_response(prompt)
        
        # Process tools if needed
        if self.agent.config.tools:
            response = await self._process_tools(response, context)
        
        # Update memory if enabled
        if self.agent.config.enable_memory and self._memory:
            await self._update_memory(task, response)
        
        # Build result
        result = {
            "agent_id": self.agent.id,
            "task": task,
            "status": "completed",
            "output": response,
            "context": context,
        }
        
        # Reflection for learning agents
        if self.agent.config.agent_type == "learning":
            reflection = await self.agent.reflect(result)
            result["reflection"] = reflection
        
        return result

    def _build_prompt(self, task: str, context: Dict[str, Any]) -> str:
        """Build prompt for LLM.

        Args:
            task: Task description
            context: Execution context

        Returns:
            Formatted prompt
        """
        prompt_parts = []
        
        # Add role and goal
        prompt_parts.append(f"You are a {self.agent.config.role}.")
        prompt_parts.append(f"Your goal is: {self.agent.config.goal}")
        
        # Add backstory if provided
        if self.agent.config.backstory:
            prompt_parts.append(f"\nBackground: {self.agent.config.backstory}")
        
        # Add available tools
        if self.agent.config.tools:
            tools_str = ", ".join(self.agent.config.tools)
            prompt_parts.append(f"\nAvailable tools: {tools_str}")
        
        # Add context
        if context:
            prompt_parts.append(f"\nContext: {context}")
        
        # Add task
        prompt_parts.append(f"\nTask: {task}")
        prompt_parts.append("\nPlease complete the task.")
        
        return "\n".join(prompt_parts)

    async def _get_llm_response(self, prompt: str) -> str:
        """Get response from LLM.

        This is a placeholder that will be replaced with actual LLM integration.

        Args:
            prompt: Prompt to send to LLM

        Returns:
            LLM response
        """
        # Placeholder implementation
        logger.debug(f"Getting LLM response for agent {self.agent.id}")
        
        # Simulate LLM call
        await asyncio.sleep(0.1)
        
        return f"[Placeholder LLM response for: {prompt[:50]}...]"

    async def _process_tools(
        self,
        response: str,
        context: Dict[str, Any],
    ) -> str:
        """Process tool calls in response.

        Args:
            response: LLM response
            context: Execution context

        Returns:
            Processed response
        """
        # Placeholder for tool processing
        logger.debug(f"Processing tools for agent {self.agent.id}")
        return response

    async def _update_memory(self, task: str, response: str) -> None:
        """Update agent memory.

        Args:
            task: Task that was executed
            response: Response generated
        """
        # Placeholder for memory update
        logger.debug(f"Updating memory for agent {self.agent.id}")

    def set_llm_provider(self, provider: Any) -> None:
        """Set LLM provider.

        Args:
            provider: LLM provider instance
        """
        self._llm_provider = provider
        logger.info(f"LLM provider set for agent {self.agent.id}")

    def set_tools(self, tools: Dict[str, Any]) -> None:
        """Set available tools.

        Args:
            tools: Dictionary of tool name to tool instance
        """
        self._tools = tools
        logger.info(f"Tools set for agent {self.agent.id}: {list(tools.keys())}")

    def set_memory(self, memory: Any) -> None:
        """Set memory system.

        Args:
            memory: Memory system instance
        """
        self._memory = memory
        logger.info(f"Memory system set for agent {self.agent.id}")

    async def batch_execute(
        self,
        tasks: list[str],
        context: Optional[Dict[str, Any]] = None,
    ) -> list[Dict[str, Any]]:
        """Execute multiple tasks in parallel.

        Args:
            tasks: List of tasks to execute
            context: Shared execution context

        Returns:
            List of execution results
        """
        logger.info(f"Batch executing {len(tasks)} tasks for agent {self.agent.id}")
        
        results = await asyncio.gather(
            *[self.execute(task, context) for task in tasks],
            return_exceptions=True
        )
        
        return [
            r if not isinstance(r, Exception) else {"error": str(r)}
            for r in results
        ]
