"""Connector SDK for GenXAI integrations."""

from genxai.connectors.base import Connector, ConnectorEvent, ConnectorStatus
from genxai.connectors.registry import ConnectorRegistry
from genxai.connectors.webhook import WebhookConnector
from genxai.connectors.kafka import KafkaConnector
from genxai.connectors.sqs import SQSConnector
from genxai.connectors.postgres_cdc import PostgresCDCConnector
from genxai.connectors.slack import SlackConnector
from genxai.connectors.github import GitHubConnector
from genxai.connectors.notion import NotionConnector
from genxai.connectors.jira import JiraConnector
from genxai.connectors.google_workspace import GoogleWorkspaceConnector

__all__ = [
    "Connector",
    "ConnectorEvent",
    "ConnectorStatus",
    "ConnectorRegistry",
    "WebhookConnector",
    "KafkaConnector",
    "SQSConnector",
    "PostgresCDCConnector",
    "SlackConnector",
    "GitHubConnector",
    "NotionConnector",
    "JiraConnector",
    "GoogleWorkspaceConnector",
]