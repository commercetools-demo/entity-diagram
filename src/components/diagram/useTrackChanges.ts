import { useState, useCallback } from 'react';
import { GoEntity } from '../../hooks/use-connector/types';

// Function to generate a UUID based on current date
export const generateUUID = () => {
  const now = new Date();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (now.getTime() + Math.random() * 16) % 16 | 0;
    now.setMilliseconds(now.getMilliseconds() + 1);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export interface LinkData {
  key: string;
  from: string;
  to: string;
  text?: string;
  toText?: string;
}

interface NodeData extends GoEntity {
  position: { x: number; y: number };
}

interface DiagramData {
  linkDataArray: LinkData[];
  nodeDataArray: NodeData[];
}

type ChangeEvent =
  | {
      type: 'nodePositionChanged';
      nodeKey: string;
      newPosition: { x: number; y: number };
    }
  | {
      type: 'linkAdded';
      key: string;
      fromNode: string;
      toNode: string;
      text?: string;
      toText?: string;
    }
  | {
      type: 'linkModified';
      key: string;
      newFromNode: string;
      newToNode: string;
      text?: string;
      toText?: string;
    }
  | { type: 'linkRemoved'; key: string }
  | {
      type: 'linkTextChanged';
      key: string;
      oldText: string;
      newText: string;
      isFromText: boolean;
    };

export const useChangeTracker = (initialData: DiagramData) => {
  const [diagramData, setDiagramData] = useState<DiagramData>(initialData);

  const trackChange = useCallback((change: ChangeEvent) => {
    setDiagramData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData)) as DiagramData; // Deep copy to ensure immutability

      switch (change.type) {
        case 'nodePositionChanged':
          const nodeIndex = newData.nodeDataArray.findIndex(
            (node) => node.key === change.nodeKey
          );
          console.log(change);

          if (nodeIndex !== -1) {
            newData.nodeDataArray[nodeIndex].position = change.newPosition;
          }
          break;

        case 'linkAdded':
          // Check if the link already exists before adding
          const linkExists = newData.linkDataArray.some(
            (link) => link.key === change.key
          );
          if (!linkExists) {
            newData.linkDataArray.push({
              key: change.key,
              from: change.fromNode,
              to: change.toNode,
              text: change.text,
              toText: change.toText,
            });
          }
          break;

        case 'linkModified':
          const linkIndex = newData.linkDataArray.findIndex(
            (link) => link.key === change.key
          );
          if (linkIndex !== -1) {
            newData.linkDataArray[linkIndex] = {
              ...newData.linkDataArray[linkIndex],
              from: change.newFromNode,
              to: change.newToNode,
              text: change.text,
              toText: change.toText,
            };
          }
          break;

        case 'linkRemoved':
          newData.linkDataArray = newData.linkDataArray.filter(
            (link) => link.key !== change.key
          );
          break;

        case 'linkTextChanged':
          const textLinkIndex = newData.linkDataArray.findIndex(
            (link) => link.key === change.key
          );
          if (textLinkIndex !== -1) {
            if (change.isFromText) {
              newData.linkDataArray[textLinkIndex].text = change.newText;
            } else {
              newData.linkDataArray[textLinkIndex].toText = change.newText;
            }
          }
          break;
      }

      return newData;
    });
  }, []);

  return { diagramData, trackChange };
};
