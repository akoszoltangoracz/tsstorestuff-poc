import { MongoClient, Collection, Db } from 'mongodb';
import { FileEntry } from '../models';

interface DbCollections {
  fileEntires?: Collection<FileEntry>,
};

export let collections: DbCollections = {};

export function connectDb() {
  const client = new MongoClient(process.env.MONGODB_URI);
  const db: Db = client.db(process.env.MONGODB_DATABASE);
  
  collections.fileEntires = db.collection<FileEntry>('fileEntires');
  console.log('connected to db');
};
