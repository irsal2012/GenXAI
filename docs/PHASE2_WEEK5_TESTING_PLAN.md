# Phase 2 Week 5: Unit Testing Implementation Plan

**Date:** January 30, 2026  
**Status:** In Progress  
**Goal:** Achieve 80% test coverage with comprehensive unit tests

---

## Current Test Status

### Test Results Summary
- **Total Tests:** 131
- **Passed:** 90 (69%)
- **Failed:** 19 (14%)
- **Errors:** 22 (17%)
- **Current Coverage:** 25%

### Coverage Breakdown by Module
- **High Coverage (>50%):**
  - `genxai/utils/tokens.py`: 100%
  - `genxai/llm/base.py`: 100%
  - `genxai/tools/registry.py`: 47%
  
- **Medium Coverage (25-50%):**
  - `genxai/core/agent/runtime.py`: 42%
  - `genxai/core/agent/base.py`: 38%
  - `genxai/llm/factory.py`: 35%
  
- **Low Coverage (<25%):**
  - `genxai/core/graph/*`: 0-20%
  - `genxai/core/memory/*`: 0-15%
  - `genxai/tools/builtin/*`: 0-30%
  - `genxai/core/state/*`: 0%

---

## Phase 2 Week 5 Tasks

### Priority 1: Fix Existing Test Failures (Days 1-2)

#### 1.1 Agent Runtime Memory Tests
**Files:** `tests/unit/test_agent_runtime.py`
**Failures:**
- `test_execute_with_memory` - Memory not being stored
- `test_memory_context_formatting` - Type error in memory retrieval
- `test_memory_update_after_execution` - Memory storage not working
- `test_stream_memory_update` - Memory not updated after streaming
- `test_execution_count_tracking` - Execution count not incrementing

**Action Items:**
- [ ] Fix `AgentRuntime.set_memory()` implementation
- [ ] Implement `AgentRuntime.get_memory_context()` method
- [ ] Fix memory storage after execution
- [ ] Add execution count tracking in `Agent` class

#### 1.2 LLM Provider Tests
**Files:** `tests/unit/test_anthropic_provider.py`, `test_google_provider.py`, `test_cohere_provider.py`
**Errors:** AttributeError in mock setup (22 errors)

**Action Items:**
- [ ] Fix mock client setup for Anthropic provider
- [ ] Fix mock model setup for Google provider
- [ ] Fix mock client setup for Cohere provider
- [ ] Update test fixtures to match actual API structure

#### 1.3 Tool Integration Tests
**Files:** `tests/unit/test_tool_integration.py`
**Failures:**
- `test_parse_json_tool_calls` - Tool call parsing not implemented
- `test_parse_multiple_tool_calls` - Multiple tool parsing fails
- `test_tool_chaining` - Tool chaining not working
- `test_full_tool_integration` - End-to-end tool integration fails

**Action Items:**
- [ ] Implement `AgentRuntime._parse_tool_calls()` method
- [ ] Implement `AgentRuntime._execute_tool()` method
- [ ] Add tool chaining support
- [ ] Fix tool result formatting

#### 1.4 Token Management Tests
**Files:** `tests/unit/test_tokens.py`
**Failures:**
- `test_manage_context_window_truncation` - Context truncation not working
- `test_context_window_priority` - Priority-based truncation fails

**Action Items:**
- [ ] Fix context window management in `manage_context_window()`
- [ ] Implement priority-based truncation

---

### Priority 2: Add Missing Unit Tests (Days 3-4)

#### 2.1 Graph Components Tests
**Target Coverage:** 80%
**Files to Create:**
- `tests/unit/test_graph_engine.py` (new)
- `tests/unit/test_graph_executor.py` (new)
- `tests/unit/test_graph_nodes.py` (new)
- `tests/unit/test_graph_edges.py` (new)

**Test Cases:**
- [ ] Graph engine initialization
- [ ] Node execution with real agents
- [ ] Conditional edge evaluation
- [ ] Parallel execution
- [ ] Cycle detection and handling
- [ ] State management between nodes
- [ ] Error handling and rollback
- [ ] Checkpointing

#### 2.2 Memory System Tests
**Target Coverage:** 80%
**Files to Create:**
- `tests/unit/test_memory_manager.py` (new)
- `tests/unit/test_short_term_memory.py` (new)
- `tests/unit/test_long_term_memory.py` (new)
- `tests/unit/test_semantic_memory.py` (new)
- `tests/unit/test_episodic_memory.py` (new)
- `tests/unit/test_working_memory.py` (new)
- `tests/unit/test_procedural_memory.py` (new)
- `tests/unit/test_vector_store.py` (new)
- `tests/unit/test_embedding.py` (new)

**Test Cases:**
- [ ] Memory storage and retrieval
- [ ] Memory consolidation
- [ ] Similarity search
- [ ] Memory importance scoring
- [ ] Memory decay
- [ ] Cross-memory type queries
- [ ] Vector store operations
- [ ] Embedding generation

#### 2.3 State Management Tests
**Target Coverage:** 80%
**Files to Create:**
- `tests/unit/test_state_manager.py` (new)
- `tests/unit/test_state_schema.py` (new)

**Test Cases:**
- [ ] State initialization
- [ ] State updates
- [ ] State validation with Pydantic
- [ ] State serialization
- [ ] State history tracking
- [ ] State rollback

#### 2.4 Tool System Tests
**Target Coverage:** 60% (many tools require external services)
**Files to Create:**
- `tests/unit/test_tool_base.py` (new)
- `tests/unit/test_tool_registry.py` (enhance existing)
- `tests/unit/test_dynamic_tools.py` (new)
- `tests/unit/test_tool_security.py` (new)

