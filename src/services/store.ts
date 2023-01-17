import * as minio from 'minio';

export let minioClient: minio.Client;

export const connectStorage = async () => {
  minioClient = new minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10),
    useSSL: false,
    accessKey: process.env.MINIO_KEY,
    secretKey: process.env.MINIO_SECRET,
  });

  console.log('connected to store');
};

export const presignedGetUrl = (bucket: string, key: string): Promise<string> => {
  return new Promise((resolve: (result: string) => void, reject: (error: Error) => void) => {
    minioClient.presignedGetObject(bucket, key, (err: Error, result: string) => {
      if (err) return reject(err);
      return resolve(result);
    })
  });
};

export const presignedPutUrl = (bucket: string, key: string): Promise<string> => {
  return new Promise((resolve: (result: string) => void, reject: (error: Error) => void) => {
    minioClient.presignedPutObject(bucket, key, (err: Error, result: string) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

export const statObject = (bucket: string, key: string): Promise<minio.BucketItemStat> => {
  return new Promise((resolve: (result: minio.BucketItemStat) => void, reject: (error: Error) => void) => {
    minioClient.statObject(bucket, key, (err: Error, result: minio.BucketItemStat) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};
