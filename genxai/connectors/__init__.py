"""Connector SDK for GenXAI integrations."""

from genxai.connectors.base import Connector, ConnectorEvent, ConnectorStatus
from genxai.connectors.registry import ConnectorRegistry
from genxai.connectors.webhook import WebhookConnector

__all__ = [
    "Connector",
    "ConnectorEvent",
    "ConnectorStatus",
    "ConnectorRegistry",
    "WebhookConnector",
]