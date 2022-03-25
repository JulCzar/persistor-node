import fs from 'fs';

export const tryRecoverStorage = (dir: string) => {
  if (fs.existsSync(dir)) {
    const oldStorage: Record<string, string> = JSON.parse(
      fs.readFileSync(dir, { encoding: 'utf-8' })
    );

    return new Map<string, string>(Object.entries(oldStorage));
  }

  return new Map<string, string>();
};
