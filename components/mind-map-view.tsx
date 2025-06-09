"use client"

import { useCallback, useEffect, useState } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface MindMapViewProps {
  content: string
  title: string
}

// Node types
const nodeTypes = {
  heading1: { fontSize: 20, fontWeight: "bold", padding: 16, borderRadius: 8, backgroundColor: "#f0f9ff" },
  heading2: { fontSize: 18, fontWeight: "bold", padding: 14, borderRadius: 6, backgroundColor: "#f0fdf4" },
  heading3: { fontSize: 16, fontWeight: "bold", padding: 12, borderRadius: 5, backgroundColor: "#fef2f2" },
  heading4: { fontSize: 14, fontWeight: "bold", padding: 10, borderRadius: 4, backgroundColor: "#fdf4ff" },
  paragraph: { fontSize: 12, padding: 8, borderRadius: 4, backgroundColor: "#f9fafb" },
  list: { fontSize: 12, padding: 8, borderRadius: 4, backgroundColor: "#f5f3ff" },
}

// Parse markdown content to create nodes and edges
const parseMarkdownToGraph = (content: string, title: string) => {
  const lines = content.split("\n")
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Add root node (title)
  nodes.push({
    id: "root",
    data: { label: title || "Untitled Note" },
    position: { x: 0, y: 0 },
    style: { ...nodeTypes.heading1, width: 200 },
    sourcePosition: Position.Right,
  })

  let currentParentId = "root"
  const lastNodeAtLevel: Record<number, string> = { 0: "root" }
  let currentLevel = 0
  const x = 250 // Starting x position for first level nodes
  const y = -200 // Starting y position
  const yOffset = 100 // Vertical spacing between nodes
  const xOffset = 250 // Horizontal spacing between levels

  lines.forEach((line, index) => {
    line = line.trim()
    if (!line) return

    // Skip lines that are just separators
    if (line.match(/^[-*=_]{3,}$/)) return

    // Determine node type and level
    let nodeType = "paragraph"
    let level = 1
    let text = line

    // Headings
    if (line.startsWith("# ")) {
      nodeType = "heading1"
      level = 1
      text = line.substring(2)
    } else if (line.startsWith("## ")) {
      nodeType = "heading2"
      level = 2
      text = line.substring(3)
    } else if (line.startsWith("### ")) {
      nodeType = "heading3"
      level = 3
      text = line.substring(4)
    } else if (line.startsWith("#### ")) {
      nodeType = "heading4"
      level = 4
      text = line.substring(5)
    }
    // Lists
    else if (line.match(/^[*-] /)) {
      nodeType = "list"
      level = currentLevel + 1
      text = line.substring(2)
    } else if (line.match(/^\d+\. /)) {
      nodeType = "list"
      level = currentLevel + 1
      text = line.substring(line.indexOf(". ") + 2)
    }
    // Task lists
    else if (line.match(/^[*-] \[ \] /)) {
      nodeType = "list"
      level = currentLevel + 1
      text = "☐ " + line.substring(6)
    } else if (line.match(/^[*-] \[x\] /)) {
      nodeType = "list"
      level = currentLevel + 1
      text = "☑ " + line.substring(6)
    }
    // Paragraphs - only create nodes for paragraphs that are short
    else if (line.length < 100) {
      nodeType = "paragraph"
      level = currentLevel + 1
    } else {
      // Skip long paragraphs
      return
    }

    // Clean up text (remove markdown formatting)
    text = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
      .replace(/\*(.*?)\*/g, "$1") // Italic
      .replace(/`(.*?)`/g, "$1") // Code
      .replace(/\[(.*?)\]$$(.*?)$$/g, "$1") // Links
      .replace(/!\[(.*?)\]$$(.*?)$$/g, "$1") // Images

    // Limit text length
    if (text.length > 50) {
      text = text.substring(0, 47) + "..."
    }

    // Create node ID
    const nodeId = `node-${index}`

    // Determine parent node
    if (level > currentLevel) {
      currentParentId = lastNodeAtLevel[currentLevel]
    } else if (level < currentLevel) {
      currentParentId = lastNodeAtLevel[level - 1]
    } else {
      currentParentId = lastNodeAtLevel[level - 1]
    }

    // Update current level
    currentLevel = level

    // Calculate position
    const nodeX = x + (level - 1) * xOffset
    const nodeY = y + Object.keys(nodes).length * yOffset

    // Create node
    nodes.push({
      id: nodeId,
      data: { label: text },
      position: { x: nodeX, y: nodeY },
      style: { ...nodeTypes[nodeType as keyof typeof nodeTypes], width: 180 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    })

    // Create edge
    edges.push({
      id: `edge-${currentParentId}-${nodeId}`,
      source: currentParentId,
      target: nodeId,
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
      },
      style: { stroke: "#d1d5db" },
    })

    // Update last node at this level
    lastNodeAtLevel[level] = nodeId
  })

  return { nodes, edges }
}

export function MindMapView({ content, title }: MindMapViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isLoading, setIsLoading] = useState(true)

  // Generate mind map from markdown
  const generateMindMap = useCallback(() => {
    setIsLoading(true)
    const { nodes: newNodes, edges: newEdges } = parseMarkdownToGraph(content, title)
    setNodes(newNodes)
    setEdges(newEdges)
    setIsLoading(false)
  }, [content, title, setNodes, setEdges])

  // Generate mind map on initial render and when content changes
  useEffect(() => {
    generateMindMap()
  }, [generateMindMap])

  return (
    <div className="h-full w-full">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-300" />
            <p className="mt-2 text-gray-500">Generating mind map...</p>
          </div>
        </div>
      ) : (
        <div className="relative h-full w-full">
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 rounded-md border-gray-200 p-0"
              onClick={generateMindMap}
              title="Refresh mind map"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#f9fafb" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
      )}
    </div>
  )
}
