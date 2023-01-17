import {Request, Response} from 'express';
import { presignedPutUrl, statObject, minioClient }  from '../services/store';
import { collections } from '../services/db';
import { bus } from '../services/bus';
import { FileEntry, FileStatus, ResizeMessage, FileWithThumb } from '../models/models';
import { ObjectId } from 'mongodb';
import { JSONCodec } from 'nats';
import { BucketItemStat } from 'minio';
import * as dao from '../models/dao';

const jc = JSONCodec();

type AsyncHandler = (req: Request, res: Response) => Promise<void>;

interface UploadRequest {
  name: string,
};

interface UrlResponse {
  id: string,
  url: string,
};

interface ErrorResponse {
  error: string,
};

const sendThumbMsg = (file: FileEntry): void => {
  const resizeMessage: ResizeMessage = {
    id: file._id.toString(),
    srcBucket: process.env.MINIO_BUCKET,
    srcKey: file.name,
    destBucket: process.env.MINIO_BUCKET,
    destKey: `thumb-${file.name}`,
  };

  bus.connection.publish('file_finalized', jc.encode(resizeMessage));
};

const presignThumbs = async (files: FileEntry[]): Promise<FileWithThumb[]> => {
  const presignedFiles: FileWithThumb[] = [];

  for (const file of files) {
    if (file.status === FileStatus.Finished) {
      const presignedThumb = await minioClient.presignedGetObject(process.env.MINIO_BUCKET, file.thumb);

      const presignedFile: FileWithThumb = {
        ...file,
        presignedThumb,
      };

      presignedFiles.push(presignedFile);
    } else {
      presignedFiles.push(file);
    }
  }
  return presignedFiles;
};

export const listFiles: AsyncHandler = async (req: Request, res: Response) => {
  try {
    const files: FileEntry[] = await dao.getPendingAndFinished();

    const presignedFiles: FileWithThumb[] = await presignThumbs(files);
    res.json(presignedFiles);
  } catch (err) {
    console.log(err);
    const errorResponse: ErrorResponse = {
      error: err.message,
    }
    res.status(500).json(errorResponse);
  }
};

export const createFile: AsyncHandler = async (req: Request<{}, {}, UploadRequest>, res: Response<UrlResponse>) => {
  const uploadRequest: UploadRequest = req.body as UploadRequest;
  const url: string = await presignedPutUrl(process.env.MINIO_BUCKET, uploadRequest.name);

  const existingFile: FileEntry = await collections.fileEntires.findOne({ name: uploadRequest.name });

  let fileId: ObjectId;
  if (!existingFile) {
    fileId = new ObjectId();
  
    const toInsert: FileEntry = {
      _id: fileId,
      name: uploadRequest.name,
      status: FileStatus.New,
      tags: [],
    };
    await dao.createFile(toInsert);
  } else {
    fileId = existingFile._id;
  }

  const response: UrlResponse = {
    url,
    id: fileId.toString(),
  };

  res.json(response);
};

export const finalizeFile: AsyncHandler = async (req: Request, res: Response<object, any>) => {
  const { id } = req.params;

  try {
    const file: FileEntry = await collections.fileEntires.findOne({ _id: new ObjectId(id) });
    if (!file) throw new Error('file not found');
    const stats: BucketItemStat = await statObject(process.env.MINIO_BUCKET, file.name);

    await dao.updateStats(id, stats);

    await sendThumbMsg(file);
    res.json({});
  } catch (err) {
    console.log(err);
    const errorResponse: ErrorResponse = {
      error: err.message,
    }
    res.status(500).json(errorResponse);
  }
};

export const downloadFile: AsyncHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const file: FileEntry = await collections.fileEntires.findOne({ _id: new ObjectId(id) });
    if (!file) throw new Error('file not found');
    const url: string = await minioClient.presignedGetObject(process.env.MINIO_BUCKET, file.name);

    res.redirect(url);
  } catch (err) {
    console.log(err);
    const errorResponse: ErrorResponse = {
      error: err.message,
    }
    res.status(500).json(errorResponse);
  }
};
