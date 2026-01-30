# GenXAI - Next Steps (Week 2)

**Current Status**: 33% test coverage, 135 tests passing
**Goal**: Reach 50% test coverage, fix remaining issues
**Timeline**: 5-7 days

---

## 🎯 Week 2 Priorities

### Priority 1: Reach 50% Test Coverage (HIGH)

**Current**: 33% (4,172/6,258 lines uncovered)
**Target**: 50% (need to cover 1,043 more lines)

#### Modules to Test (Ordered by Impact)

1. **Communication Layer** (87 lines, 0% coverage)
   - File: `genxai/core/communication/message_bus.py`
   - Tests needed: 10-15 tests
   - Impact: +1.4% coverage
   - Effort: 2-3 hours

2. **Graph Executor** (100+ lines, 0% coverage)
   - File: `genxai/core/graph/executor.py`
   - Tests needed: 15-20 tests
   - Impact: +1.6% coverage
   - Effort: 3-4 hours

3. **Tool Templates** (120 lines, 0% coverage)
   - File: `genxai/tools/templates.py`
   - Tests needed: 8-10 tests
   - Impact: +1.9% coverage
   - Effort: 2 hours

4. **Individual Tool Tests** (1000+ lines, ~20% coverage)
   - Files: `genxai/tools/builtin/*/`
   - Tests needed: 31 tool tests (one per tool)
   - Impact: +12% coverage
   - Effort: 1 day

5. **LLM Providers** (200+ lines, ~40% coverage)
   - Files: `genxai/llm/providers/*.py`
   - Tests needed: 20-25 tests
   - Impact: +3% coverage
   - Effort: 4 hours

6. **Memory Components** (300+ lines, ~30% coverage)
   - Files: `genxai/core/memory/*.py`
   - Tests needed: 25-30 tests
   - Impact: +4% coverage
   - Effort: 5 hours

7. **State Management** (50+ lines, ~20% coverage)
   - Files: `genxai/core/state/*.py`
   - Tests needed: 10 tests
   - Impact: +0.8% coverage
   - Effort: 2 hours

**Total Estimated Impact**: ~25% additional coverage
**Total Estimated Effort**: 3-4 days

---

## 📋 Detailed Task List

### Day 1: Communication & Graph Tests

**Morning (4 hours)**
- [ ] Create `tests/unit/test_message_bus.py`
  - Test message creation and sending
  - Test broadcast functionality
  - Test request-reply pattern
  - Test subscription/unsubscription
  - Test message history
- [ ] Create `tests/unit/test_graph_executor.py`
  - Test node execution
  - Test edge traversal
  - Test parallel execution
  - Test error handling

**Afternoon (4 hours)**
- [ ] Create `tests/unit/test_protocols.py`
  - Test communication protocols
  - Test negotiation patterns
- [ ] Run tests and verify coverage increase
- [ ] Fix any failing tests

**Expected Coverage**: 33% → 36%

---

### Day 2: Tool Tests (Part 1)

**Morning (4 hours)**
- [ ] Create `tests/unit/test_computation_tools.py`
  - Test CalculatorTool (already works)
  - Test CodeExecutorTool
  - Test DataValidatorTool
  - Test HashGeneratorTool
  - Test RegexMatcherTool

**Afternoon (4 hours)**
- [ ] Create `tests/unit/test_file_tools.py`
  - Test FileReaderTool (already works)
  - Test FileWriterTool
  - Test DirectoryScannerTool
  - Test FileCompressorTool
  - Test ImageProcessorTool
  - Test PDFParserTool

**Expected Coverage**: 36% → 40%

---

### Day 3: Tool Tests (Part 2)

**Morning (4 hours)**
- [ ] Create `tests/unit/test_web_tools.py`
  - Test WebScraperTool
  - Test APICallerTool
  - Test HTTPClientTool
  - Test HTMLParserTool
  - Test URLValidatorTool

**Afternoon (4 hours)**
- [ ] Create `tests/unit/test_database_tools.py`
  - Test SQLQueryTool
  - Test MongoDBQueryTool
  - Test RedisCacheTool
  - Test VectorSearchTool
  - Test DatabaseInspectorTool

**Expected Coverage**: 40% → 44%

---

### Day 4: Tool Tests (Part 3) & Memory

**Morning (4 hours)**
- [ ] Create `tests/unit/test_communication_tools.py`
  - Test EmailSenderTool
  - Test SlackNotifierTool
  - Test SMSSenderTool
  - Test WebhookCallerTool
  - Test NotificationManagerTool

- [ ] Create `tests/unit/test_data_tools.py`
  - Test JSONProcessorTool
  - Test CSVProcessorTool
  - Test XMLProcessorTool
  - Test TextAnalyzerTool
  - Test DataTransformerTool

**Afternoon (4 hours)**
- [ ] Enhance `tests/unit/test_memory_system.py`
  - Add episodic memory tests
  - Add semantic memory tests
  - Add procedural memory tests
  - Add memory consolidation tests
  - Add vector store integration tests

**Expected Coverage**: 44% → 48%

---

### Day 5: LLM Providers & Polish

