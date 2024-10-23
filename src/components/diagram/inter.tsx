import React, { useState, useRef } from 'react';
import { GoEntity, LinkData } from '../../hooks/use-connector/types';
import { generateUUID } from './canvas';

// Custom link icon component
const LinkIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const InteractiveGraph = ({
  initialNodes = [],
  initialLinks = [],
  onPositionChange,
  onLinkUpdate,
  onLinkCreate,
}: {
  initialNodes: GoEntity[];
  initialLinks: LinkData[];
  onPositionChange: (node: GoEntity) => void;
  onLinkUpdate: (link: LinkData) => void;
  onLinkCreate: (link: LinkData) => void;
}) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [links, setLinks] = useState(initialLinks);
  const [draggedNode, setDraggedNode] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [linkCreationMode, setLinkCreationMode] = useState(false);
  const [linkStart, setLinkStart] = useState(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate node center position
  const getNodeCenter = (node) => {
    if (!node?.loc) return { x: 0, y: 0 };
    const [x, y] = node.loc.split(',').map(Number);
    return { x: x || 0, y: y || 0 };
  };

  // Handle node dragging
  const handleNodeMouseDown = (e, node, isTitle) => {
    setLinkCreationMode(isTitle);
    if (isTitle) {
      setLinkStart(node);
      const rect = svgRef.current.getBoundingClientRect();
      setDraggedNode({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      return;
    }


    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const nodeCenter = getNodeCenter(node);

    setDraggedNode({
      key: node.key,
      offsetX: e.clientX - svgRect.left - nodeCenter.x,
      offsetY: e.clientY - svgRect.top - nodeCenter.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();

    if (linkCreationMode && linkStart) {
      setDraggedNode({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      return;
    }

    if (!draggedNode?.key) return;

    const x = e.clientX - rect.left - draggedNode.offsetX;
    const y = e.clientY - rect.top - draggedNode.offsetY;

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.key === draggedNode.key ? { ...node, loc: `${x},${y}` } : node
      )
    );
  };

  const handleMouseUp = (e) => {
    if (linkCreationMode && linkStart) {
        console.log('link creation mode', linkStart);
        
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const mouseX = e.clientX - svgRect.left;
      const mouseY = e.clientY - svgRect.top;

      // Find if we're over any node (excluding title area)
      const targetNode = nodes.find((node) => {
        const center = getNodeCenter(node);
        // Check if point is inside node rectangle (excluding title area)
        return (
          mouseX >= center.x - 60 &&
          mouseX <= center.x + 60 &&
          mouseY >= center.y - 26 && // Start below title area
          mouseY <= center.y + 50
        );
      });

      console.log('targetNode', targetNode);
      

      if (targetNode && targetNode.key !== linkStart.key) {
        onLinkCreate?.({
          from: linkStart.key,
          to: targetNode.key,
          key: generateUUID(),
          text: '',
          toText: '',
        });
      }

      setLinkStart(null);
      setDraggedNode(null);
      return;
    }

    if (draggedNode?.key) {
      const node = nodes.find((n) => n.key === draggedNode.key);
      if (node) {
        onPositionChange?.(node);
      }
      setDraggedNode(null);
    }
  };
  // Handle link text editing
  const handleLinkClick = (link) => {
    if (link) {
      setEditingLink(link);
    }
  };

  const handleLinkTextChange = (link, field, value) => {
    if (!link) return;

    const updatedLink = { ...link, [field]: value };
    setLinks((prevLinks) =>
      prevLinks.map((l) => (l.key === link.key ? updatedLink : l))
    );
    onLinkUpdate?.(updatedLink);
    setEditingLink(null);
  };

  // Render node
  const renderNode = (node) => {
    if (!node?.key) return null;

    const center = getNodeCenter(node);
    return (
      <g key={node.key} transform={`translate(${center.x},${center.y})`}>
        <rect
          x="-60"
          y="-50"
          width="150"
          height={node.items?.length > 0 ? node.items.length * 20 + 40 : '40'}
          rx="4"
          fill="white"
          stroke="#666"
          strokeWidth="2"

        />

        {/* Node Title */}
        <g
          onMouseDown={(e) => handleNodeMouseDown(e, node, true)}
          className={`cursor-${
            linkCreationMode ? 'crosshair' : 'grab'
          } active:cursor-grabbing`}
        >
          <rect
            x="-60"
            y="-50"
            width="150"
            height="24"
            rx="4"
            fill="#f0f0f0"
            stroke="#666"
            strokeWidth="2"
          />
          <text
            textAnchor="middle"
            y="-34"
            className="text-sm font-medium select-none"
          >
            {node.key}
          </text>
        </g>
        <g 
                  onMouseDown={(e) => handleNodeMouseDown(e, node, false)}
          className="cursor-grab active:cursor-grabbing"
        >
        {/* Attributes Label */}
        <text x="-55" y="-15" className="text-xs font-medium select-none">
          Attributes
        </text>

        {/* Attributes List */}
        <foreignObject
          x="-55"
          y="-5"
          width="140"
          height={node.items?.length * 20}
        >
          <div className="text-xs overflow-y-auto max-h-[45px]">
            {node.items?.map((item, index) => (
              <div key={index} className="truncate">
                {item.name}
              </div>
            ))}
          </div>
        </foreignObject>
        </g>
      </g>
    );
  };
  // Render link
  const renderLink = (link) => {
    if (!link?.key) return null;

    const fromNode = nodes.find((n) => n.key === link.from);
    const toNode = nodes.find((n) => n.key === link.to);
    if (!fromNode?.loc || !toNode?.loc) return null;

    const from = getNodeCenter(fromNode);
    const to = getNodeCenter(toNode);

    // Calculate path
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);

    // Adjust start and end points to be outside the nodes
    const startRadius = 42;
    const endRadius = 42;
    const startX = from.x + Math.cos(angle) * startRadius;
    const startY = from.y + Math.sin(angle) * startRadius;
    const endX = to.x - Math.cos(angle) * endRadius;
    const endY = to.y - Math.sin(angle) * endRadius;

    // Calculate text positions
    const textPos = {
      x: startX + (endX - startX) * 0.3,
      y: startY + (endY - startY) * 0.3 - 10,
    };
    const toTextPos = {
      x: startX + (endX - startX) * 0.7,
      y: startY + (endY - startY) * 0.7 - 10,
    };

    return (
      <g key={link.key}>
        <path
          d={`M${startX},${startY} L${endX},${endY}`}
          stroke="#666"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
          onClick={() => handleLinkClick(link)}
          className="cursor-pointer"
        />

        {editingLink?.key === link.key ? (
          <>
            <foreignObject
              x={textPos.x - 50}
              y={textPos.y - 15}
              width="100"
              height="30"
            >
              <input
                type="text"
                value={link.text || ''}
                onChange={(e) =>
                  handleLinkTextChange(link, 'text', e.target.value)
                }
                className="w-full px-1 text-sm border rounded"
                autoFocus
              />
            </foreignObject>
            <foreignObject
              x={toTextPos.x - 50}
              y={toTextPos.y - 15}
              width="100"
              height="30"
            >
              <input
                type="text"
                value={link.toText || ''}
                onChange={(e) =>
                  handleLinkTextChange(link, 'toText', e.target.value)
                }
                className="w-full px-1 text-sm border rounded"
              />
            </foreignObject>
          </>
        ) : (
          <>
            <text
              x={textPos.x}
              y={textPos.y}
              textAnchor="middle"
              className="text-sm"
            >
              {link.text}
            </text>
            <text
              x={toTextPos.x}
              y={toTextPos.y}
              textAnchor="middle"
              className="text-sm"
            >
              {link.toText}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="relative">

      <svg
        ref={svgRef}
        width="800"
        height="600"
        className="border rounded"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
          </marker>
        </defs>
        <g>
          {Array.isArray(links) && links.map(renderLink)}
          {Array.isArray(nodes) && nodes.map(renderNode)}
          {linkCreationMode && linkStart && draggedNode && (
            <line
              x1={getNodeCenter(linkStart).x}
              y1={getNodeCenter(linkStart).y - 38} // Start from title area
              x2={draggedNode.x}
              y2={draggedNode.y}
              stroke="#666"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </g>
      </svg>
    </div>
  );
};

export default InteractiveGraph;
