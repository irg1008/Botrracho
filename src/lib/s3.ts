import { env } from '@/config/env';
import {
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
  type GetObjectCommandInput,
  type ListObjectsCommandInput,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';

const client = new S3Client({
  region: env.s3Region,
  endpoint: env.s3Endpoint,
  credentials: {
    accessKeyId: env.s3KeyId,
    secretAccessKey: env.s3SecretKey,
  },
});

const Bucket = env.s3Bucket;

type Bucketless<T> = Omit<T, 'Bucket'>;

export const s3 = {
  client,

  upload: (input: Bucketless<PutObjectCommandInput>) =>
    client.send(new PutObjectCommand({ Bucket, ...input })),

  list: (input?: Bucketless<ListObjectsCommandInput>) =>
    client.send(new ListObjectsCommand({ Bucket, ...input })),

  get: (input: Bucketless<GetObjectCommandInput>) =>
    client.send(new GetObjectCommand({ Bucket, ...input })),
};
