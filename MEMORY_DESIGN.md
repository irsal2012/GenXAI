# GenXAI Framework - Memory System Design

**Version:** 1.0.0  
**Last Updated:** January 28, 2026  
**Status:** Design Phase

---

## Table of Contents

1. [Overview](#overview)
2. [Memory Architecture](#memory-architecture)
3. [Memory Types](#memory-types)
4. [Memory Consolidation](#memory-consolidation)
5. [Storage Backends](#storage-backends)
6. [Implementation Examples](#implementation-examples)

---

## Overview

The GenXAI memory system is inspired by human cognition, providing agents with multiple memory types for different purposes. This multi-layered approach enables agents to:

- Remember recent conversations (short-term)
- Store persistent knowledge (long-term)
- Learn from past experiences (episodic)
- Maintain factual knowledge (semantic)
- Execute learned procedures (procedural)
- Process active information (working)

---

## Memory Architecture

### Core Components

```python
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class MemoryType(str, Enum):
    """Types of memory"""
    SHORT_TERM = "short_term"
    LONG_TERM = "long_term"
    EPISODIC = "episodic"
    SEMANTIC = "semantic"
    PROCEDURAL = "procedural"
    WORKING = "working"

class Memory(BaseModel):
    """Base memory unit"""
    id: str
    type: MemoryType
    content: Any
    metadata: Dict[str, Any] = {}
    timestamp: datetime
    importance: float = 0.5  # 0.0 to 1.0
    access_count: int = 0
    last_accessed: datetime
    embedding: Optional[List[float]] = None
    tags: List[str] = []

class MemoryConfig(BaseModel):
    """Memory system configuration"""
    short_term_capacity: int = 20
    long_term_enabled: bool = True
    episodic_enabled: bool = True
    semantic_enabled: bool = True
    procedural_enabled: bool = True
    working_capacity: int = 5
    
    # Storage backends
    vector_db: Optional[str] = "pinecone"
    graph_db: Optional[str] = "neo4j"
    cache_db: Optional[str] = "redis"
    
    # Consolidation settings
    consolidation_enabled: bool = True
    consolidation_schedule: str = "0 2 * * *"  # Daily at 2 AM
    importance_threshold: float = 0.7
    retention_days: int = 365

class MemorySystem:
    """Comprehensive memory management"""
    
    def __init__(self, agent_id: str, config: MemoryConfig):
        self.agent_id = agent_id
        self.config = config
        
        # Initialize memory stores
        self.short_term = ShortTermMemory(capacity=config.short_term_capacity)
        self.long_term = LongTermMemory(
            vector_db=config.vector_db,
            agent_id=agent_id
        ) if config.long_term_enabled else None
        
        self.episodic = EpisodicMemory(
            graph_db=config.graph_db,
            agent_id=agent_id
        ) if config.episodic_enabled else None
        
        self.semantic = SemanticMemory(
            vector_db=config.vector_db,
            agent_id=agent_id
        ) if config.semantic_enabled else None
        
        self.procedural = ProceduralMemory(
            agent_id=agent_id
        ) if config.procedural_enabled else None
        
        self.working = WorkingMemory(capacity=config.working_capacity)
        
        # Consolidator
        if config.consolidation_enabled:
            self.consolidator = MemoryConsolidator(self)
```

---

## Memory Types

### 1. Short-Term Memory

Recent conversation context with automatic eviction.

```python
from collections import deque
import logging

logger = logging.getLogger(__name__)

class ShortTermMemory:
    """Recent conversation context (like human working memory)"""
    
    def __init__(self, capacity: int = 20):
        self.capacity = capacity
        self.memories: deque[Memory] = deque(maxlen=capacity)
        self._total_added = 0
    
    async def add(self, content: Any, metadata: Dict[str, Any] = None) -> Memory:
        """Add to short-term memory with automatic eviction"""
        memory = Memory(
            id=f"stm_{self._total_added}",
            type=MemoryType.SHORT_TERM,
            content=content,
            metadata=metadata or {},
            timestamp=datetime.now(),
            importance=self._calculate_importance(content),
            access_count=0,
            last_accessed=datetime.now()
        )
        
        self.memories.append(memory)
        self._total_added += 1
        
        logger.debug(f"Added to short-term memory: {memory.id}")
        return memory
    
    async def get_recent(self, n: int = 10) -> List[Memory]:
        """Get n most recent memories"""
        return list(self.memories)[-n:]
    
    async def get_context(self, max_tokens: int = 4000) -> str:
        """Get recent context for LLM"""
        context = []
        token_count = 0
        
        for memory in reversed(self.memories):
            memory_text = str(memory.content)
            memory_tokens = len(memory_text.split())
            
            if token_count + memory_tokens > max_tokens:
                break
                
            context.insert(0, memory_text)
            token_count += memory_tokens
            memory.access_count += 1
            memory.last_accessed = datetime.now()
        
        return "\n".join(context)
    
    async def clear(self) -> None:
        """Clear all short-term memories"""
        self.memories.clear()
        logger.info("Cleared short-term memory")
    
    def _calculate_importance(self, content: Any) -> float:
        """Calculate importance score (0.0 to 1.0)"""
        # Simple heuristic: longer content = more important
        # In practice, use LLM to assess importance
        text = str(content)
        if len(text) > 500:
            return 0.8
        elif len(text) > 200:
            return 0.6
        else:
            return 0.4
    
    def get_stats(self) -> Dict[str, Any]:
        """Get memory statistics"""
        return {
            "capacity": self.capacity,
            "current_size": len(self.memories),
            "total_added": self._total_added,
            "utilization": len(self.memories) / self.capacity
        }
```

### 2. Long-Term Memory

Persistent knowledge storage with vector search.

```python
from typing import Protocol
import numpy as np

class VectorDB(Protocol):
    """Vector database interface"""
    async def upsert(self, id: str, vector: List[float], metadata: Dict) -> None: ...
    async def query(self, vector: List[float], top_k: int, filter: Dict) -> List[Any]: ...
    async def delete(self, filter: Dict) -> int: ...

class EmbeddingModel:
    """Generate embeddings for text"""
    async def embed(self, text: str) -> List[float]:
        # Use OpenAI embeddings or local model
        pass

class LongTermMemory:
    """Persistent knowledge storage with vector search"""
    
    def __init__(self, vector_db: str, agent_id: str):
        self.agent_id = agent_id
        self.vector_db = self._init_vector_db(vector_db)
        self.embedder = EmbeddingModel()
        self._memory_count = 0
    
    def _init_vector_db(self, db_type: str) -> VectorDB:
        """Initialize vector database"""
        if db_type == "pinecone":
            from genxai.storage.pinecone import PineconeDB
            return PineconeDB()
        elif db_type == "weaviate":
            from genxai.storage.weaviate import WeaviateDB
            return WeaviateDB()
        elif db_type == "chroma":
            from genxai.storage.chroma import ChromaDB
            return ChromaDB()
        else:
            raise ValueError(f"Unsupported vector DB: {db_type}")
    
    async def store(self, content: Any, metadata: Dict[str, Any] = None,
                   importance: float = 0.5) -> str:
        """Store in long-term memory"""
        # Generate embedding
        text = str(content)
        embedding = await self.embedder.embed(text)
        
        memory_id = f"ltm_{self.agent_id}_{self._memory_count}"
        self._memory_count += 1
        
        memory = Memory(
            id=memory_id,
            type=MemoryType.LONG_TERM,
            content=content,
            metadata=metadata or {},
            timestamp=datetime.now(),
            importance=importance,
            access_count=0,
            last_accessed=datetime.now(),
            embedding=embedding
        )
        
        # Store in vector database
        await self.vector_db.upsert(
            id=memory.id,
            vector=embedding,
            metadata={
                "agent_id": self.agent_id,
                "content": text,
                "timestamp": memory.timestamp.isoformat(),
                "importance": memory.importance,
                "type": "long_term",
                **metadata or {}
            }
        )
        
        logger.info(f"Stored in long-term memory: {memory.id}")
        return memory.id
    
    async def retrieve(self, query: str, top_k: int = 5,
                      min_importance: float = 0.0) -> List[Memory]:
        """Semantic search in long-term memory"""
        query_embedding = await self.embedder.embed(query)
        
        results = await self.vector_db.query(
            vector=query_embedding,
            top_k=top_k * 2,  # Get more, then filter
            filter={"agent_id": self.agent_id, "type": "long_term"}
        )
        
        memories = []
        for result in results:
            if result.metadata.get("importance", 0) >= min_importance:
                memory = Memory(
                    id=result.id,
                    type=MemoryType.LONG_TERM,
                    content=result.metadata["content"],
                    metadata=result.metadata,
                    timestamp=datetime.fromisoformat(result.metadata["timestamp"]),
                    importance=result.metadata["importance"],
                    access_count=result.metadata.get("access_count", 0) + 1,
                    last_accessed=datetime.now(),
                    embedding=result.vector
                )
                memories.append(memory)
                
                if len(memories) >= top_k:
                    break
        
        logger.debug(f"Retrieved {len(memories)} memories for query: {query}")
        return memories
    
    async def forget(self, criteria: Dict[str, Any]) -> int:
        """Remove memories based on criteria (GDPR compliance)"""
        criteria["agent_id"] = self.agent_id
        deleted = await self.vector_db.delete(filter=criteria)
        logger.info(f"Deleted {deleted} memories matching criteria")
        return deleted
    
    async def update_importance(self, memory_id: str, importance: float) -> None:
        """Update memory importance"""
        # Implementation depends on vector DB capabilities
        pass
```

### 3. Episodic Memory

Past experiences and interactions stored as graphs.

```python
class Episode(BaseModel):
    """A complete interaction episode"""
    id: str
    agent_id: str
    start_time: datetime
    end_time: datetime
    context: Dict[str, Any]
    actions: List[Dict[str, Any]]
    outcome: Dict[str, Any]
    success: bool
    lessons_learned: List[str] = []
    related_episodes: List[str] = []

class GraphDB(Protocol):
    """Graph database interface"""
    async def create_node(self, label: str, properties: Dict) -> str: ...
    async def create_relationship(self, from_id: str, to_id: str, type: str) -> None: ...
    async def query(self, cypher: str, **params) -> List[Any]: ...

class EpisodicMemory:
    """Remember past experiences and learn from them"""
    
    def __init__(self, graph_db: str, agent_id: str):
        self.agent_id = agent_id
        self.graph_db = self._init_graph_db(graph_db)
        self._episode_count = 0
    
    def _init_graph_db(self, db_type: str) -> GraphDB:
        """Initialize graph database"""
        if db_type == "neo4j":
            from genxai.storage.neo4j import Neo4jDB
            return Neo4jDB()
        else:
            raise ValueError(f"Unsupported graph DB: {db_type}")
    
    async def store_episode(self, episode: Episode) -> None:
        """Store a complete episode with relationships"""
        # Create episode node
        await self.graph_db.create_node(
            label="Episode",
            properties={
                "id": episode.id,
                "agent_id": episode.agent_id,
                "start_time": episode.start_time.isoformat(),
                "end_time": episode.end_time.isoformat(),
                "success": episode.success,
                "context": episode.context,
                "outcome": episode.outcome,
                "lessons": episode.lessons_learned
            }
        )
        
        # Create action nodes and relationships
        for i, action in enumerate(episode.actions):
            action_id = f"{episode.id}_action_{i}"
            await self.graph_db.create_node(
                label="Action",
                properties={"id": action_id, "index": i, **action}
            )
            await self.graph_db.create_relationship(
                from_id=episode.id,
                to_id=action_id,
                type="CONTAINS"
            )
            
            # Link sequential actions
            if i > 0:
                prev_action_id = f"{episode.id}_action_{i-1}"
                await self.graph_db.create_relationship(
                    from_id=prev_action_id,
                    to_id=action_id,
                    type="NEXT"
                )
        
        logger.info(f"Stored episode: {episode.id}")
    
    async def retrieve_similar_episodes(self, context: Dict[str, Any],
                                       limit: int = 5) -> List[Episode]:
        """Find similar past episodes"""
        query = """
        MATCH (e:Episode)
        WHERE e.agent_id = $agent_id
        AND e.context.task_type = $task_type
        RETURN e
        ORDER BY e.start_time DESC
        LIMIT $limit
        """
        
        results = await self.graph_db.query(
            query,
            agent_id=self.agent_id,
            task_type=context.get("task_type"),
            limit=limit
        )
        
        episodes = [self._parse_episode(r) for r in results]
        logger.debug(f"Retrieved {len(episodes)} similar episodes")
        return episodes
    
    async def learn_from_episodes(self) -> List[str]:
        """Extract patterns and lessons from past episodes"""
        # Query successful episodes
        query = """
        MATCH (e:Episode)
        WHERE e.agent_id = $agent_id
        AND e.success = true
        RETURN e
        ORDER BY e.start_time DESC
        LIMIT 100
        """
        
        results = await self.graph_db.query(query, agent_id=self.agent_id)
        
        # Analyze patterns (simplified)
        lessons = []
        # In practice, use LLM to analyze and extract insights
        
        return lessons
    
    def _parse_episode(self, result: Any) -> Episode:
        """Parse episode from database result"""
        props = result["e"]
        return Episode(
            id=props["id"],
            agent_id=props["agent_id"],
            start_time=datetime.fromisoformat(props["start_time"]),
            end_time=datetime.fromisoformat(props["end_time"]),
            context=props["context"],
            actions=[],  # Load separately if needed
            outcome=props["outcome"],
            success=props["success"],
            lessons_learned=props.get("lessons", [])
        )
```

### 4. Semantic Memory

Factual knowledge base with entity relationships.

```python
class KnowledgeGraph:
    """Knowledge graph for semantic memory"""
    
    async def add_entity(self, entity: Dict[str, Any]) -> None:
        """Add entity to knowledge graph"""
        pass
    
    async def add_relationship(self, subject: str, predicate: str, 
                              object: str) -> None:
        """Add relationship between entities"""
        pass
    
    async def query_entities(self, query: str) -> List[Dict[str, Any]]:
        """Query entities"""
        pass

class SemanticMemory:
    """Factual knowledge base"""
    
    def __init__(self, vector_db: str, agent_id: str):
        self.agent_id = agent_id
        self.vector_db = self._init_vector_db(vector_db)
        self.knowledge_graph = KnowledgeGraph()
        self.embedder = EmbeddingModel()
    
    def _init_vector_db(self, db_type: str) -> VectorDB:
        """Initialize vector database"""
        # Same as LongTermMemory
        pass
    
    async def store_fact(self, fact: str, source: Optional[str] = None,
                        confidence: float = 1.0) -> str:
        """Store a factual statement"""
        # Extract entities and relationships
        entities = await self._extract_entities(fact)
        relationships = await self._extract_relationships(fact)
        
        # Store in knowledge graph
        for entity in entities:
            await self.knowledge_graph.add_entity(entity)
        
        for rel in relationships:
            await self.knowledge_graph.add_relationship(
                subject=rel["subject"],
                predicate=rel["predicate"],
                object=rel["object"]
            )
        
        # Also store in vector DB for semantic search
        embedding = await self.embedder.embed(fact)
        fact_id = f"sem_{self.agent_id}_{hash(fact)}"
        
        await self.vector_db.upsert(
            id=fact_id,
            vector=embedding,
            metadata={
                "agent_id": self.agent_id,
                "fact": fact,
                "source": source,
                "confidence": confidence,
                "type": "semantic",
                "timestamp": datetime.now().isoformat()
            }
        )
        
        logger.info(f"Stored fact: {fact}")
        return fact_id
    
    async def query_knowledge(self, question: str, top_k: int = 10) -> List[str]:
        """Query factual knowledge"""
        # Semantic search
        embedding = await self.embedder.embed(question)
        results = await self.vector_db.query(
            vector=embedding,
            top_k=top_k,
            filter={"agent_id": self.agent_id, "type": "semantic"}
        )
        
        facts = [r.metadata["fact"] for r in results]
        logger.debug(f"Retrieved {len(facts)} facts for: {question}")
        return facts
    
    async def _extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract entities from text using NER"""
        # Use spaCy or LLM for entity extraction
        pass
    
    async def _extract_relationships(self, text: str) -> List[Dict[str, str]]:
        """Extract relationships from text"""
        # Use dependency parsing or LLM
        pass
```

### 5. Procedural Memory

Learned procedures and skills.

```python
class Procedure(BaseModel):
    """A learned procedure/skill"""
    name: str
    description: str
    steps: List[Dict[str, Any]]
    preconditions: List[str] = []
    postconditions: List[str] = []
    success_rate: float = 0.0
    usage_count: int = 0
    last_used: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class ProceduralMemory:
    """Remember how to do things"""
    
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.procedures: Dict[str, Procedure] = {}
    
    async def learn_procedure(self, name: str, description: str,
                             steps: List[Dict[str, Any]]) -> Procedure:
        """Learn a new procedure"""
        procedure = Procedure(
            name=name,
            description=description,
            steps=steps,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        self.procedures[name] = procedure
        logger.info(f"Learned procedure: {name}")
        return procedure
    
    async def execute_procedure(self, name: str, 
                               context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a learned procedure"""
        procedure = self.procedures.get(name)
        if not procedure:
            raise ValueError(f"Procedure {name} not found")
        
        # Check preconditions
        for precondition in procedure.preconditions:
            if not self._check_condition(precondition, context):
                raise ValueError(f"Precondition not met: {precondition}")
        
        # Execute steps
        result = {}
        for i, step in enumerate(procedure.steps):
            logger.debug(f"Executing step {i+1}/{len(procedure.steps)}: {step}")
            step_result = await self._execute_step(step, context)
            result[f"step_{i}"] = step_result
            context.update({"last_result": step_result})
        
        # Update statistics
        procedure.usage_count += 1
        procedure.last_used = datetime.now()
        procedure.updated_at = datetime.now()
        
        return result
    
    async def update_success_rate(self, name: str, success: bool) -> None:
        """Update procedure success rate"""
        procedure = self.procedures.get(name)
        if procedure:
            # Exponential moving average
            alpha = 0.1
            new_value = 1.0 if success else 0.0
            procedure.success_rate = (
                alpha * new_value + (1 - alpha) * procedure.success_rate
            )
            procedure.updated_at = datetime.now()
    
    async def _execute_step(self, step: Dict[str, Any], 
                           context: Dict[str, Any]) -> Any:
        """Execute a single step"""
        # Implementation depends on step type
        pass
    
    def _check_condition(self, condition: str, context: Dict[str, Any]) -> bool:
        """Check if condition is met"""
        # Simple evaluation
        pass
```

### 6. Working Memory

Active processing space for temporary computations.

```python
class WorkingMemory:
    """Active processing space"""
    
    def __init__(self, capacity: int = 5):
        self.capacity = capacity
        self.items: Dict[str, Any] = {}
    
    async def set(self, key: str, value: Any) -> None:
        """Set item in working memory"""
        if len(self.items) >= self.capacity:
            # Evict oldest item
            oldest_key = next(iter(self.items))
            del self.items[oldest_key]
        
        self.items[key] = value
    
    async def get(self, key: str) -> Optional[Any]:
        """Get item from working memory"""
        return self.items.get(key)
    
    async def clear(self) -> None:
        """Clear working memory"""
        self.items.clear()
```

---

## Memory Consolidation

Periodic optimization of memories (like sleep in humans).

```python
from datetime import timedelta

class MemoryConsolidator:
    """Consolidate and optimize memories"""
    
    def __init__(self, memory_system: MemorySystem):
        self.memory_system = memory_system
    
    async def consolidate(self) -> Dict[str, Any]:
        """Periodic memory consolidation"""
        stats = {
            "moved_to_long_term": 0,
            "forgotten": 0,
            "patterns_extracted": 0
        }
        
        # 1. Move important short-term memories to long-term
        if self.memory_system.long_term:
            important_memories = [
                m for m in self.memory_system.short_term.memories 
                if m.importance > self.memory_system.config.importance_threshold
            ]
            
            for memory in important_memories:
                await self.memory_system.long_term.store(
                    content=memory.content,
                    metadata=memory.metadata,
                    importance=memory.importance
                )
                stats["moved_to_long_term"] += 1
        
        # 2. Forget low-importance, rarely accessed memories
        if self.memory_system.long_term:
            forgotten = await self._forget_unimportant()
            stats["forgotten"] = forgotten
        
        # 3. Extract patterns from episodic memory
        if self.memory_system.episodic:
            patterns = await self.memory_system.episodic.learn_from_episodes()
            
            # Store patterns as semantic knowledge
            if self.memory_system.semantic:
                for pattern in patterns:
                    await self.memory_system.semantic.store_fact(pattern)
                stats["patterns_extracted"] = len(patterns)
        
        logger.info(f"Memory consolidation complete: {stats}")
        return stats
    
    async def _forget_unimportant(self) -> int:
        """Remove memories that are old and rarely accessed"""
        cutoff_date = datetime.now() - timedelta(
            days=self.memory_system.config.retention_days
        )
        
        deleted = await self.memory_system.long_term.forget({
            "importance": {"$lt": 0.3},
            "last_accessed": {"$lt": cutoff_date.isoformat()}
        })
        
        return deleted
```

---

## Storage Backends

### Vector Database Configuration

```yaml
# Pinecone configuration
vector_db:
  provider: "pinecone"
  config:
    api_key: "${PINECONE_API_KEY}"
    environment: "us-west1-gcp"
    index_name: "genxai-memories"
    dimension: 1536
    metric: "cosine"

# Weaviate configuration
vector_db:
  provider: "weaviate"
  config:
    url: "http://localhost:8080"
    api_key: "${WEAVIATE_API_KEY}"
    class_name: "Memory"
```

### Graph Database Configuration

```yaml
# Neo4j configuration
graph_db:
  provider: "neo4j"
  config:
    uri: "bolt://localhost:7687"
    username: "neo4j"
    password: "${NEO4J_PASSWORD}"
    database: "genxai"
```

---

## Implementation Examples

### Complete Memory System Usage

```python
# Initialize memory system
config = MemoryConfig(
    short_term_capacity=20,
    long_term_enabled=True,
    episodic_enabled=True,
    semantic_enabled=True,
    procedural_enabled=True,
    vector_db="pinecone",
    graph_db="neo4j"
)

memory = MemorySystem(agent_id="agent_001", config=config)

# Store in short-term memory
await memory.short_term.add("User asked about pricing")

# Store in long-term memory
await memory.long_term.store(
    content="Product X costs $99/month",
    metadata={"category": "pricing"},
    importance=0.8
)

# Retrieve from long-term memory
results = await memory.long_term.retrieve("What is the price?", top_k=5)

# Store episode
episode = Episode(
    id="ep_001",
    agent_id="agent_001",
    start_time=datetime.now(),
    end_time=datetime.now(),
    context={"task": "customer_support"},
    actions=[{"type": "search", "query": "pricing"}],
    outcome={"success": True},
    success=True
)
await memory.episodic.store_episode(episode)

# Store fact
await memory.semantic.store_fact(
    "The company was founded in 2020",
    source="company_website"
)

# Learn procedure
await memory.procedural.learn_procedure(
    name="handle_refund",
    description="Process customer refund",
    steps=[
        {"action": "verify_purchase", "params": {}},
        {"action": "calculate_refund", "params": {}},
        {"action": "process_payment", "params": {}}
    ]
)

# Consolidate memories
consolidator = MemoryConsolidator(memory)
stats = await consolidator.consolidate()
```

---

**Document Status**: Living document, updated as memory system is implemented.
