import { useState, useCallback } from 'react';
import { GoEntity } from '../../hooks/use-connector/types';
import { useConnector } from '../../hooks/use-connector';

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

export interface NodeData extends GoEntity {
  position: { x: number; y: number };
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

export const useChangeTracker = ({
  linkDataArray,
  nodeDataArray,
}: {
  linkDataArray: LinkData[];
  nodeDataArray: NodeData[];
}) => {
  const [linkData, setLinkData] = useState<LinkData[]>(linkDataArray);
  const [nodeData, setNodeData] = useState<NodeData[]>(nodeDataArray);

  const { saveLinkData } = useConnector();

  const trackLinkChange = useCallback((change: ChangeEvent) => {
    setLinkData((prevData) => {
      let newData = JSON.parse(JSON.stringify(prevData)) as LinkData[]; // Deep copy to ensure immutability

      switch (change.type) {
        case 'linkAdded':
          // Check if the link already exists before adding
          const linkExists = newData.some((link) => link.key === change.key);
          if (!linkExists) {
            newData.push({
              key: change.key,
              from: change.fromNode,
              to: change.toNode,
              text: change.text,
              toText: change.toText,
            });
          }
          break;

        case 'linkModified':
          const linkIndex = newData.findIndex(
            (link) => link.key === change.key
          );
          if (linkIndex !== -1) {
            newData[linkIndex] = {
              ...newData[linkIndex],
              from: change.newFromNode,
              to: change.newToNode,
              text: change.text,
              toText: change.toText,
            };
          }
          break;

        case 'linkRemoved':
          newData = newData.filter((link) => link.key !== change.key);
          break;

        case 'linkTextChanged':
          const textLinkIndex = newData.findIndex(
            (link) => link.key === change.key
          );
          if (textLinkIndex !== -1) {
            if (change.isFromText) {
              newData[textLinkIndex].text = change.newText;
            } else {
              newData[textLinkIndex].toText = change.newText;
            }
          }
          break;
      }

      saveLinkData(newData);

      return newData;
    });
  }, []);

  const trackNodeChange = useCallback((change: ChangeEvent) => {
    setNodeData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData)) as NodeData[]; // Deep copy to ensure immutability

      switch (change.type) {
        case 'nodePositionChanged':
          const nodeIndex = newData.findIndex(
            (node) => node.key === change.nodeKey
          );

          if (nodeIndex !== -1) {
            newData[nodeIndex].position = change.newPosition;
          }
          break;
      }

      return newData;
    });
  }, []);

  return { trackLinkChange, trackNodeChange, linkData, nodeData };
};
