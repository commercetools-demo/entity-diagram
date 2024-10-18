import type { ReactNode } from 'react';
import { useRouteMatch, Link as RouterLink } from 'react-router-dom';
import { useIntl } from 'react-intl';
import Diagram from '../diagram';

type TWrapWithProps = {
  children: ReactNode;
  condition: boolean;
  wrapper: (children: ReactNode) => ReactNode;
};
const WrapWith = (props: TWrapWithProps) => (
  <>{props.condition ? props.wrapper(props.children) : props.children}</>
);
WrapWith.displayName = 'WrapWith';

const App = () => {
  const match = useRouteMatch();
  const intl = useIntl();

  return <Diagram />;
};
App.displayName = 'App';

export default App;
