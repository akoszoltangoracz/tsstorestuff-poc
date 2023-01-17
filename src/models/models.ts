import { ObjectId } from 'mongodb';

export enum FileStatus {
  New = 'NEW',
  ThumbPending = 'THUMB_PENDING',
  Finished = 'FINISHED',
};

export interface FileEntry {
  _id: ObjectId,
  name?: string,
  lastModified?: string,
  size?: number,
  thumb?: string,
  tags: string[],
  status: FileStatus,
};

export interface FileWithThumb extends FileEntry {
  presignedThumb?: string,
};

export interface ResizeMessage {
  id: string,
  srcBucket: string,
  srcKey: string,
  destBucket: string,
  destKey: string,
};