**Morning (4 hours)**
- [ ] Enhance `tests/unit/test_anthropic_provider.py`
  - Add streaming tests
  - Add error handling tests
  - Add token counting tests

- [ ] Enhance `tests/unit/test_google_provider.py`
  - Add streaming tests
  - Add error handling tests

- [ ] Enhance `tests/unit/test_cohere_provider.py`
  - Add streaming tests
  - Add error handling tests

**Afternoon (4 hours)**
- [ ] Create `tests/unit/test_tool_templates.py`
  - Test template creation
  - Test template validation
  - Test template execution

- [ ] Run full test suite
- [ ] Fix all failing tests
- [ ] Generate coverage report

**Expected Coverage**: 48% → 50%+

---

## 🔧 Test Templates

### Template 1: Tool Test

```python
"""Tests for [ToolName]."""

import pytest
from genxai.tools.builtin.[category].[tool_file] import [ToolName]


@pytest.mark.asyncio
async def test_tool_initialization():
    """Test tool initialization."""
    tool = [ToolName]()
    assert tool.metadata.name == "[tool_name]"
    assert tool.metadata.category is not None


@pytest.mark.asyncio
async def test_tool_execution_success():
    """Test successful tool execution."""
    tool = [ToolName]()
    result = await tool.execute([params])
    assert result.success is True
    assert result.data is not None


@pytest.mark.asyncio
async def test_tool_execution_error():
    """Test tool execution with invalid input."""
    tool = [ToolName]()
    result = await tool.execute([invalid_params])
    assert result.success is False
    assert result.error is not None


def test_tool_metadata():
    """Test tool metadata."""
    tool = [ToolName]()
    assert len(tool.metadata.description) > 0
    assert len(tool.metadata.tags) > 0
    assert len(tool.parameters) > 0
```

### Template 2: Integration Test

```python
"""Integration test for [feature]."""

import pytest
from genxai.core.[module] import [Class]


@pytest.mark.integration
@pytest.mark.asyncio
async def test_[feature]_integration():
    """Test [feature] integration."""
    # Setup
    instance = [Class]()
    
    # Execute
    result = await instance.[method]([params])
    
    # Verify
    assert result is not None
    assert [condition]
```

---

## 📊 Success Metrics

### Coverage Targets
- [ ] Overall coverage: 50%+
- [ ] Core modules: 60%+
- [ ] Tools: 40%+
- [ ] LLM providers: 60%+

### Test Targets
- [ ] Total tests: 200+
- [ ] Unit tests: 180+
- [ ] Integration tests: 20+
- [ ] Pass rate: 95%+

### Quality Targets
- [ ] No import errors
- [ ] No collection errors
- [ ] All critical paths tested
- [ ] Edge cases covered

---

## 🚀 Commands to Run

### Run All Tests
```bash
python -m pytest tests/ -v
```

### Run with Coverage
```bash
python -m pytest tests/unit --cov=genxai --cov-report=html --cov-report=term
```

### Run Specific Test File
```bash
python -m pytest tests/unit/test_[name].py -v
```

### View Coverage Report
```bash
open htmlcov/index.html
```

### Run Only Fast Tests
```bash
python -m pytest tests/unit -v -m "not slow"
```

---

## 🐛 Known Issues to Fix

1. **Memory System Tests Failing** (2 tests)
   - `test_add_to_short_term` - pydantic_core error
   - `test_clear_short_term` - pydantic_core error
   - Fix: Update test to match actual API

2. **Integration Test Error**
   - `test_workflow_integration.py` - WorkflowEngine import
   - Fix: Update imports or create missing class

3. **Pydantic Deprecation Warnings**
   - Multiple files using old Config class
   - Fix: Migrate to ConfigDict (low priority)

---

## 📝 After Week 2

Once 50% coverage is achieved:

### Week 3-4: Production Features
- [ ] Implement Prometheus metrics
- [ ] Implement OpenTelemetry tracing
- [ ] Create Grafana dashboards
- [ ] Add basic security (rate limiting, validation)

### Week 5-6: Deployment
- [ ] Publish to PyPI
- [ ] Create Docker images
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Create Kubernetes manifests

### Week 7-8: Documentation & Launch
- [ ] Complete API documentation
- [ ] Create video tutorials
- [ ] Write blog posts
- [ ] Launch on Hacker News

---

## 💡 Tips for Success

1. **Start with Easy Wins**: Test simple tools first (calculator, file_reader)
2. **Use Test Templates**: Copy and modify existing tests
3. **Mock External Services**: Don't require real APIs for unit tests
4. **Run Tests Frequently**: Catch issues early
5. **Focus on Coverage**: Prioritize high-impact modules
6. **Fix Failures Immediately**: Don't accumulate technical debt
7. **Document Edge Cases**: Add comments for tricky tests

---

## 🎯 Daily Checklist

Each day:
- [ ] Write 15-20 new tests
- [ ] Run full test suite
- [ ] Fix any failing tests
- [ ] Check coverage increase
- [ ] Commit changes
- [ ] Update this document

---

**Let's reach 50% coverage! 🚀**
