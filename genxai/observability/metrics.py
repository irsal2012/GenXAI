"""Metrics collection for GenXAI with Prometheus support."""

from typing import Dict, Any, Optional
from collections import defaultdict
from datetime import datetime
import time

try:
    from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry, generate_latest
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False


class MetricsCollector:
    """Collect and track metrics for GenXAI components."""

    def __init__(self) -> None:
        """Initialize metrics collector."""
        self._counters: Dict[str, int] = defaultdict(int)
        self._gauges: Dict[str, float] = {}
        self._histograms: Dict[str, list[float]] = defaultdict(list)
        self._timers: Dict[str, float] = {}

    def increment(self, metric: str, value: int = 1, tags: Optional[Dict[str, str]] = None) -> None:
        """Increment a counter metric.

        Args:
            metric: Metric name
            value: Value to increment by
            tags: Optional tags for the metric
        """
        key = self._make_key(metric, tags)
        self._counters[key] += value

    def gauge(self, metric: str, value: float, tags: Optional[Dict[str, str]] = None) -> None:
        """Set a gauge metric.

        Args:
            metric: Metric name
            value: Gauge value
            tags: Optional tags for the metric
        """
        key = self._make_key(metric, tags)
        self._gauges[key] = value

    def histogram(self, metric: str, value: float, tags: Optional[Dict[str, str]] = None) -> None:
        """Record a histogram value.

        Args:
            metric: Metric name
            value: Value to record
            tags: Optional tags for the metric
        """
        key = self._make_key(metric, tags)
        self._histograms[key].append(value)

    def timing(self, metric: str, duration: float, tags: Optional[Dict[str, str]] = None) -> None:
        """Record a timing metric.

        Args:
            metric: Metric name
            duration: Duration in seconds
            tags: Optional tags for the metric
        """
        self.histogram(metric, duration, tags)

    def start_timer(self, metric: str) -> None:
        """Start a timer for a metric.

        Args:
            metric: Metric name
        """
        self._timers[metric] = time.time()

    def stop_timer(self, metric: str, tags: Optional[Dict[str, str]] = None) -> float:
        """Stop a timer and record the duration.

        Args:
            metric: Metric name
            tags: Optional tags for the metric

        Returns:
            Duration in seconds
        """
        if metric not in self._timers:
            return 0.0

        duration = time.time() - self._timers[metric]
        self.timing(metric, duration, tags)
        del self._timers[metric]
        return duration

    def get_counter(self, metric: str, tags: Optional[Dict[str, str]] = None) -> int:
        """Get counter value.

        Args:
            metric: Metric name
            tags: Optional tags

        Returns:
            Counter value
        """
        key = self._make_key(metric, tags)
        return self._counters.get(key, 0)

    def get_gauge(self, metric: str, tags: Optional[Dict[str, str]] = None) -> Optional[float]:
        """Get gauge value.

        Args:
            metric: Metric name
            tags: Optional tags

        Returns:
            Gauge value or None
        """
        key = self._make_key(metric, tags)
        return self._gauges.get(key)

    def get_histogram_stats(
        self, metric: str, tags: Optional[Dict[str, str]] = None
    ) -> Dict[str, float]:
        """Get histogram statistics.

        Args:
            metric: Metric name
            tags: Optional tags

        Returns:
            Statistics dictionary (count, sum, avg, min, max)
        """
        key = self._make_key(metric, tags)
        values = self._histograms.get(key, [])

        if not values:
            return {"count": 0, "sum": 0.0, "avg": 0.0, "min": 0.0, "max": 0.0}

        return {
            "count": len(values),
            "sum": sum(values),
            "avg": sum(values) / len(values),
            "min": min(values),
            "max": max(values),
        }

    def get_all_metrics(self) -> Dict[str, Any]:
        """Get all metrics.

        Returns:
            Dictionary of all metrics
        """
        return {
            "counters": dict(self._counters),
            "gauges": dict(self._gauges),
            "histograms": {
                key: self.get_histogram_stats(key.split(":")[0])
                for key in self._histograms.keys()
            },
        }

    def reset(self) -> None:
        """Reset all metrics."""
        self._counters.clear()
        self._gauges.clear()
        self._histograms.clear()
        self._timers.clear()

    def _make_key(self, metric: str, tags: Optional[Dict[str, str]] = None) -> str:
        """Create metric key with tags.

        Args:
            metric: Metric name
            tags: Optional tags

        Returns:
            Metric key
        """
        if not tags:
            return metric

        tag_str = ",".join(f"{k}={v}" for k, v in sorted(tags.items()))
        return f"{metric}:{tag_str}"


