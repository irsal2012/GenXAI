# Phase 2 Week 6: Integration Testing Plan

**Date**: January 30, 2026  
**Status**: Planning  
**Goal**: Create comprehensive integration tests and performance baselines

---

## Overview

Week 6 focuses on integration testing - testing complete workflows with real components working together. This validates that all the pieces we've built actually work in realistic scenarios.

---

## Integration Test Categories

### 1. Complete Workflow Tests
**Goal**: Test end-to-end agent workflows with real LLMs

**Tests to Create**:
- [ ] `test_simple_agent_workflow` - Single agent with LLM
- [ ] `test_multi_agent_workflow` - Multiple agents collaborating
- [ ] `test_sequential_workflow` - Agents executing in sequence
- [ ] `test_parallel_workflow` - Agents executing in parallel
- [ ] `test_conditional_workflow` - Workflow with branching logic
- [ ] `test_cyclic_workflow` - Workflow with loops/iterations

**File**: `tests/integration/test_workflow_integration.py`

---

### 2. Agent-Tool Integration Tests
**Goal**: Test agents using real tools in workflows

**Tests to Create**:
- [ ] `test_agent_with_web_tools` - Web scraping + API calls
- [ ] `test_agent_with_data_tools` - JSON/CSV processing
- [ ] `test_agent_with_file_tools` - File operations
- [ ] `test_agent_with_computation_tools` - Code execution, regex
- [ ] `test_agent_with_database_tools` - Database queries
- [ ] `test_agent_with_communication_tools` - Email, Slack, webhooks
- [ ] `test_tool_chaining` - Multiple tools in sequence
- [ ] `test_tool_error_handling` - Tool failures and recovery

**File**: `tests/integration/test_agent_tools_integration.py`

---

### 3. Memory Persistence Tests
**Goal**: Test memory storage and retrieval across sessions

**Tests to Create**:
- [ ] `test_short_term_memory_persistence` - Recent interactions
- [ ] `test_long_term_memory_persistence` - Redis storage
- [ ] `test_episodic_memory_persistence` - Episode storage
- [ ] `test_semantic_memory_persistence` - Fact storage
- [ ] `test_vector_store_persistence` - Embedding storage
- [ ] `test_memory_retrieval_accuracy` - Similarity search
- [ ] `test_memory_consolidation` - Short to long term
- [ ] `test_cross_session_memory` - Memory across restarts

**File**: `tests/integration/test_memory_persistence.py`

---

### 4. LLM Provider Tests
**Goal**: Test all LLM providers with real API calls

**Tests to Create**:
- [ ] `test_openai_provider_integration` - OpenAI API
- [ ] `test_anthropic_provider_integration` - Anthropic API
- [ ] `test_google_provider_integration` - Google API
- [ ] `test_cohere_provider_integration` - Cohere API
- [ ] `test_provider_failover` - Switch providers on failure
- [ ] `test_provider_streaming` - Streaming responses
- [ ] `test_provider_token_limits` - Handle token limits
- [ ] `test_provider_rate_limits` - Handle rate limits

**File**: `tests/integration/test_llm_providers.py`

---

### 5. Vector Store Tests
**Goal**: Test vector database integrations

**Tests to Create**:
- [ ] `test_chromadb_integration` - ChromaDB operations
- [ ] `test_pinecone_integration` - Pinecone operations (if available)
- [ ] `test_weaviate_integration` - Weaviate operations (if available)
- [ ] `test_embedding_generation` - Create embeddings
- [ ] `test_similarity_search` - Find similar items
- [ ] `test_vector_store_performance` - Query speed
- [ ] `test_large_dataset_handling` - 10K+ vectors

**File**: `tests/integration/test_vector_stores.py`

---

### 6. Database Tool Tests
**Goal**: Test database tools with real databases

**Tests to Create**:
- [ ] `test_sql_query_tool` - SQLite/PostgreSQL queries
- [ ] `test_redis_cache_tool` - Redis operations
- [ ] `test_mongodb_query_tool` - MongoDB operations
- [ ] `test_vector_search_tool` - Vector DB queries
- [ ] `test_database_transactions` - ACID properties
- [ ] `test_connection_pooling` - Connection reuse
- [ ] `test_query_timeout` - Long-running queries

**File**: `tests/integration/test_database_tools.py`

---

### 7. Communication Tool Tests
**Goal**: Test communication tools with real services

**Tests to Create**:
- [ ] `test_email_sender_tool` - Send test emails
- [ ] `test_slack_notifier_tool` - Send Slack messages
- [ ] `test_webhook_caller_tool` - Call webhooks
- [ ] `test_sms_sender_tool` - Send SMS (if configured)
- [ ] `test_notification_manager` - Multi-channel notifications
- [ ] `test_retry_on_failure` - Retry failed sends
- [ ] `test_rate_limiting` - Respect API limits

