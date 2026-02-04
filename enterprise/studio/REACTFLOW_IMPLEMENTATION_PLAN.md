# ReactFlow Visual Workflow Editor - Implementation Plan

## 📋 Overview

This document outlines the detailed implementation plan for adding a visual workflow editor to GenXAI Studio using ReactFlow. This will replace the current JSON-based editor with a drag-and-drop visual interface while maintaining backward compatibility.

---

## 🎯 Goals

1. **Visual Workflow Creation**: Drag-and-drop interface for building workflows
2. **Node-Based Architecture**: Support multiple node types (Agent, Tool, Decision, etc.)
3. **Real-time Validation**: Validate workflow structure as users build
4. **Bidirectional Sync**: Seamless conversion between visual and JSON representations
5. **Enhanced UX**: Intuitive interface for non-technical users

---

## 📦 Dependencies

### Required Packages

```json
{
  "dependencies": {
    "@xyflow/react": "^12.0.0",
    "dagre": "^0.8.5"
  },
  "devDependencies": {
    "@types/dagre": "^0.7.52"
  }
}
```

### Installation Command

```bash
cd studio/frontend
npm install @xyflow/react dagre
npm install --save-dev @types/dagre
```

---

## 🏗️ Architecture

### Component Structure

```
studio/frontend/src/
├── components/
│   ├── workflow/
│   │   ├── WorkflowCanvas.tsx          # Main ReactFlow canvas
│   │   ├── NodePalette.tsx             # Draggable node types sidebar
│   │   ├── NodeEditor.tsx              # Side panel for node configuration
│   │   ├── EdgeEditor.tsx              # Edge configuration panel
│   │   ├── ControlPanel.tsx            # Zoom, fit, layout controls
│   │   ├── MiniMap.tsx                 # Workflow overview minimap
│   │   └── nodes/
│   │       ├── AgentNode.tsx           # Agent execution node
│   │       ├── ToolNode.tsx            # Tool invocation node
│   │       ├── DecisionNode.tsx        # Conditional branching
│   │       ├── StartNode.tsx           # Workflow entry point
│   │       ├── EndNode.tsx             # Workflow exit point
│   │       ├── SubworkflowNode.tsx     # Nested workflow
│   │       ├── InputNode.tsx           # User input collection
│   │       └── OutputNode.tsx          # Result formatting
│   └── AgentEditModal.tsx              # (Already implemented)
├── hooks/
│   ├── useWorkflowCanvas.ts            # Canvas state management
│   ├── useAutoLayout.ts                # Auto-layout algorithms
│   └── useWorkflowValidation.ts        # Validation logic
├── store/
│   └── builderStore.ts                 # (Extend existing)
└── utils/
    ├── workflowConverter.ts            # JSON ↔ ReactFlow conversion
    └── layoutAlgorithms.ts             # Dagre integration
```

---

## 🎨 Node Types

### 1. **StartNode**
- **Purpose**: Entry point for workflow execution
- **Properties**: 
  - `input_schema`: Define expected input parameters
- **Visual**: Green circle with play icon
- **Connections**: Outgoing only

### 2. **AgentNode**
- **Purpose**: Execute an agent with specific configuration
- **Properties**:
  - `agent_id`: Reference to agent from catalog
  - `input_mapping`: Map workflow data to agent inputs
  - `output_mapping`: Extract specific outputs
- **Visual**: Blue rounded rectangle with agent icon
- **Connections**: Incoming and outgoing

### 3. **ToolNode**
- **Purpose**: Invoke a specific tool
- **Properties**:
  - `tool_name`: Tool identifier
  - `parameters`: Tool-specific configuration
- **Visual**: Purple hexagon with tool icon
- **Connections**: Incoming and outgoing

### 4. **DecisionNode**
- **Purpose**: Conditional branching based on data
- **Properties**:
  - `condition`: Expression to evaluate
  - `branches`: Multiple output paths
- **Visual**: Yellow diamond with question mark
- **Connections**: One incoming, multiple outgoing

### 5. **SubworkflowNode**
- **Purpose**: Execute another workflow as a step
- **Properties**:
  - `workflow_id`: Reference to nested workflow
  - `input_mapping`: Pass data to subworkflow
- **Visual**: Gray rounded rectangle with nested icon
- **Connections**: Incoming and outgoing

### 6. **InputNode**
- **Purpose**: Collect user input during execution
- **Properties**:
  - `prompt`: Question to ask user
  - `input_type`: text, number, choice, etc.
- **Visual**: Cyan rectangle with input icon
- **Connections**: Incoming and outgoing

### 7. **OutputNode**
- **Purpose**: Format and return workflow results
- **Properties**:
  - `output_template`: Format string for results
  - `output_mapping`: Select data to return
- **Visual**: Green rectangle with output icon
- **Connections**: Incoming and outgoing

### 8. **EndNode**
- **Purpose**: Workflow termination point
- **Properties**: None
- **Visual**: Red circle with stop icon
- **Connections**: Incoming only

---

## 🔄 Data Flow

