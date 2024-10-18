import { lazy } from 'react';

const App = lazy(() => import('./app' /* webpackChunkName: "main-app" */));

export default App;
