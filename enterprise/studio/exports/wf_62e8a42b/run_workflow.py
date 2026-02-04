import json
from pathlib import Path

from genxai.core.graph import load_workflow_yaml, register_workflow_agents
from genxai.core.graph.executor import execute_workflow_sync


def main() -> None:
    workflow_path = Path(__file__).with_name("workflow.yaml")
    workflow = load_workflow_yaml(workflow_path)
    register_workflow_agents(workflow)

    payload = {"input": "Hello from Studio export"}
    result = execute_workflow_sync(
        nodes=workflow["graph"]["nodes"],
        edges=workflow["graph"]["edges"],
        input_data=payload,
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
