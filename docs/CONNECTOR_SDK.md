# Connector SDK

The Connector SDK provides a standardized integration surface for external event sources.

## Key Concepts
- **Connector**: A long‑lived integration that emits events.
- **ConnectorEvent**: Payload + metadata emitted to subscribers.
- **ConnectorRegistry**: Optional registry for reuse.
- **Lifecycle Helpers**: `start_all()` / `stop_all()` for bulk ops.
- **Validation**: `validate_config()` runs before connector startup.

## Webhook Connector Example

```python
from genxai.connectors import WebhookConnector

connector = WebhookConnector(connector_id="webhook_1", secret="my-secret")

async def handle(event):
    print(event.payload)

connector.on_event(handle)
await connector.start()

# In your FastAPI route:
# await connector.handle_request(payload, raw_body=raw, headers=request.headers)
```

## Registry Lifecycle Example

```python
from genxai.connectors import ConnectorRegistry, WebhookConnector

connector = WebhookConnector(connector_id="webhook_1", secret="my-secret")
ConnectorRegistry.register(connector)

await ConnectorRegistry.start_all()
await ConnectorRegistry.stop_all()
```

## Stub Connectors

The following connectors are available:
- **KafkaConnector** (`genxai.connectors.kafka`) — uses aiokafka
- **SQSConnector** (`genxai.connectors.sqs`) — uses aioboto3
- **PostgresCDCConnector** (`genxai.connectors.postgres_cdc`) — uses asyncpg + wal2json