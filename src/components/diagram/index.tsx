import Canvas from './canvas';
import { ChangeProvider } from '../../providers/changes';

type Props = {};

const Diagram = () => {
  return (
    <ChangeProvider>
      <Canvas />
    </ChangeProvider>
  );
};

export default Diagram;
