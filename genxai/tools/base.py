"""Base tool classes for GenXAI."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from enum import Enum
from abc import ABC, abstractmethod
import time
import logging

logger = logging.getLogger(__name__)


class ToolCategory(str, Enum):
    """Tool categories for organization."""

    WEB = "web"
    DATABASE = "database"
    FILE = "file"
    COMPUTATION = "computation"
    COMMUNICATION = "communication"
    AI = "ai"
    DATA_PROCESSING = "data_processing"
    SYSTEM = "system"
    CUSTOM = "custom"


class ToolParameter(BaseModel):
    """Tool parameter definition."""

    name: str
    type: str  # string, number, boolean, array, object
    description: str
    required: bool = True
    default: Optional[Any] = None
    enum: Optional[List[Any]] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    pattern: Optional[str] = None  # Regex pattern for strings

    class Config:
        """Pydantic configuration."""

        arbitrary_types_allowed = True


class ToolMetadata(BaseModel):
    """Tool metadata."""

    name: str
    description: str
    category: ToolCategory
    tags: List[str] = Field(default_factory=list)
    version: str = "1.0.0"
    author: str = "GenXAI"
    license: str = "MIT"
    documentation_url: Optional[str] = None


class ToolResult(BaseModel):
    """Tool execution result."""

    success: bool
    data: Any
    error: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    execution_time: float = 0.0

    class Config:
        """Pydantic configuration."""

        arbitrary_types_allowed = True


class Tool(ABC):
    """Base class for all tools."""

    def __init__(self, metadata: ToolMetadata, parameters: List[ToolParameter]):
        """Initialize tool.

        Args:
            metadata: Tool metadata
            parameters: Tool parameters
        """
        self.metadata = metadata
        self.parameters = parameters
        self._execution_count = 0
        self._total_execution_time = 0.0
        self._success_count = 0
        self._failure_count = 0

    async def execute(self, **kwargs: Any) -> ToolResult:
        """Execute tool with validation and error handling.

        Args:
            **kwargs: Tool parameters

        Returns:
            Tool execution result
        """
        start_time = time.time()

        try:
            # Validate input
            if not self.validate_input(**kwargs):
                return ToolResult(
                    success=False,
                    data=None,
                    error="Invalid input parameters",
                    execution_time=time.time() - start_time,
                )

            # Execute tool logic
            result = await self._execute(**kwargs)

            # Update metrics
            execution_time = time.time() - start_time
            self._execution_count += 1
            self._total_execution_time += execution_time
            self._success_count += 1

            logger.info(
                f"Tool {self.metadata.name} executed successfully in {execution_time:.2f}s"
            )

            return ToolResult(
                success=True,
                data=result,
                execution_time=execution_time,
                metadata={"tool": self.metadata.name, "version": self.metadata.version},
            )

        except Exception as e:
            execution_time = time.time() - start_time
            self._execution_count += 1
            self._total_execution_time += execution_time
            self._failure_count += 1

            logger.error(f"Tool {self.metadata.name} failed: {str(e)}")

            return ToolResult(
                success=False, data=None, error=str(e), execution_time=execution_time
            )

    @abstractmethod
    async def _execute(self, **kwargs: Any) -> Any:
        """Implement tool-specific logic.

        Args:
            **kwargs: Tool parameters

        Returns:
            Tool result data
        """
        pass

    def validate_input(self, **kwargs: Any) -> bool:
        """Validate input parameters against schema.

        Args:
            **kwargs: Input parameters

        Returns:
            True if valid, False otherwise
        """
        for param in self.parameters:
            # Check required parameters
            if param.required and param.name not in kwargs:
                logger.error(f"Missing required parameter: {param.name}")
                return False

            if param.name in kwargs:
                value = kwargs[param.name]

                # Type validation
                if param.type == "string" and not isinstance(value, str):
                    logger.error(f"Parameter {param.name} must be string")
                    return False
                elif param.type == "number" and not isinstance(value, (int, float)):
                    logger.error(f"Parameter {param.name} must be number")
                    return False
                elif param.type == "boolean" and not isinstance(value, bool):
                    logger.error(f"Parameter {param.name} must be boolean")
                    return False

                # Range validation
                if param.min_value is not None and value < param.min_value:
                    logger.error(
                        f"Parameter {param.name} must be >= {param.min_value}"
                    )
                    return False
                if param.max_value is not None and value > param.max_value:
                    logger.error(
                        f"Parameter {param.name} must be <= {param.max_value}"
                    )
                    return False

                # Enum validation
                if param.enum and value not in param.enum:
                    logger.error(
                        f"Parameter {param.name} must be one of {param.enum}"
                    )
                    return False

        return True

    def get_schema(self) -> Dict[str, Any]:
        """Generate OpenAPI-style schema.

        Returns:
            Tool schema dictionary
        """
        return {
            "name": self.metadata.name,
            "description": self.metadata.description,
            "category": self.metadata.category.value,
            "parameters": {
                "type": "object",
                "properties": {
                    param.name: {
                        "type": param.type,
                        "description": param.description,
                        **({"enum": param.enum} if param.enum else {}),
                        **(
                            {"default": param.default}
                            if param.default is not None
                            else {}
                        ),
                    }
                    for param in self.parameters
                },
                "required": [p.name for p in self.parameters if p.required],
            },
        }

    def get_metrics(self) -> Dict[str, Any]:
        """Get tool execution metrics.

        Returns:
            Metrics dictionary
        """
        return {
            "execution_count": self._execution_count,
            "success_count": self._success_count,
            "failure_count": self._failure_count,
            "success_rate": (
                self._success_count / self._execution_count
                if self._execution_count > 0
                else 0.0
            ),
            "total_execution_time": self._total_execution_time,
            "average_execution_time": (
                self._total_execution_time / self._execution_count
                if self._execution_count > 0
                else 0.0
            ),
        }

    def reset_metrics(self) -> None:
        """Reset tool metrics."""
        self._execution_count = 0
        self._total_execution_time = 0.0
        self._success_count = 0
        self._failure_count = 0

    def __repr__(self) -> str:
        """String representation."""
        return f"Tool(name={self.metadata.name}, category={self.metadata.category})"
