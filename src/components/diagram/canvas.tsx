import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  KeyboardEventHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styled from 'styled-components';
import { ChangeEvent } from '../../hooks/use-connector/types';
import { useChange } from '../../providers/changes';
import { CustomNode } from './custom-node';
import { CustomEdge } from './custom-edge';
import { edgeMapper, generateUUID, nodeMapper } from './utils';

const StyledDiv = styled.div`
  background-color: white;
  border: solid 1px black;
  width: 100%;
  height: 700px;
`;

const Canvas: React.FC = () => {
  const { linkData, trackLinkChange, nodeData, trackNodeChange } = useChange();
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  // Transform GoEntity nodes to ReactFlow nodes
  const initialNodes: Node[] = useMemo(
    () => nodeData.map(nodeMapper),
    [nodeData]
  );

  // Transform LinkData to ReactFlow edges
  const initialEdges: Edge[] = useMemo(
    () =>
      linkData.map((edge) => {
        const edgeData = edgeMapper(edge);
        return {
          ...edgeData,
          data: {
            ...edgeData.data,
            trackLinkChange,
            setIsEditing: setIsEditingLabel,
          },
        };
      }),
    [linkData, trackLinkChange]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  // Handle node position changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          trackNodeChange({
            type: 'nodePositionChanged',
            nodeKey: change.id,
            loc: `${change.position.x} ${change.position.y}`,
          });
        }
      });
    },
    [trackNodeChange, onNodesChange]
  );

  // Handle edge changes (including removal)
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      changes.forEach((change) => {
        if (change.type === 'remove') {
          trackLinkChange({
            type: 'linkRemoved',
            key: change.id,
          });
        }
      });
    },
    [trackLinkChange, onEdgesChange]
  );

  // Handle new connections
  const handleConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: generateUUID(),
        data: {
          label: '',
          toLabel: '',
          trackLinkChange,
          setIsEditing: setIsEditingLabel,
        },
        type: 'custom',
      };

      setEdges((eds) => addEdge(newEdge, eds));

      trackLinkChange({
        type: 'linkAdded',
        key: newEdge.id,
        fromNode: connection.source,
        toNode: connection.target,
        text: '',
        toText: '',
      });
    },
    [setEdges, trackLinkChange]
  );

  // Custom edge types
  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

  const nodeTypes = useMemo(
    () => ({
      custom: CustomNode,
    }),
    []
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge.id);
  }, []);

  // Handle background click to clear selection
  const onPaneClick = useCallback(() => {
    setSelectedEdge(null);
  }, []);

  const handleKeyDown = (event: any) => {
    if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      selectedEdge &&
      !isEditingLabel
    ) {
      const edgeToDelete = edges.find((edge) => edge.id === selectedEdge);
      if (edgeToDelete) {
        // Remove the edge
        setEdges((edges) => edges.filter((edge) => edge.id !== selectedEdge));

        // Track the change
        trackLinkChange({
          type: 'linkRemoved',
          key: selectedEdge,
          fromNode: edgeToDelete.source,
          toNode: edgeToDelete.target,
        });
      }
      setSelectedEdge(null);
    }
  };

  return (
    <StyledDiv>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onKeyDown={handleKeyDown}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </StyledDiv>
  );
};

export default Canvas;
