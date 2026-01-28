"""Metrics collection for GenXAI."""

from typing import Dict, Any, Optional
from collections import defaultdict
from datetime import datetime
import time


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


# Global metrics collector
_global_metrics = MetricsCollector()


def get_metrics_collector() -> MetricsCollector:
    """Get global metrics collector.

    Returns:
        Global metrics collector instance
    """
    return _global_metrics
