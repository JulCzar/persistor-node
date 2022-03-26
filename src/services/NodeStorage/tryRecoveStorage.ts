import fs from 'fs';

export const tryRecoverStorage = (dir: string) => {
  if (fs.existsSync(dir)) {
    try {
      const oldStorage: Record<string, string> = JSON.parse(
        fs.readFileSync(dir, { encoding: 'utf-8' })
      );

      return new Map<string, string>(Object.entries(oldStorage));
    } catch (e) {
      console.warn(e);
      console.warn('unable to recover storage, probably it was corrupted');
      console.log('creating new storage');

      return new Map<string, string>();
    }
  }

  return new Map<string, string>();
};
