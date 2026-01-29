"""Dynamic tool creation from Python code."""

from typing import Any, Dict
import logging
from genxai.tools.base import Tool, ToolMetadata, ToolParameter

logger = logging.getLogger(__name__)


class DynamicTool(Tool):
    """Tool created dynamically from Python code."""

    def __init__(
        self, 
        metadata: ToolMetadata, 
        parameters: list[ToolParameter],
        code: str
    ):
        """Initialize dynamic tool.

        Args:
            metadata: Tool metadata
            parameters: Tool parameters
            code: Python code to execute
        """
        super().__init__(metadata, parameters)
        self.code = code
        self._compiled_code = None
        self._compile_code()

    def _compile_code(self) -> None:
        """Compile the Python code for execution."""
        try:
            # Compile the code
            self._compiled_code = compile(self.code, '<dynamic>', 'exec')
            logger.info(f"Compiled code for tool: {self.metadata.name}")
        except SyntaxError as e:
            logger.error(f"Failed to compile code for {self.metadata.name}: {e}")
            raise ValueError(f"Invalid Python code: {e}")

    async def _execute(self, **kwargs: Any) -> Any:
        """Execute the dynamic tool code.

        Args:
            **kwargs: Tool parameters

        Returns:
            Tool execution result
        """
        try:
            # Create execution namespace
            namespace: Dict[str, Any] = {
                '__builtins__': {
                    # Safe built-ins only
                    'abs': abs,
                    'all': all,
                    'any': any,
                    'bool': bool,
                    'dict': dict,
                    'enumerate': enumerate,
                    'float': float,
                    'int': int,
                    'len': len,
                    'list': list,
                    'max': max,
                    'min': min,
                    'range': range,
                    'round': round,
                    'sorted': sorted,
                    'str': str,
                    'sum': sum,
                    'tuple': tuple,
                    'zip': zip,
                },
                'params': kwargs,  # Pass parameters as 'params' dict
            }

            # Execute the code
            exec(self._compiled_code, namespace)

            # Look for 'result' variable in namespace
            if 'result' not in namespace:
                raise ValueError(
                    "Tool code must set a 'result' variable with the output"
                )

            result = namespace['result']
            logger.info(f"Dynamic tool {self.metadata.name} executed successfully")
            
            return result

        except Exception as e:
            logger.error(f"Dynamic tool {self.metadata.name} execution failed: {e}")
            raise RuntimeError(f"Tool execution failed: {e}")

    def get_code(self) -> str:
        """Get the tool's source code.

        Returns:
            Python source code
        """
        return self.code

    def update_code(self, new_code: str) -> None:
        """Update the tool's code.

        Args:
            new_code: New Python code
        """
        self.code = new_code
        self._compile_code()
        logger.info(f"Updated code for tool: {self.metadata.name}")
