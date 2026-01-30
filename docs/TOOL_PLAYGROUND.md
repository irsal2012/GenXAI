# Tool Playground Documentation

## Overview

The **Tool Playground** is an interactive testing environment within the GenXAI Studio that allows users to experiment with tools in real-time. It provides a safe sandbox for testing tool functionality, validating parameters, and understanding tool behavior before integrating them into agents or workflows.

## Features

### 🎯 Core Capabilities

- **Interactive Tool Testing**: Execute any registered tool with custom parameters
- **Real-time Results**: See execution results immediately with formatted output
- **Execution History**: Track and review past executions (last 50 runs)
- **Performance Metrics**: Monitor execution time and success rates
- **Rate Limiting**: Built-in protection against excessive executions
- **Error Handling**: Clear, categorized error messages with suggestions
- **Security Sandboxing**: Safe execution environment for dynamic code

### 🔒 Security Features

The Tool Playground implements multiple layers of security:

1. **RestrictedPython**: Dynamic code execution uses RestrictedPython for safe evaluation
2. **Execution Timeouts**: Maximum 30-second execution time (configurable)
3. **Rate Limiting**: 
   - 60 executions per minute per tool
   - 1000 executions per hour per tool
4. **Sandboxed Environment**: Limited access to system resources and built-in functions
5. **Input Validation**: Parameter validation before execution

## User Guide

### Getting Started

1. **Navigate to Playground**: Click "Playground" in the Studio sidebar
2. **Select a Tool**: Choose from the list of available tools
3. **Configure Parameters**: Fill in required and optional parameters
4. **Execute**: Click "Execute Tool" to run the tool
5. **View Results**: See execution results, metrics, and any errors

### Understanding the Interface

#### Tool Selection Panel (Left)
- Browse all available tools
- Filter by category
- See tool names and categories at a glance

#### Configuration Panel (Right)
- **Tool Info**: Name, description, category, and tags
- **Parameters**: Dynamic form based on tool schema
  - Required parameters marked with *
  - Type-specific inputs (text, number, boolean, etc.)
  - Parameter descriptions and constraints
- **Execute Button**: Runs the tool with current parameters

#### Results Section
- **Execution Metrics**: Time, success status, rate limit stats
- **Result Display**: JSON-formatted output
- **Error Display**: Categorized errors with helpful suggestions

#### Execution History
- **Recent Runs**: Last 50 executions stored locally
- **Re-run**: Quickly re-execute with same parameters
- **Details**: Expand to see parameters, results, and errors
- **Clear**: Remove all history

### Parameter Types

The playground supports various parameter types:

| Type | Input | Example |
|------|-------|---------|
| `string` | Text input | "Hello World" |
| `number` | Number input | 42, 3.14 |
| `boolean` | Dropdown | true/false |
| `enum` | Dropdown | Predefined options |

### Execution Metrics

After each execution, you'll see:

- **Execution Time**: How long the tool took to run
- **Success Status**: Whether execution succeeded or failed
- **Rate Limits**: Current usage vs. limits
  - Per-minute usage (60 max)
  - Per-hour usage (1000 max)

### Error Types

The playground categorizes errors for better understanding:

1. **Validation Error** (Yellow)
   - Invalid parameters
   - Missing required fields
   - Type mismatches

2. **Runtime Error** (Red)
   - Errors during execution
   - Logic errors in tool code
   - Unexpected exceptions

3. **Timeout Error** (Orange)
   - Execution exceeded 30 seconds
   - Long-running operations

4. **Rate Limit Error** (Purple)
   - Too many executions
   - Need to wait before retrying

## Developer Guide

### Creating Playground-Compatible Tools

Tools must follow the GenXAI Tool interface:

```python
from genxai.tools.base import Tool, ToolMetadata, ToolParameter, ToolCategory

class MyTool(Tool):
    def __init__(self):
        metadata = ToolMetadata(
            name="my_tool",
            description="Description of what the tool does",
            category=ToolCategory.CUSTOM,
            tags=["tag1", "tag2"],
        )
        
        parameters = [
            ToolParameter(
                name="param1",
                type="string",
                description="Parameter description",
                required=True,
            ),
        ]
        
        super().__init__(metadata, parameters)
    
    async def _execute(self, **kwargs):
        # Tool logic here
        return {"result": "value"}
```

### API Endpoint

The playground uses the `/tools/{tool_name}/execute` endpoint:

**Request:**
```json
POST /tools/simple_math/execute
{
  "operation": "add",
  "a": 5,
  "b": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "operation": "add",
    "a": 5,
    "b": 3,
    "result": 8
  },
  "error": null,
  "execution_time": 0.002,
  "metadata": {
    "tool": "simple_math",
    "version": "1.0.0"
  },
  "rate_limit_stats": {
    "executions_last_minute": 1,
    "executions_last_hour": 1,
    "max_per_minute": 60,
    "max_per_hour": 1000,
    "remaining_minute": 59,
    "remaining_hour": 999
  }
}
```

### Test Tools

GenXAI includes built-in test tools for validation:

