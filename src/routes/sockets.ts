import * as ws from 'ws';
import { connectBus, bus } from '../services/bus';

type ClientMap = {
  [key: number]: ws;
};

let cnt: number = 0;

const sockets: ClientMap = {};

const listenBus = async () => {
  const subscription = bus.connection.subscribe('file_uploaded', { queue: 'finalizer' });
  for await (const m of subscription) {
    console.log('file uploaded');
  }
}

export const initSocket = (app: any) => {
  listenBus();

  app.ws('/ws', (ws: ws) => {
    const currentClient: number = cnt ++;
    console.log(`ws connected ${currentClient}`);
    sockets[currentClient] = ws;

    ws.on('close', () => {
      console.log(`close ${currentClient}`);
      delete sockets[currentClient];
    });
  });
};
