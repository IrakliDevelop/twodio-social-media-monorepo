import { AuthenticatedUser } from '../types';
import WebSocket from 'ws';

declare module 'ws' {
  class _WS extends WebSocket { }
  export interface WebSocket extends _WS {
      user: AuthenticatedUser;
  }
}

export { handleUpgrade } from './server';