1. **simple_math**: Basic arithmetic operations
2. **string_processor**: String manipulation
3. **data_transformer**: JSON/data operations
4. **async_simulator**: Test async and timeout handling
5. **error_generator**: Test error handling

## Security Documentation

### Sandboxing Details

Dynamic tools execute in a restricted environment:

**Allowed Built-ins:**
- Basic types: `int`, `float`, `str`, `bool`, `list`, `dict`, `tuple`
- Math functions: `abs`, `min`, `max`, `sum`, `round`
- Iteration: `range`, `enumerate`, `zip`, `sorted`
- Type checking: `isinstance`, `type`, `hasattr`

**Restricted:**
- File I/O operations
- Network access
- System calls
- Import statements (except safe modules)
- Dangerous built-ins (`eval`, `exec`, `compile`, `__import__`)

### Timeout Configuration

Default timeout: **30 seconds**

To customize timeout for a dynamic tool:

```python
tool = DynamicTool(metadata, parameters, code, timeout=60)
```

### Rate Limiting Configuration

Configure global rate limits:

```python
from genxai.tools.security.limits import ExecutionLimiter, set_global_limiter

limiter = ExecutionLimiter(
    max_executions_per_minute=100,
    max_executions_per_hour=2000
)
set_global_limiter(limiter)
```

### Best Practices

1. **Parameter Validation**: Always validate inputs before processing
2. **Error Handling**: Use try-except blocks for robust error handling
3. **Timeouts**: Keep operations under 30 seconds
4. **Resource Usage**: Avoid memory-intensive operations
5. **Security**: Never trust user input, always sanitize

## Troubleshooting

### Common Issues

**Issue: "Tool not found"**
- Solution: Ensure tool is registered in ToolRegistry
- Check tool name spelling

**Issue: "Rate limit exceeded"**
- Solution: Wait before retrying
- Check rate limit stats in metrics

**Issue: "Execution timeout"**
- Solution: Optimize tool code
- Reduce operation complexity
- Consider breaking into smaller operations

**Issue: "Invalid parameters"**
- Solution: Check parameter types and requirements
- Review tool schema
- Ensure all required parameters are provided

**Issue: "RestrictedPython not available"**
- Solution: Install with `pip install RestrictedPython`
- Or install tools extras: `pip install -e '.[tools]'`

### Performance Optimization

1. **Minimize Execution Time**: Keep operations fast
2. **Cache Results**: Store frequently used data
3. **Batch Operations**: Combine multiple operations when possible
4. **Async Operations**: Use async/await for I/O-bound tasks

### Debugging Tips

1. **Use Error Generator**: Test error handling with `error_generator` tool
2. **Check Execution History**: Review past runs for patterns
3. **Monitor Metrics**: Watch execution times and success rates
4. **Test Incrementally**: Start with simple parameters, add complexity
5. **Review Logs**: Check backend logs for detailed error information

## Advanced Features

### Execution History Management

History is stored in browser localStorage:

```javascript
// Access history
const history = localStorage.getItem('tool_execution_history')

// Clear history
localStorage.removeItem('tool_execution_history')
```

### Custom Error Messages

Provide helpful error messages in your tools:

```python
if value < 0:
    raise ValueError("Value must be non-negative. Received: {value}")
```

### Parameter Constraints

Use parameter constraints for better validation:

```python
ToolParameter(
    name="age",
    type="number",
    description="Age in years",
    required=True,
    min_value=0,
    max_value=150,
)
```

## API Reference

### Frontend Components

- `ToolPlaygroundPage`: Main playground interface
- `ExecutionHistoryPanel`: History display and management
- `ExecutionMetrics`: Performance metrics visualization
- `ErrorDisplay`: Categorized error display

### Backend Endpoints

- `POST /tools/{tool_name}/execute`: Execute a tool
- `GET /tools`: List all tools
- `GET /tools/{tool_name}`: Get tool details

### Security Modules

- `SafeExecutor`: Sandboxed code execution
- `ExecutionLimiter`: Rate limiting and monitoring
- `ResourceLimits`: Resource constraint configuration

## FAQ

**Q: Can I execute tools without the playground?**
A: Yes, tools can be executed programmatically via the API or in workflows.

**Q: Are execution results stored permanently?**
A: No, history is stored in browser localStorage (last 50 runs).

**Q: Can I increase rate limits?**
A: Yes, configure `ExecutionLimiter` with custom limits.

**Q: Is my code safe to execute?**
A: Dynamic code runs in a sandboxed environment with RestrictedPython.

**Q: Can I export execution history?**
A: Currently, history is stored locally. Export feature coming soon.

**Q: What happens if execution exceeds timeout?**
A: Execution is terminated and a timeout error is returned.

## Support

For issues or questions:
- GitHub Issues: https://github.com/genxai/genxai/issues
- Documentation: https://docs.genxai.dev
- Report bugs: Use `/reportbug` command in Studio

## Changelog

### Version 1.0.0
- Initial release
- Basic tool execution
- Execution history
- Rate limiting
- Security sandboxing
- Error categorization
- Performance metrics
