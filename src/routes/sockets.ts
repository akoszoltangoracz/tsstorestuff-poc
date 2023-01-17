import * as ws from 'ws';
import { bus } from '../services/bus';
import { JSONCodec } from 'nats';

interface MinioEvent {
  Key: string,
};

const jc = JSONCodec<MinioEvent>();

type ClientMap = {
  [key: number]: ws;
};

let cnt: number = 0;

const sockets: ClientMap = {};

const listenBus = async () => {
  console.log('started listening for uploads');
  const subscription = bus.connection.subscribe('file_uploaded', { queue: 'finalizer' });
  for await (const m of subscription) {
    const message = jc.decode(m.data);

    console.log(`received upload upload ${message.Key}`);

    for (const clientId in sockets) {
      console.log(`--- notified client ${clientId}`);
      sockets[clientId].send(`file uploaded ${message.Key}`);
    }
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