### JSON to ReactFlow Conversion

```typescript
interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label: string
    config: Record<string, any>
  }
}

interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  data?: {
    condition?: string
    label?: string
  }
}

function convertToReactFlow(workflow: Workflow): {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
} {
  // Convert backend JSON format to ReactFlow format
  // Apply auto-layout if positions are missing
}

function convertFromReactFlow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Workflow {
  // Convert ReactFlow format back to backend JSON
  // Preserve all configuration data
}
```

### State Management Extension

```typescript
// Extend studio/frontend/src/store/builderStore.ts

interface BuilderState {
  // Existing fields
  draftNodes: string
  draftEdges: string
  draftMetadata: string
  
  // New fields for ReactFlow
  reactFlowNodes: Node[]
  reactFlowEdges: Edge[]
  selectedNode: string | null
  selectedEdge: string | null
  viewMode: 'visual' | 'json'
  
  // Actions
  setReactFlowNodes: (nodes: Node[]) => void
  setReactFlowEdges: (edges: Edge[]) => void
  setSelectedNode: (nodeId: string | null) => void
  setSelectedEdge: (edgeId: string | null) => void
  setViewMode: (mode: 'visual' | 'json') => void
  syncToJSON: () => void
  syncFromJSON: () => void
}
```

---

## 🎯 Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
**Goal**: Set up ReactFlow and basic canvas

- [ ] Install dependencies
- [ ] Create `WorkflowCanvas.tsx` with basic ReactFlow setup
- [ ] Implement `workflowConverter.ts` for JSON ↔ ReactFlow conversion
- [ ] Add view mode toggle (Visual/JSON) to `WorkflowBuilderPage.tsx`
- [ ] Extend `builderStore.ts` with ReactFlow state

**Deliverables**:
- Working ReactFlow canvas
- Ability to load existing workflows visually
- Toggle between visual and JSON views

### Phase 2: Node Types (Week 1-2)
**Goal**: Implement all custom node types

- [ ] Create base `CustomNode.tsx` component
- [ ] Implement `StartNode.tsx` and `EndNode.tsx`
- [ ] Implement `AgentNode.tsx` with agent selection
- [ ] Implement `ToolNode.tsx` with tool selection
- [ ] Implement `DecisionNode.tsx` with condition editor
- [ ] Implement `SubworkflowNode.tsx`
- [ ] Implement `InputNode.tsx` and `OutputNode.tsx`
- [ ] Add custom styling for each node type

**Deliverables**:
- All 8 node types functional
- Proper visual distinction between types
- Node configuration panels

### Phase 3: Node Palette & Drag-Drop (Week 2)
**Goal**: Enable workflow creation via drag-and-drop

- [ ] Create `NodePalette.tsx` sidebar
- [ ] Implement drag-and-drop from palette to canvas
- [ ] Add node creation on drop
- [ ] Implement node deletion
- [ ] Add undo/redo functionality

**Deliverables**:
- Functional node palette
- Drag-and-drop workflow creation
- Basic editing operations

### Phase 4: Node & Edge Configuration (Week 2-3)
**Goal**: Enable detailed configuration of nodes and edges

- [ ] Create `NodeEditor.tsx` side panel
- [ ] Implement property editors for each node type
- [ ] Create `EdgeEditor.tsx` for edge conditions
- [ ] Add validation for node configurations
- [ ] Implement real-time validation feedback

**Deliverables**:
- Complete node configuration UI
- Edge condition editor
- Validation system

### Phase 5: Auto-Layout & Controls (Week 3)
**Goal**: Improve workflow visualization

- [ ] Integrate Dagre for auto-layout
- [ ] Create `useAutoLayout.ts` hook
- [ ] Implement `ControlPanel.tsx` with:
  - Zoom in/out
  - Fit to view
  - Auto-layout trigger
  - Grid toggle
- [ ] Add `MiniMap.tsx` for overview
- [ ] Implement snap-to-grid

**Deliverables**:
- Auto-layout functionality
- Complete control panel
- Minimap overview

### Phase 6: Integration & Testing (Week 3-4)
**Goal**: Polish and integrate with existing features

- [ ] Ensure bidirectional sync works perfectly
- [ ] Add workflow validation before save
- [ ] Implement execution visualization (highlight active nodes)
- [ ] Add keyboard shortcuts
- [ ] Write comprehensive tests
- [ ] Update documentation

**Deliverables**:
- Production-ready visual editor
- Test coverage
- User documentation

---

## 🎨 UI/UX Design

