import { exec } from 'child_process';

export async function getExternalIp(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec('curl -4 ifconfig.me', (error, stdout) => {
      if (error) reject(error);

      resolve(stdout.trim());
    });
  });
}
