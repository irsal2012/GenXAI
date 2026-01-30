"""Agent runtime for executing agents with LLM integration."""

from typing import Any, Dict, Optional
import asyncio
import time
import logging

from genxai.core.agent.base import Agent
from genxai.llm.base import LLMProvider
from genxai.llm.factory import LLMProviderFactory

logger = logging.getLogger(__name__)


class AgentExecutionError(Exception):
    """Exception raised during agent execution."""

    pass


class AgentRuntime:
    """Runtime for executing agents."""

    def __init__(
        self,
        agent: Agent,
        llm_provider: Optional[LLMProvider] = None,
        api_key: Optional[str] = None,
    ) -> None:
        """Initialize agent runtime.

        Args:
            agent: Agent to execute
            llm_provider: LLM provider instance (optional, will be created if not provided)
            api_key: API key for LLM provider (optional, will use env var if not provided)
        """
        self.agent = agent
        self._tools: Dict[str, Any] = {}
        self._memory: Optional[Any] = None

        # Initialize LLM provider
        if llm_provider:
            self._llm_provider = llm_provider
        else:
            # Create provider from agent config
            try:
                self._llm_provider = LLMProviderFactory.create_provider(
                    model=agent.config.llm_model,
                    api_key=api_key,
                    temperature=agent.config.llm_temperature,
                    max_tokens=agent.config.llm_max_tokens,
                )
                logger.info(f"Created LLM provider for agent {agent.id}: {agent.config.llm_model}")
            except Exception as e:
                logger.warning(f"Failed to create LLM provider for agent {agent.id}: {e}")
                self._llm_provider = None

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

    def _build_system_prompt(self) -> str:
        """Build system prompt from agent configuration.

        Returns:
            System prompt string
        """
        system_parts = []
        
        # Add role
        system_parts.append(f"You are a {self.agent.config.role}.")
        
        # Add goal
        system_parts.append(f"Your goal is: {self.agent.config.goal}")
        
        # Add backstory if provided
        if self.agent.config.backstory:
            system_parts.append(f"\nBackground: {self.agent.config.backstory}")
        
        # Add agent type specific instructions
        if self.agent.config.agent_type == "deliberative":
            system_parts.append("\nYou should think carefully and plan before acting.")
        elif self.agent.config.agent_type == "learning":
            system_parts.append("\nYou should learn from feedback and improve over time.")
        elif self.agent.config.agent_type == "collaborative":
            system_parts.append("\nYou should work well with other agents and coordinate effectively.")
        
        return "\n".join(system_parts)

    async def _get_llm_response(self, prompt: str) -> str:
        """Get response from LLM.

        Args:
            prompt: Prompt to send to LLM

        Returns:
            LLM response

        Raises:
            RuntimeError: If LLM provider not initialized
        """
        if not self._llm_provider:
            logger.error(f"No LLM provider available for agent {self.agent.id}")
            raise RuntimeError(
                f"Agent {self.agent.id} has no LLM provider. "
                "Provide an API key or set OPENAI_API_KEY environment variable."
            )

        try:
            logger.debug(f"Calling LLM for agent {self.agent.id}")

            # Build system prompt from agent config
            system_prompt = self._build_system_prompt()

            # Call LLM provider
            response = await self._llm_provider.generate(
                prompt=prompt,
                system_prompt=system_prompt,
            )

            # Update token usage
            self.agent._total_tokens += response.usage.get("total_tokens", 0)

            logger.debug(
                f"LLM response received for agent {self.agent.id}: "
                f"{len(response.content)} chars, "
                f"{response.usage.get('total_tokens', 0)} tokens"
            )

            return response.content

        except Exception as e:
            logger.error(f"LLM call failed for agent {self.agent.id}: {e}")
            raise RuntimeError(f"LLM call failed: {e}") from e

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
        if not self._memory:
            return
        
        try:
            from genxai.core.memory.base import MemoryType
            
            # Store task in memory
            task_memory_id = self._memory.store(
                content={"task": task, "response": response},
                memory_type=MemoryType.SHORT_TERM,
                importance=0.5,
                tags=["conversation", "task"],
                metadata={"agent_id": self.agent.id},
            )
            
            logger.debug(f"Stored memory {task_memory_id} for agent {self.agent.id}")
        except Exception as e:
            logger.error(f"Failed to update memory: {e}")

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
            memory: Memory system instance (MemoryManager or MemorySystem)
        """
        self._memory = memory
        logger.info(f"Memory system set for agent {self.agent.id}")
    
    def get_memory_context(self, limit: int = 5) -> str:
        """Get recent memory context for LLM prompts.

        Args:
            limit: Number of recent memories to include

        Returns:
            Formatted memory context string
        """
        if not self._memory:
            return ""
        
        try:
            # Get recent memories
            recent_memories = self._memory.retrieve_recent(limit=limit)
            
            if not recent_memories:
                return ""
            
            # Format memories for context
            context_parts = ["Recent context:"]
            for memory in recent_memories:
                if isinstance(memory.content, dict):
                    task = memory.content.get("task", "")
                    response = memory.content.get("response", "")
                    context_parts.append(f"- Task: {task}")
                    context_parts.append(f"  Response: {response[:100]}...")
                else:
                    context_parts.append(f"- {str(memory.content)[:100]}...")
            
            return "\n".join(context_parts)
        except Exception as e:
            logger.error(f"Failed to get memory context: {e}")
            return ""

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