# Prometheus metrics (if available)
if PROMETHEUS_AVAILABLE:
    # Create registry
    registry = CollectorRegistry()
    
    # Agent execution metrics
    agent_executions_total = Counter(
        'genxai_agent_executions_total',
        'Total number of agent executions',
        ['agent_id', 'status'],
        registry=registry
    )
    
    agent_errors_total = Counter(
        'genxai_agent_errors_total',
        'Total number of agent errors',
        ['agent_id', 'error_type'],
        registry=registry
    )
    
    agent_execution_duration_seconds = Histogram(
        'genxai_agent_execution_duration_seconds',
        'Agent execution duration in seconds',
        ['agent_id'],
        buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0],
        registry=registry
    )
    
    agent_active_executions = Gauge(
        'genxai_agent_active_executions',
        'Number of currently active agent executions',
        ['agent_id'],
        registry=registry
    )
    
    # Tool usage metrics
    tool_calls_total = Counter(
        'genxai_tool_calls_total',
        'Total number of tool calls',
        ['tool_name', 'status'],
        registry=registry
    )
    
    tool_execution_duration_seconds = Histogram(
        'genxai_tool_execution_duration_seconds',
        'Tool execution duration in seconds',
        ['tool_name'],
        buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 5.0, 10.0],
        registry=registry
    )
    
    tool_errors_total = Counter(
        'genxai_tool_errors_total',
        'Total number of tool errors',
        ['tool_name', 'error_type'],
        registry=registry
    )
    
    # LLM metrics
    llm_requests_total = Counter(
        'genxai_llm_requests_total',
        'Total number of LLM requests',
        ['provider', 'model', 'status'],
        registry=registry
    )
    
    llm_tokens_total = Counter(
        'genxai_llm_tokens_total',
        'Total number of tokens used',
        ['provider', 'model', 'token_type'],
        registry=registry
    )
    
    llm_cost_total = Counter(
        'genxai_llm_cost_total',
        'Total estimated cost in USD',
        ['provider', 'model'],
        registry=registry
    )
    
    llm_request_duration_seconds = Histogram(
        'genxai_llm_request_duration_seconds',
        'LLM request duration in seconds',
        ['provider', 'model'],
        buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0],
        registry=registry
    )
    
    # Memory operation metrics
    memory_operations_total = Counter(
        'genxai_memory_operations_total',
        'Total number of memory operations',
        ['operation_type', 'memory_type', 'status'],
        registry=registry
    )
    
    memory_operation_duration_seconds = Histogram(
        'genxai_memory_operation_duration_seconds',
        'Memory operation duration in seconds',
        ['operation_type', 'memory_type'],
        buckets=[0.001, 0.01, 0.05, 0.1, 0.5, 1.0],
        registry=registry
    )
    
    memory_size_bytes = Gauge(
        'genxai_memory_size_bytes',
        'Current memory size in bytes',
        ['agent_id', 'memory_type'],
        registry=registry
    )
    
    # Workflow execution metrics
    workflow_executions_total = Counter(
        'genxai_workflow_executions_total',
        'Total number of workflow executions',
        ['workflow_id', 'status'],
        registry=registry
    )
    
    workflow_execution_duration_seconds = Histogram(
        'genxai_workflow_execution_duration_seconds',
        'Workflow execution duration in seconds',
        ['workflow_id'],
        buckets=[1.0, 5.0, 10.0, 30.0, 60.0, 300.0, 600.0],
        registry=registry
    )
    
    workflow_node_executions_total = Counter(
        'genxai_workflow_node_executions_total',
        'Total number of workflow node executions',
        ['workflow_id', 'node_id', 'status'],
        registry=registry
    )
    
    def get_prometheus_metrics() -> bytes:
        """Get Prometheus metrics in text format.
        
        Returns:
            Metrics in Prometheus text format
        """
        return generate_latest(registry)

else:
    # Stub metrics if Prometheus not available
    agent_executions_total = None
    agent_errors_total = None
    agent_execution_duration_seconds = None
    agent_active_executions = None
    tool_calls_total = None
    tool_execution_duration_seconds = None
    tool_errors_total = None
    llm_requests_total = None
    llm_tokens_total = None
    llm_cost_total = None
    llm_request_duration_seconds = None
    memory_operations_total = None
    memory_operation_duration_seconds = None
    memory_size_bytes = None
    workflow_executions_total = None
    workflow_execution_duration_seconds = None
    workflow_node_executions_total = None
    
    def get_prometheus_metrics() -> bytes:
        """Stub function when Prometheus not available."""
        return b"# Prometheus client not installed\n"


# Global metrics collector
_global_metrics = MetricsCollector()


def get_metrics_collector() -> MetricsCollector:
    """Get global metrics collector.

    Returns:
        Global metrics collector instance
    """
    return _global_metrics
