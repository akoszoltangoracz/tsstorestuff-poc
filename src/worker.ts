import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

import { ResizeMessage, FileStatus } from './models';
import { connectDb, collections } from './services/db';
import { connectStorage, minioClient } from './services/store';
import { connectBus, bus } from './services/bus';
import { JSONCodec } from 'nats';
import { thumbnail } from 'easyimage';
import { ObjectId } from 'mongodb';

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

  await minioClient.fPutObject(message.destBucket, message.destKey, destPath);
  fs.unlinkSync(tmpPath);
  fs.unlinkSync(destPath);

  await collections.fileEntires.updateOne({
    _id: new ObjectId(message.id),
  }, {
    $set: {
      thumb: message.destKey,
      status: FileStatus.Finished,
    },
  })
};

const messageLoop = async () => {
  const subscription = bus.connection.subscribe('file_finalized', { queue: 'resizer' });
  for await (const m of subscription) {
    const message: ResizeMessage = jc.decode(m.data);
    console.log(`> received message ${message.srcKey}`);
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
