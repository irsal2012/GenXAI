# No-Code Workflow Templates

These YAML templates are designed for the GenXAI Studio and CLI to provide
quick-start, visual workflows without writing code.

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