### Canvas Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Workflow Builder: [Workflow Name]          [Save] [Run]     │
├──────────┬──────────────────────────────────────┬───────────┤
│          │                                      │           │
│  Node    │                                      │   Node    │
│ Palette  │         ReactFlow Canvas            │  Editor   │
│          │                                      │           │
│ [Start]  │    ┌─────┐                          │ Selected: │
│ [Agent]  │    │Start│                          │ AgentNode │
│ [Tool]   │    └──┬──┘                          │           │
│ [Decision]│      │                             │ Agent:    │
│ [Input]  │    ┌─▼──────┐                      │ [Select]  │
│ [Output] │    │ Agent  │                      │           │
│ [End]    │    │Research│                      │ Config:   │
│          │    └───┬────┘                      │ {...}     │
│          │        │                            │           │
│          │      ┌─▼──┐                        │ [Update]  │
│          │      │End │                        │           │
│          │      └────┘                        │           │
│          │                                      │           │
├──────────┴──────────────────────────────────────┴───────────┤
│ [Visual] [JSON] | Zoom: 100% | Nodes: 3 | Edges: 2         │
└─────────────────────────────────────────────────────────────┘
```

### Color Scheme

- **Start Node**: `#10b981` (green)
- **End Node**: `#ef4444` (red)
- **Agent Node**: `#3b82f6` (blue)
- **Tool Node**: `#8b5cf6` (purple)
- **Decision Node**: `#f59e0b` (yellow)
- **Subworkflow Node**: `#6b7280` (gray)
- **Input Node**: `#06b6d4` (cyan)
- **Output Node**: `#10b981` (green)

### Edge Styles

- **Default**: Solid line, gray
- **Conditional**: Dashed line, yellow
- **Error Path**: Dotted line, red
- **Success Path**: Solid line, green

---

## 🔍 Validation Rules

### Node Validation

1. **Start Node**: Must have at least one outgoing edge
2. **End Node**: Must have at least one incoming edge
3. **Agent Node**: Must reference a valid agent from catalog
4. **Tool Node**: Must reference a valid tool from registry
5. **Decision Node**: Must have at least 2 outgoing edges with conditions
6. **All Nodes**: Must have unique IDs

### Workflow Validation

1. **Must have exactly one Start node**
2. **Must have at least one End node**
3. **No orphaned nodes** (all nodes must be reachable from Start)
4. **No cycles** (unless explicitly allowed for loops)
5. **All edges must connect valid nodes**
6. **Decision branches must be exhaustive** (cover all cases)

---

## 🧪 Testing Strategy

### Unit Tests

- Node component rendering
- Conversion functions (JSON ↔ ReactFlow)
- Validation logic
- Auto-layout algorithms

### Integration Tests

- Drag-and-drop functionality
- Node configuration updates
- Edge creation and deletion
- Save/load workflows

### E2E Tests

- Create workflow from scratch
- Edit existing workflow
- Execute workflow and visualize
- Switch between visual and JSON modes

---

## 📚 Documentation Updates

### User Documentation

1. **Visual Editor Guide**
   - How to create workflows visually
   - Node types and their purposes
   - Connecting nodes
   - Configuring nodes and edges

2. **Migration Guide**
   - Converting JSON workflows to visual
   - Best practices for workflow design

3. **Video Tutorials**
   - Quick start: Create your first workflow
   - Advanced: Complex workflows with decisions

### Developer Documentation

1. **Custom Node Development**
   - How to add new node types
   - Node component API

2. **Extension Points**
   - Custom validation rules
   - Custom layout algorithms

---

## 🚀 Deployment Considerations

### Performance

- **Lazy load** node components
- **Virtualization** for large workflows (100+ nodes)
- **Debounce** auto-save operations
- **Optimize** re-renders with React.memo

### Browser Compatibility

- Test on Chrome, Firefox, Safari, Edge
- Ensure touch support for tablets
- Responsive design for different screen sizes

### Backward Compatibility

- Existing JSON workflows must load correctly
- Preserve all workflow metadata
- Support export to JSON for API compatibility

---

## 📊 Success Metrics

1. **User Adoption**: 80% of users prefer visual editor over JSON
2. **Workflow Creation Time**: 50% reduction in time to create workflows
3. **Error Rate**: 70% reduction in invalid workflow submissions
4. **User Satisfaction**: 4.5+ stars in feedback

---

## 🔮 Future Enhancements

### Phase 5+ (Post-MVP)

1. **Collaborative Editing**: Real-time multi-user editing
2. **Version Control**: Workflow versioning and diff visualization
3. **Templates**: Pre-built workflow templates
4. **AI Assistant**: Suggest workflow improvements
5. **Execution Replay**: Step-through debugging
6. **Performance Metrics**: Node execution time visualization
7. **Custom Themes**: User-customizable color schemes
8. **Export Options**: PNG, SVG, PDF export

---

## 📝 Notes

- **Priority**: High - This is a key differentiator for GenXAI Studio
- **Complexity**: Medium-High - ReactFlow integration is well-documented
- **Timeline**: 3-4 weeks for full implementation
- **Dependencies**: None blocking - can start immediately

---

## 🤝 Team Responsibilities

- **Frontend Developer**: ReactFlow integration, component development
- **UX Designer**: Node designs, color schemes, user flows
- **Backend Developer**: Ensure API compatibility with visual workflows
- **QA Engineer**: Test coverage, E2E testing

---

**Last Updated**: January 28, 2026  
**Status**: Planning Phase  
**Next Review**: After Phase 1 completion
