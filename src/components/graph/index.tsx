import React from 'react';
import InteractiveGraph from '../diagram/inter';
import { useChange } from '../../providers/changes';

type Props = {};

const Graph = () => {
  const { linkData, nodeData, trackNodeChange } = useChange();
  return (
    <InteractiveGraph
      initialLinks={linkData}
      initialNodes={nodeData}
      onLinkCreate={(e) => console.log('link created', e)}
      onLinkUpdate={(e) => console.log('link updated', e)}
      onPositionChange={(e) => trackNodeChange({
        type: 'nodePositionChanged',
        nodeKey: e.key,
        loc: e.loc
      })}
    />
  );
};

export default Graph;
