import { ChangeProvider } from '../../providers/changes';
import Graph from '../graph';

type Props = {};

const Diagram = () => {
  return (
    <ChangeProvider>
      <Graph />
    </ChangeProvider>
  );
};

export default Diagram;
