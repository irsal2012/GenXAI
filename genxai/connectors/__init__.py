"""Connector SDK for GenXAI integrations."""

from genxai.connectors.base import Connector, ConnectorEvent, ConnectorStatus
from genxai.connectors.registry import ConnectorRegistry
from genxai.connectors.webhook import WebhookConnector
from genxai.connectors.kafka import KafkaConnector
from genxai.connectors.sqs import SQSConnector
from genxai.connectors.postgres_cdc import PostgresCDCConnector

__all__ = [
    "Connector",
    "ConnectorEvent",
    "ConnectorStatus",
    "ConnectorRegistry",
    "WebhookConnector",
    "KafkaConnector",
    "SQSConnector",
    "PostgresCDCConnector",
]