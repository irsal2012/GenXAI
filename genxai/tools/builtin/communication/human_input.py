"""Human input tool for interactive workflows."""

from typing import Any, Dict

from genxai.tools.base import Tool, ToolMetadata, ToolParameter, ToolCategory


class HumanInputTool(Tool):
    """Collect input from a human (stdin)."""

    def __init__(self) -> None:
        super().__init__(
            metadata=ToolMetadata(
                name="human_input",
                description="Collects human input from the console",
                category=ToolCategory.CUSTOM,
            ),
            parameters=[
                ToolParameter(
                    name="prompt",
                    type="string",
                    description="Prompt to show the user",
                )
            ],
        )

    async def _execute(self, **kwargs: Any) -> Dict[str, Any]:
        prompt = kwargs.get("prompt", "Your response:")
        return {"response": input(f"{prompt} ")}