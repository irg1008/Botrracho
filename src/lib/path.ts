import { basename, extname } from 'node:path';

export const filename = (path: string) => {
  const extension = extname(path);
  return basename(path, extension);
};
