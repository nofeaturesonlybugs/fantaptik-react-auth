export { default as Authenticated } from './components/Authenticated';
export { default as Guest } from './components/Guest';

export { default as LoginForm } from './components/LoginForm';

export { default as GobFactory } from './components/GobFactory';

export { default as Gob } from './Gob';

import Gob from './Gob';

const __global = new Gob( "__global__" );
export const Actions                = __global.Actions;
export const Reducer                = __global.Reducer;
export const SocketPlugin           = __global.SocketPlugin;
export const Components             = __global.React;
