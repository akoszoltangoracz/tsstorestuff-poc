import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

import { ResizeMessage } from './models/models';
import * as dao from './models/dao';
import { connectDb } from './services/db';
import { connectStorage, minioClient } from './services/store';
import { connectBus, bus } from './services/bus';
import { JSONCodec } from 'nats';
import { thumbnail } from 'easyimage';

const jc = JSONCodec<ResizeMessage>();

const handleFile = async (message: ResizeMessage): Promise<void> => {
  const tmpPath: string = path.join('tmp', message.srcKey);
  const destPath: string = path.join('tmp', message.destKey);
  await minioClient.fGetObject(message.srcBucket, message.srcKey, tmpPath);

  await thumbnail({
    src: tmpPath,
    dst: destPath,
    width: 150,
    height: 100,
  });

  await dao.updateThumb(message.id, message.destKey);

  await minioClient.fPutObject(message.destBucket, message.destKey, destPath);
  fs.unlinkSync(tmpPath);
  fs.unlinkSync(destPath);
};

const messageLoop = async () => {
  const subscription = bus.connection.subscribe('file_finalized', { queue: 'resizer' });
  for await (const m of subscription) {
    const message: ResizeMessage = jc.decode(m.data);
    console.log(`> received message ${message.srcKey}`);
    await new Promise(r => setTimeout(r, 2000));
    await handleFile(message);
    console.log(`+ finished ${message.srcKey}`);
  }
};

const main = async () => {
  dotenv.config();

  await connectDb();
  await connectStorage();
  await connectBus();

  await messageLoop();
};

main();
