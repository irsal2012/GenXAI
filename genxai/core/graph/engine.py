"""Graph execution engine for orchestrating agent workflows."""

import asyncio
from typing import Any, Dict, List, Optional, Set
from collections import defaultdict, deque
import logging
import time

from genxai.core.graph.nodes import Node, NodeStatus, NodeType
from genxai.core.graph.edges import Edge
from genxai.observability.metrics import (
    record_workflow_execution,
    record_workflow_node_execution,
)
from genxai.observability.tracing import span, record_exception

logger = logging.getLogger(__name__)


class GraphExecutionError(Exception):
    """Exception raised during graph execution."""

    pass


class Graph:
    """Main graph class for orchestrating agent workflows."""

    def __init__(self, name: str = "workflow") -> None:
        """Initialize the graph.

        Args:
            name: Name of the workflow graph
        """
        self.name = name
        self.nodes: Dict[str, Node] = {}
        self.edges: List[Edge] = []
        self._adjacency_list: Dict[str, List[Edge]] = defaultdict(list)
        self._reverse_adjacency: Dict[str, List[str]] = defaultdict(list)

    def add_node(self, node: Node) -> None:
        """Add a node to the graph.

        Args:
            node: Node to add

        Raises:
            ValueError: If node with same ID already exists
        """
        if node.id in self.nodes:
            raise ValueError(f"Node with id '{node.id}' already exists")

        self.nodes[node.id] = node
        logger.debug(f"Added node: {node.id} (type: {node.type})")

    def add_edge(self, edge: Edge) -> None:
        """Add an edge to the graph.

        Args:
            edge: Edge to add

        Raises:
            ValueError: If source or target node doesn't exist
        """
        if edge.source not in self.nodes:
            raise ValueError(f"Source node '{edge.source}' not found")
        if edge.target not in self.nodes:
            raise ValueError(f"Target node '{edge.target}' not found")

        self.edges.append(edge)
        self._adjacency_list[edge.source].append(edge)
        self._reverse_adjacency[edge.target].append(edge.source)
        logger.debug(f"Added edge: {edge.source} -> {edge.target}")

    def get_node(self, node_id: str) -> Optional[Node]:
        """Get a node by ID.

        Args:
            node_id: ID of the node

        Returns:
            Node if found, None otherwise
        """
        return self.nodes.get(node_id)

    def get_outgoing_edges(self, node_id: str) -> List[Edge]:
        """Get all outgoing edges from a node.

        Args:
            node_id: ID of the node

        Returns:
            List of outgoing edges
        """
        return self._adjacency_list.get(node_id, [])

    def get_incoming_nodes(self, node_id: str) -> List[str]:
        """Get all nodes with edges pointing to this node.

        Args:
            node_id: ID of the node

        Returns:
            List of incoming node IDs
        """
        return self._reverse_adjacency.get(node_id, [])

    def validate(self) -> bool:
        """Validate the graph structure.

        Returns:
            True if graph is valid

        Raises:
            GraphExecutionError: If graph is invalid
        """
        # Check for at least one node
        if not self.nodes:
            raise GraphExecutionError("Graph must have at least one node")

        # Check for cycles (optional - we allow cycles)
        # Check for disconnected components
        visited = self._dfs_visit(next(iter(self.nodes.keys())))
        if len(visited) != len(self.nodes):
            logger.warning("Graph has disconnected components")

        # Check that all edges reference valid nodes
        for edge in self.edges:
            if edge.source not in self.nodes or edge.target not in self.nodes:
                raise GraphExecutionError(
                    f"Edge references non-existent node: {edge.source} -> {edge.target}"
                )

        logger.info(f"Graph '{self.name}' validated successfully")
        return True

    def _dfs_visit(self, start_node: str) -> Set[str]:
        """Perform DFS traversal from start node.

        Args:
            start_node: Starting node ID

        Returns:
            Set of visited node IDs
        """
        visited: Set[str] = set()
        stack = [start_node]

        while stack:
            node_id = stack.pop()
            if node_id in visited:
                continue

            visited.add(node_id)

            # Add neighbors (both outgoing and incoming for undirected check)
            for edge in self.get_outgoing_edges(node_id):
                if edge.target not in visited:
                    stack.append(edge.target)

            for incoming in self.get_incoming_nodes(node_id):
                if incoming not in visited:
                    stack.append(incoming)

        return visited

    def topological_sort(self) -> List[str]:
        """Perform topological sort on the graph.

        Returns:
            List of node IDs in topological order

        Raises:
            GraphExecutionError: If graph has cycles
        """
        in_degree = {node_id: 0 for node_id in self.nodes}

        for edge in self.edges:
            in_degree[edge.target] += 1

        queue: deque[str] = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
        result: List[str] = []

        while queue:
            node_id = queue.popleft()
            result.append(node_id)

            for edge in self.get_outgoing_edges(node_id):
                in_degree[edge.target] -= 1
                if in_degree[edge.target] == 0:
                    queue.append(edge.target)

        if len(result) != len(self.nodes):
            raise GraphExecutionError("Graph contains cycles - cannot perform topological sort")

        return result

    async def run(
        self, input_data: Any, max_iterations: int = 100, state: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute the graph workflow.

        Args:
            input_data: Input data for the workflow
            max_iterations: Maximum number of iterations (for cycle detection)
            state: Initial state dictionary

        Returns:
            Final state after execution

        Raises:
            GraphExecutionError: If execution fails
        """
        if not self.nodes:
            raise GraphExecutionError("Cannot run empty graph")

        self.validate()

        start_time = time.time()
        status = "success"

        # Initialize state
        if state is None:
            state = {}
        state["input"] = input_data
        state["iterations"] = 0

        # Find entry points (nodes with no incoming edges)
        entry_points = [
            node_id for node_id in self.nodes if not self.get_incoming_nodes(node_id)
        ]

        if not entry_points:
            # If no clear entry point, look for INPUT node
            entry_points = [
                node_id for node_id, node in self.nodes.items() if node.type == NodeType.INPUT
            ]

        if not entry_points:
            raise GraphExecutionError("No entry point found in graph")

        logger.info(f"Starting graph execution: {self.name}")
        logger.debug(f"Entry points: {entry_points}")

        # Execute from entry points
        try:
            with span("genxai.workflow.execute", {"workflow_id": self.name}):
                for entry_point in entry_points:
                    await self._execute_node(entry_point, state, max_iterations)
        except Exception as exc:
            status = "error"
            record_exception(exc)
            raise
        finally:
            duration = time.time() - start_time
            record_workflow_execution(
                workflow_id=self.name,
                duration=duration,
                status=status,
            )

        logger.info(f"Graph execution completed: {self.name}")
        return state

    async def _execute_node(
        self, node_id: str, state: Dict[str, Any], max_iterations: int
    ) -> None:
        """Execute a single node and its descendants.

        Args:
            node_id: ID of the node to execute
            state: Current state
            max_iterations: Maximum iterations allowed

        Raises:
            GraphExecutionError: If execution fails or max iterations exceeded
        """
        if state.get("iterations", 0) >= max_iterations:
            raise GraphExecutionError(f"Maximum iterations ({max_iterations}) exceeded")

        state["iterations"] = state.get("iterations", 0) + 1

        node = self.nodes[node_id]

        # Skip if already completed
        if node.status == NodeStatus.COMPLETED:
            return

        # Mark as running
        node.status = NodeStatus.RUNNING
        logger.debug(f"Executing node: {node_id}")
        node_start = time.time()

        try:
            # Execute node (placeholder - will be implemented with actual executors)
            with span(
                "genxai.workflow.node",
                {"workflow_id": self.name, "node_id": node_id, "node_type": node.type.value},
            ):
                result = await self._execute_node_logic(node, state)
            node.result = result
            node.status = NodeStatus.COMPLETED
            logger.debug(f"Node completed: {node_id}")

            record_workflow_node_execution(
                workflow_id=self.name,
                node_id=node_id,
                status="success",
            )

            # Update state with result
            state[node_id] = result

            # Get outgoing edges and evaluate conditions
            outgoing_edges = self.get_outgoing_edges(node_id)

            # Separate parallel and sequential edges
            parallel_edges = [e for e in outgoing_edges if e.metadata.get("parallel", False)]
            sequential_edges = [e for e in outgoing_edges if not e.metadata.get("parallel", False)]

            # Execute parallel edges concurrently
            if parallel_edges:
                tasks = []
                for edge in parallel_edges:
                    if edge.evaluate_condition(state):
                        tasks.append(self._execute_node(edge.target, state, max_iterations))
                if tasks:
                    await asyncio.gather(*tasks)

            # Execute sequential edges in order
            for edge in sorted(sequential_edges, key=lambda e: e.priority):
                if edge.evaluate_condition(state):
                    await self._execute_node(edge.target, state, max_iterations)

        except Exception as e:
            node.status = NodeStatus.FAILED
            node.error = str(e)
            logger.error(f"Node execution failed: {node_id} - {e}")
            record_workflow_node_execution(
                workflow_id=self.name,
                node_id=node_id,
                status="error",
            )
            raise GraphExecutionError(f"Node {node_id} failed: {e}") from e

    async def _execute_node_logic(self, node: Node, state: Dict[str, Any]) -> Any:
        """Execute the actual logic of a node.

        This is a placeholder that will be replaced with actual node executors.

        Args:
            node: Node to execute
            state: Current state

        Returns:
            Result of node execution
        """
        # Placeholder implementation
        if node.type == NodeType.INPUT:
            return state.get("input")
        elif node.type == NodeType.OUTPUT:
            return state
        else:
            # For now, just return a placeholder
            return {"node_id": node.id, "type": node.type.value}

    def to_dict(self) -> Dict[str, Any]:
        """Convert graph to dictionary representation.

        Returns:
            Dictionary representation of the graph
        """
        return {
            "name": self.name,
            "nodes": [
                {
                    "id": node.id,
                    "type": node.type.value,
                    "config": node.config.dict(),
                    "status": node.status.value,
                }
                for node in self.nodes.values()
            ],
            "edges": [
                {
                    "source": edge.source,
                    "target": edge.target,
                    "metadata": edge.metadata,
                    "priority": edge.priority,
                }
                for edge in self.edges
            ],
        }

    def __repr__(self) -> str:
        """String representation of the graph."""
        return f"Graph(name={self.name}, nodes={len(self.nodes)}, edges={len(self.edges)})"

    def draw_ascii(self) -> str:
        """Generate ASCII art representation of the graph.

        Returns:
            String containing ASCII art visualization of the graph
        """
        if not self.nodes:
            return "Empty graph"

        lines = []
        lines.append(f"Graph: {self.name}")
        lines.append("=" * 60)
        lines.append("")

        # Find entry points
        entry_points = [
            node_id for node_id in self.nodes if not self.get_incoming_nodes(node_id)
        ]

        if not entry_points:
            entry_points = [
                node_id
                for node_id, node in self.nodes.items()
                if node.type == NodeType.INPUT
            ]

        if not entry_points and self.nodes:
            entry_points = [next(iter(self.nodes.keys()))]

        # Build tree structure
        visited = set()
        for entry in entry_points:
            self._draw_node_tree(entry, lines, visited, prefix="", is_last=True)

        lines.append("")
        lines.append("=" * 60)
        lines.append(f"Total Nodes: {len(self.nodes)} | Total Edges: {len(self.edges)}")

        return "\n".join(lines)

    def _draw_node_tree(
        self, node_id: str, lines: List[str], visited: Set[str], prefix: str, is_last: bool
    ) -> None:
        """Recursively draw node tree structure.

        Args:
            node_id: Current node ID
            lines: List to append output lines to
            visited: Set of visited node IDs
            prefix: Current line prefix for indentation
            is_last: Whether this is the last child
        """
        if node_id not in self.nodes:
            return

        node = self.nodes[node_id]

        # Draw current node
        connector = "└── " if is_last else "├── "
        status_symbol = {
            NodeStatus.PENDING: "○",
            NodeStatus.RUNNING: "◐",
            NodeStatus.COMPLETED: "●",
            NodeStatus.FAILED: "✗",
            NodeStatus.SKIPPED: "⊘",
        }.get(node.status, "?")

        node_line = f"{prefix}{connector}{status_symbol} {node.id} [{node.type.value}]"
        lines.append(node_line)

        # Avoid infinite loops in cyclic graphs
        if node_id in visited:
            extension = "    " if is_last else "│   "
            lines.append(f"{prefix}{extension}↻ (cycle detected)")
            return

        visited.add(node_id)

        # Get outgoing edges
        outgoing = self.get_outgoing_edges(node_id)
        if not outgoing:
            return

        # Group edges by type
        parallel_edges = [e for e in outgoing if e.metadata.get("parallel", False)]
        sequential_edges = [e for e in outgoing if not e.metadata.get("parallel", False)]

        # Draw parallel edges
        if parallel_edges:
            extension = "    " if is_last else "│   "
            lines.append(f"{prefix}{extension}║")
            lines.append(f"{prefix}{extension}╠══ [PARALLEL]")

            for i, edge in enumerate(parallel_edges):
                is_last_parallel = i == len(parallel_edges) - 1 and not sequential_edges
                new_prefix = prefix + ("    " if is_last else "│   ")
                condition_marker = " (conditional)" if edge.condition else ""
                lines.append(f"{new_prefix}║")
                self._draw_node_tree(
                    edge.target, lines, visited.copy(), new_prefix, is_last_parallel
                )

        # Draw sequential edges
        for i, edge in enumerate(sequential_edges):
            is_last_edge = i == len(sequential_edges) - 1
            new_prefix = prefix + ("    " if is_last else "│   ")
            condition_marker = " (?)" if edge.condition else ""

            if edge.condition:
                lines.append(f"{new_prefix}│")
                lines.append(f"{new_prefix}├── [IF condition]")

            self._draw_node_tree(edge.target, lines, visited.copy(), new_prefix, is_last_edge)

    def to_mermaid(self) -> str:
        """Generate Mermaid diagram syntax for the graph.

        Returns:
            String containing Mermaid flowchart syntax
        """
        if not self.nodes:
            return "graph TD\n    empty[Empty Graph]"

        lines = ["graph TD"]

        # Define nodes with appropriate shapes
        for node_id, node in self.nodes.items():
            label = f"{node_id}\\n[{node.type.value}]"

            # Choose shape based on node type
            if node.type == NodeType.INPUT:
                shape = f'    {node_id}(["{label}"])'
            elif node.type == NodeType.OUTPUT:
                shape = f'    {node_id}(["{label}"])'
            elif node.type == NodeType.CONDITION:
                shape = f'    {node_id}{{{{{label}}}}}'
            elif node.type == NodeType.AGENT:
                shape = f'    {node_id}["{label}"]'
            elif node.type == NodeType.TOOL:
                shape = f'    {node_id}["{label}"]'
            else:
                shape = f'    {node_id}["{label}"]'

            lines.append(shape)

        lines.append("")

        # Define edges
        for edge in self.edges:
            if edge.condition:
                lines.append(f"    {edge.source} -->|conditional| {edge.target}")
            elif edge.metadata.get("parallel", False):
                lines.append(f"    {edge.source} -.parallel.-> {edge.target}")
            else:
                lines.append(f"    {edge.source} --> {edge.target}")

        return "\n".join(lines)

    def to_dot(self) -> str:
        """Generate GraphViz DOT format for the graph.

        Returns:
            String containing DOT format graph definition
        """
        if not self.nodes:
            return "digraph empty { }"

        lines = [f'digraph "{self.name}" {{']
        lines.append("    rankdir=TB;")
        lines.append("    node [fontname=Arial, fontsize=10];")
        lines.append("    edge [fontname=Arial, fontsize=9];")
        lines.append("")

        # Define node styles by type
        node_styles = {
            NodeType.INPUT: 'shape=ellipse, style=filled, fillcolor=lightblue',
            NodeType.OUTPUT: 'shape=ellipse, style=filled, fillcolor=lightgreen',
            NodeType.CONDITION: 'shape=diamond, style=filled, fillcolor=lightyellow',
            NodeType.AGENT: 'shape=box, style="rounded,filled", fillcolor=lightcoral',
            NodeType.TOOL: 'shape=box, style=filled, fillcolor=lightgray',
            NodeType.HUMAN: 'shape=box, style=filled, fillcolor=lightpink',
            NodeType.SUBGRAPH: 'shape=box3d, style=filled, fillcolor=lavender',
        }

        # Define nodes
        for node_id, node in self.nodes.items():
            style = node_styles.get(node.type, 'shape=box')
            label = f"{node_id}\\n[{node.type.value}]"

            # Add status indicator
            if node.status != NodeStatus.PENDING:
                label += f"\\n({node.status.value})"

            lines.append(f'    {node_id} [label="{label}", {style}];')

        lines.append("")

        # Define edges
        for edge in self.edges:
            attrs = []

            if edge.condition:
                attrs.append('label="conditional"')
                attrs.append('style=dashed')

            if edge.metadata.get("parallel", False):
                attrs.append('label="parallel"')
                attrs.append('color=blue')

            if edge.priority != 0:
                attrs.append(f'weight={edge.priority}')

            attr_str = ", ".join(attrs) if attrs else ""
            if attr_str:
                lines.append(f"    {edge.source} -> {edge.target} [{attr_str}];")
            else:
                lines.append(f"    {edge.source} -> {edge.target};")

        lines.append("}")

        return "\n".join(lines)

    def print_structure(self) -> None:
        """Print a simple text summary of the graph structure."""
        print(f"\nGraph: {self.name}")
        print("=" * 60)
        print(f"Nodes: {len(self.nodes)}")
        print(f"Edges: {len(self.edges)}")
        print()

        if self.nodes:
            print("Node List:")
            print("-" * 60)
            for node_id, node in self.nodes.items():
                status = node.status.value
                print(f"  • {node_id:20} [{node.type.value:10}] ({status})")
            print()

        if self.edges:
            print("Edge List:")
            print("-" * 60)
            for edge in self.edges:
                condition = "conditional" if edge.condition else "unconditional"
                parallel = " [PARALLEL]" if edge.metadata.get("parallel", False) else ""
                print(f"  • {edge.source:15} → {edge.target:15} ({condition}){parallel}")
            print()

        # Find entry and exit points
        entry_points = [
            node_id for node_id in self.nodes if not self.get_incoming_nodes(node_id)
        ]
        exit_points = [
            node_id for node_id in self.nodes if not self.get_outgoing_edges(node_id)
        ]

        if entry_points:
            print(f"Entry Points: {', '.join(entry_points)}")
        if exit_points:
            print(f"Exit Points: {', '.join(exit_points)}")

        print("=" * 60)
        print()


class WorkflowEngine(Graph):
    """Public, user-facing workflow engine.

    This is a thin compatibility wrapper around :class:`~genxai.core.graph.engine.Graph`
    to match the API expected by integration tests and external users.
    """

    def __init__(self, name: str = "workflow") -> None:
        super().__init__(name=name)

    async def execute(self, start_node: str, llm_provider: Any = None, **kwargs: Any) -> Dict[str, Any]:
        """Execute a workflow starting from a given node.

        Notes:
            - In this open-source runtime, agent execution is provided by EnhancedGraph
              (see `genxai.core.graph.executor`). WorkflowEngine focuses on graph
              orchestration and state flow.
            - Integration tests pass `llm_provider`, but Graph does not need it.
              It's accepted here for compatibility.
        """
        # Initialize state with start node as the only entry point.
        state: Dict[str, Any] = kwargs.pop("state", {}) if "state" in kwargs else {}
        input_data = kwargs.pop("input_data", None)
        if input_data is not None:
            state["input"] = input_data

        # Ensure max_iterations propagates.
        max_iterations = kwargs.pop("max_iterations", 100)

        # Execute from specified start node.
        await self._execute_node(start_node, state, max_iterations)
        return {
            "status": "completed",
            "node_results": {k: v for k, v in state.items() if k not in {"iterations"}},
            "state": state,
        }
