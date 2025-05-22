import { prisma } from './services';

function cleanupExpiredRegistrationTokens() {
  prisma.registrationToken.deleteMany({
    where: {
      used: false,
      validUntil: { lt: new Date() },
    },
  });
}

type Job = {
  name: string;
  fn: () => void;
  interval: number;
  intervalId: NodeJS.Timeout | null;
};

const jobs: Job[] = [
  {
    name: 'cleanupExpiredRegistrationTokens',
    fn: cleanupExpiredRegistrationTokens,
    interval: 1000 * 60 * 60, // 1 hour
    intervalId: null,
  },
];

export function startBackgroundJobs() {
  jobs.forEach((job) => {
    job.intervalId = setInterval(job.fn, job.interval);
  });
}

export function stopBackgroundJobs() {
  jobs.forEach((job) => {
    if (job.intervalId) {
      clearInterval(job.intervalId);
    }
  });
}

process.on('SIGINT', stopBackgroundJobs);
process.on('SIGTERM', stopBackgroundJobs);
process.on('SIGQUIT', stopBackgroundJobs);
