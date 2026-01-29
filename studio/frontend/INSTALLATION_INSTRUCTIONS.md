# Installation Instructions for New Features

## Required Dependencies

To use the new Visual Workflow Editor features, you need to install the following dependencies:

```bash
cd studio/frontend
npm install @xyflow/react dagre
npm install --save-dev @types/dagre
```

## What's Been Implemented

### 1. ✅ Agent Edit/Update Functionality (COMPLETE)
- **Files Created/Modified**:
  - `src/components/AgentEditModal.tsx` - Full-featured edit modal
  - `src/pages/AgentsPage.tsx` - Updated with edit functionality
- **Status**: Ready to use (no additional dependencies needed)

### 2. 🔧 Visual Workflow Editor (PARTIAL - Needs Dependencies)
- **Files Created**:
  - `src/utils/workflowConverter.ts` - Conversion utilities
  - `src/components/workflow/nodes/BaseNode.tsx` - Base node component
- **Status**: Requires `@xyflow/react` and `dagre` packages to be installed
- **Next Steps**: After installing dependencies, continue with remaining components

### 3. 📋 Workflow Templates (READY TO IMPLEMENT)
- **Status**: Backend and frontend structure ready
- **Next Steps**: Create template data and UI components

### 4. 🧪 Tool Playground (READY TO IMPLEMENT)
- **Status**: Backend API ready
- **Next Steps**: Create playground UI components

## Installation Steps

### Step 1: Install ReactFlow Dependencies
```bash
cd /Users/iimran/Desktop/GenXAI/studio/frontend
npm install @xyflow/react dagre
npm install --save-dev @types/dagre
```

### Step 2: Verify Installation
```bash
npm list @xyflow/react dagre
```

### Step 3: Continue Implementation
Once dependencies are installed, the following components can be created:
- Additional custom node types (AgentNode, ToolNode, etc.)
- WorkflowCanvas component
- Integration with WorkflowBuilderPage
- Workflow templates
- Tool playground

## Alternative: Use Without ReactFlow

If you prefer not to install ReactFlow immediately, you can:

1. **Use the current JSON editor** - Already functional
2. **Use the agent edit feature** - Fully working
3. **Implement templates and playground** - Don't require ReactFlow

The visual editor can be added later when ready.

## Documentation

- **ReactFlow Implementation Plan**: `studio/REACTFLOW_IMPLEMENTATION_PLAN.md`
- **Gap Analysis**: `studio/FRONTEND_GAP_ANALYSIS.md`
- **Studio README**: `studio/README.md`

## Support

If you encounter any issues:
1. Ensure Node.js version is 18+ (`node --version`)
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
