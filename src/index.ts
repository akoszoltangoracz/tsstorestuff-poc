import expressWs from 'express-ws';
import express, { Application } from 'express';
import dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import morgan from 'morgan';

import { connectDb } from './services/db';
import { connectStorage } from './services/store';
import { connectBus } from './services/bus';
import { initSocket } from './routes/sockets';
import { listFiles, createFile, downloadFile, finalizeFile } from './routes/files';

const main = async () => {
  dotenv.config();

  const app: Application = express();

  expressWs(app);

  app.use(morgan('tiny'));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use('/static', express.static('static'));

  let port: number = 8001;

  if (process.env.PORT) port = parseInt(process.env.PORT);

  await connectDb();
  await connectStorage();
  await connectBus();

  app.get('/api/files', listFiles);
  app.post('/api/files', createFile);
  app.post('/api/files/:id/finalize', finalizeFile);
  app.get('/api/files/:id/download', downloadFile);

  initSocket(app);

  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

main();