**File**: `tests/integration/test_communication_tools.py`

---

## Performance Benchmarks

### Agent Execution Benchmarks
**Goal**: Establish baseline performance metrics

**Benchmarks to Create**:
- [ ] `benchmark_agent_execution_time` - Time to complete task
- [ ] `benchmark_llm_response_time` - LLM API latency
- [ ] `benchmark_tool_execution_time` - Tool execution speed
- [ ] `benchmark_memory_operations` - Memory read/write speed
- [ ] `benchmark_graph_execution` - Workflow execution time
- [ ] `benchmark_parallel_execution` - Parallel vs sequential
- [ ] `benchmark_token_usage` - Tokens per task
- [ ] `benchmark_cost_per_task` - Estimated cost

**File**: `tests/integration/benchmarks.py`

**Target Metrics**:
- Agent response time: < 2s (excluding LLM)
- LLM response time: < 5s (depends on provider)
- Tool execution: < 1s per tool
- Memory operations: < 100ms
- Graph execution: < 10s for 10-node workflow

---

## Test Infrastructure

### Setup Requirements
```python
# tests/integration/conftest.py

import pytest
import os
from genxai.llm.factory import LLMFactory
from genxai.core.memory.manager import MemorySystem
from genxai.tools.registry import ToolRegistry

@pytest.fixture(scope="session")
def llm_provider():
    """Create real LLM provider for integration tests."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        pytest.skip("OPENAI_API_KEY not set")
    return LLMFactory.create("openai", api_key=api_key)

@pytest.fixture
def memory_system():
    """Create memory system with real storage."""
    return MemorySystem(agent_id="test_agent")

@pytest.fixture
def tool_registry():
    """Create tool registry with all tools."""
    registry = ToolRegistry()
    registry.discover_tools()
    return registry
```

### Environment Variables
```bash
# .env.test
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
COHERE_API_KEY=...
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017
PINECONE_API_KEY=...
SLACK_WEBHOOK_URL=...
```

---

## Test Execution Strategy

### 1. Local Development
```bash
# Run all integration tests
pytest tests/integration/ -v

# Run specific category
pytest tests/integration/test_workflow_integration.py -v

# Run with coverage
pytest tests/integration/ --cov=genxai --cov-report=html

# Run benchmarks
pytest tests/integration/benchmarks.py -v --benchmark-only
```

### 2. CI/CD Pipeline
```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration:
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:7
        ports:
          - 6379:6379
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -e ".[dev]"
      
      - name: Run integration tests
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          pytest tests/integration/ -v --cov=genxai
```

### 3. Nightly Tests
- Run full integration suite nightly
- Test against all LLM providers
- Test with large datasets
- Generate performance reports

---

## Success Criteria

### Coverage Targets
- [ ] 80%+ code coverage (combined unit + integration)
- [ ] All critical paths tested
- [ ] All LLM providers tested
- [ ] All tool categories tested
- [ ] All memory types tested

### Performance Targets
- [ ] Agent response < 2s
- [ ] LLM response < 5s
- [ ] Tool execution < 1s
- [ ] Memory operations < 100ms
- [ ] No memory leaks
- [ ] No connection leaks

### Reliability Targets
- [ ] 99%+ test pass rate
- [ ] No flaky tests
- [ ] Proper error handling
- [ ] Graceful degradation
- [ ] Retry logic working

---

## Timeline

### Day 1-2: Workflow Integration Tests
- Create workflow test infrastructure
- Implement 6 workflow tests
- Test with real LLMs

### Day 3-4: Tool Integration Tests
- Test all 31 tools with agents
- Test tool chaining
- Test error handling

### Day 4-5: Memory & Provider Tests
- Test memory persistence
- Test all LLM providers
- Test vector stores

### Day 6-7: Performance & Polish
- Run benchmarks
- Identify bottlenecks
- Optimize slow paths
- Document results

---

## Deliverables

1. **Integration Test Suite**
   - 50+ integration tests
   - All critical paths covered
   - Real API integrations

2. **Performance Baselines**
   - Benchmark results
   - Performance report
   - Optimization recommendations

3. **Documentation**
   - Test execution guide
   - CI/CD setup guide
   - Performance analysis

4. **CI/CD Pipeline**
   - Automated testing
   - Coverage reporting
   - Performance tracking

---

## Next Steps

1. Set up test infrastructure
2. Create integration test files
3. Implement workflow tests
4. Implement tool tests
5. Run benchmarks
6. Document results
7. Move to Week 7 (Examples)

---

**Status**: Ready to implement  
**Priority**: HIGH  
**Estimated Effort**: 5-7 days
