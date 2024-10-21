import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ComponentConfig } from '../../components/library/general';
import { useConnector } from '../hooks/use-connector';
import {
  ChangeEvent,
  GoEntity,
  LinkData,
  NodeData,
} from '../hooks/use-connector/types';

interface ChangeContextType {
  trackLinkChange: (change: ChangeEvent) => void;
  trackNodeChange: (change: ChangeEvent) => void;
  linkData: LinkData[];
  nodeData: GoEntity[];
}

const ChangeContext = createContext<ChangeContextType | undefined>(undefined);

export const ChangeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { fetchAll, saveLinkData } = useConnector();

  const [data, setData] = useState<GoEntity[]>();
  const [links, setLinks] = useState<LinkData[]>();

  const trackLinkChange = useCallback(
    (change: ChangeEvent) => {
      setLinks((prevData) => {
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

        return newData;
      });
    },
    [links]
  );

  const trackNodeChange = useCallback((change: ChangeEvent) => {
    setData((prevData) => {
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

  useEffect(() => {
    const handler = setTimeout(() => {
      saveLinkData(links ?? []);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [links]);

  useEffect(() => {
    fetchAll().then((result) => {
      const { schemas, productTypes, types, linkData } = result;
      setData([...schemas, ...productTypes, ...types]);
      setLinks(linkData ?? []);
    });
  }, []);

  if (!data || !links) {
    return null;
  }

  return (
    <ChangeContext.Provider
      value={{
        trackLinkChange,
        trackNodeChange,
        nodeData: data,
        linkData: links,
      }}
    >
      {children}
    </ChangeContext.Provider>
  );
};

export const useChange = () => {
  const context = useContext(ChangeContext);
  if (context === undefined) {
    throw new Error('useClipboard must be used within App');
  }
  return context;
};
