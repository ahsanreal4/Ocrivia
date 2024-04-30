import * as crypto from 'crypto';

export const hashSha256 = (content: string, length: number = 200) => {
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return hash.substring(0, length);
};
