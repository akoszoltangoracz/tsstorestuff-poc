import { FileEntry, FileStatus } from './models';
import { collections } from '../services/db';
import { InsertOneResult, UpdateResult } from 'mongodb';
import { BucketItemStat } from 'minio';
import { ObjectId } from 'mongodb';

export const getPendingAndFinished = async (): Promise<FileEntry[]> => {
  return collections
  .fileEntires
  .find({
    status: { $in: [FileStatus.ThumbPending, FileStatus.Finished] }
  })
  .toArray();
}

export const createFile = (file: FileEntry): Promise<InsertOneResult<FileEntry>> => {
  return collections.fileEntires.insertOne(file);
};

export const updateStats = (id: string, stats: BucketItemStat): Promise<UpdateResult> => {
  return collections.fileEntires.updateOne({
    _id: new ObjectId(id),
  }, {
    $set: {
      status: FileStatus.ThumbPending,
      size: stats.size,
      lastModified: stats.lastModified.toISOString(),
    }
  });
};

export const updateThumb = (id: string, thumb: string): Promise<UpdateResult> => {
  return collections.fileEntires.updateOne({
    _id: new ObjectId(id),
  }, {
    $set: {
      thumb,
      status: FileStatus.Finished,
    },
  });
};