**Test Cases:**
- [ ] Tool registration and discovery
- [ ] Tool execution with mocks
- [ ] Tool parameter validation
- [ ] Tool error handling
- [ ] Dynamic tool creation
- [ ] Tool sandboxing
- [ ] Rate limiting
- [ ] Tool result caching

---

### Priority 3: Integration Tests (Day 5)

#### 3.1 End-to-End Workflow Tests
**File:** `tests/integration/test_workflow_execution.py` (new)

**Test Cases:**
- [ ] Simple sequential workflow
- [ ] Parallel execution workflow
- [ ] Conditional branching workflow
- [ ] Cyclic workflow with iteration limits
- [ ] Multi-agent collaboration
- [ ] Workflow with tool usage
- [ ] Workflow with memory persistence
- [ ] Error recovery in workflows

#### 3.2 Agent-Tool-Memory Integration
**File:** `tests/integration/test_agent_tools_memory.py` (new)

**Test Cases:**
- [ ] Agent uses tool and stores result in memory
- [ ] Agent retrieves past tool results from memory
- [ ] Agent chains multiple tools
- [ ] Agent learns from past tool failures
- [ ] Memory-guided tool selection

#### 3.3 Multi-LLM Provider Tests
**File:** `tests/integration/test_multi_llm.py` (new)

**Test Cases:**
- [ ] Switch between providers mid-workflow
- [ ] Fallback to different provider on failure
- [ ] Compare outputs across providers
- [ ] Cost optimization across providers

---

## Test Infrastructure Improvements

### 1. Test Fixtures
**File:** `tests/conftest.py` (new)

```python
# Shared fixtures for all tests
- mock_llm_provider
- mock_memory_system
- mock_vector_store
- sample_agent_config
- sample_workflow_graph
- mock_tool_registry
```

### 2. Mock Utilities
**File:** `tests/mocks/__init__.py` (new)

```python
# Reusable mocks
- MockLLMProvider
- MockMemorySystem
- MockVectorStore
- MockTool
- MockEmbedding
```

### 3. Test Data
**Directory:** `tests/fixtures/` (new)

```
- sample_prompts.json
- sample_llm_responses.json
- sample_tool_outputs.json
- sample_memory_data.json
- sample_workflows.json
```

---

## Coverage Goals

### By End of Week 5
- **Overall Coverage:** 80%
- **Core Modules:** 90%+
  - `genxai/core/agent/`
  - `genxai/core/graph/`
  - `genxai/core/memory/`
  - `genxai/core/state/`
- **LLM Providers:** 85%+
- **Tools:** 60%+ (limited by external dependencies)
- **Utilities:** 95%+

---

## Testing Best Practices

### 1. Test Structure
```python
# Arrange - Set up test data and mocks
# Act - Execute the code under test
# Assert - Verify the results
```

### 2. Naming Convention
```python
def test_<component>_<scenario>_<expected_result>():
    """Test that <component> <expected_result> when <scenario>."""
```

### 3. Mock External Dependencies
- Always mock LLM API calls
- Mock database connections
- Mock file system operations
- Mock network requests

### 4. Test Independence
- Each test should be independent
- Use fixtures for setup/teardown
- Don't rely on test execution order

### 5. Async Testing
```python
@pytest.mark.asyncio
async def test_async_function():
    result = await async_function()
    assert result is not None
```

---

## Daily Progress Tracking

### Day 1: Fix Agent Runtime Tests
- [ ] Fix memory integration tests (4 tests)
- [ ] Fix execution count tracking (1 test)
- [ ] Run tests: `pytest tests/unit/test_agent_runtime.py -v`

### Day 2: Fix LLM Provider Tests
- [ ] Fix Anthropic provider mocks (6 tests)
- [ ] Fix Google provider mocks (6 tests)
- [ ] Fix Cohere provider mocks (8 tests)
- [ ] Fix tool integration tests (6 tests)
- [ ] Run tests: `pytest tests/unit/test_*_provider.py -v`

### Day 3: Graph and State Tests
- [ ] Create graph engine tests (20 tests)
- [ ] Create graph executor tests (15 tests)
- [ ] Create state manager tests (10 tests)
- [ ] Run tests: `pytest tests/unit/test_graph*.py tests/unit/test_state*.py -v`

### Day 4: Memory System Tests
- [ ] Create memory manager tests (15 tests)
- [ ] Create individual memory type tests (30 tests)
- [ ] Create vector store tests (10 tests)
- [ ] Run tests: `pytest tests/unit/test_memory*.py -v`

### Day 5: Integration Tests
- [ ] Create workflow execution tests (8 tests)
- [ ] Create agent-tool-memory tests (5 tests)
- [ ] Create multi-LLM tests (4 tests)
- [ ] Run full test suite: `pytest tests/ -v --cov=genxai`
- [ ] Generate coverage report: `pytest tests/ --cov=genxai --cov-report=html`

---

## Success Criteria

### Week 5 Complete When:
- [ ] All existing test failures fixed (19 failures, 22 errors)
- [ ] 80%+ overall code coverage achieved
- [ ] 90%+ coverage on core modules
- [ ] All integration tests passing
- [ ] Coverage report generated and reviewed
- [ ] Test documentation updated

---

## Next Steps (Week 6)

After completing Week 5:
1. Performance benchmarking tests
2. Load testing for workflows
3. Security testing for tools
4. End-to-end example applications
5. Documentation of test patterns

---

**Last Updated:** January 30, 2026  
**Status:** Ready to implement
