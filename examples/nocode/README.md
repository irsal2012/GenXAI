# No-Code Workflow Templates

These YAML templates are designed for the GenXAI Studio and CLI to provide
quick-start, visual workflows without writing code.

## Reusable Agent Definitions

Reusable agent templates are available in `examples/nocode/agents/`. Each file defines an `agents` list that can be referenced by workflows or used as a starting point for authoring new workflows.

## Available Templates

1. **Customer Support** (`customer_support.yaml`)
   - Classify and route support requests

2. **Content Generation** (`content_generation.yaml`)
   - Research → Draft → Edit pipeline

3. **Data Validation Pipeline** (`data_pipeline.yaml`)
   - Validate, transform, and output structured data

## How to Use

```bash
genxai workflow run examples/nocode/customer_support.yaml \
  --input '{"message": "My billing failed"}'
```

> Note: CLI support may require the Studio API or workflow runner integration.

## Customize

- Adjust agent roles and models
- Add tools per agent
- Add conditional edges for routing
- Replace models with Ollama for local execution

## Using Shared Agents

Each workflow now includes an `agents_ref` field to point at a shared agent file.
You can load and register those agents programmatically:

```python
from pathlib import Path
from genxai.core.graph import load_workflow_yaml, register_workflow_agents

workflow = load_workflow_yaml(Path("examples/nocode/content_generation.yaml"))
register_workflow_agents(workflow)
```
