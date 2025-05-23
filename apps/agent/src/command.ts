import { exec } from 'child_process';

export async function tryExecuteWithRetries(command: string, maxRetries = 3, timeoutMs = 10000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await executeWithTimeout(command, timeoutMs);

      return { ...result, status: 'SUCCESS' };
    } catch (err: any) {
      if (attempt === maxRetries) {
        return {
          stdout: '',
          stderr: err.message,
          durationMs: timeoutMs,
          status: err.message === 'Command timed out' ? 'TIMEOUT' : 'FAILED',
        };
      }
    }
  }
}

async function executeWithTimeout(command: string, timeoutMs: number) {
  return new Promise<{ stdout: string; stderr: string; durationMs: number }>((resolve, reject) => {
    const proc = exec(command, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || error.message));
      else resolve({ stdout, stderr, durationMs: timeoutMs });
    });

    setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error('Command timed out'));
    }, timeoutMs);
  });
}
