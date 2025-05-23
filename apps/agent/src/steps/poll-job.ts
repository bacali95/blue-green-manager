import { decryptWithPrivateKey } from '@commons/server';

import { api } from '../master';
import { Workflow, type WorkflowStep } from '../workflow';
import { ReadActiveColorStep, WriteFilesStep } from './deploy';
import type { Config } from './get-config';

export class PollJobStep implements WorkflowStep<{ config: Config }, { config: Config }> {
  name = 'poll-job';
  description = 'Poll the job for the agent';
  isStopped = false;

  async run({ config }: { config: Config }) {
    while (!this.isStopped) {
      try {
        const result = await api.agent.poll({ agentId: config.master.agentId });

        if (!result) {
          console.log('Queue is empty, waiting for 1 second');
          continue;
        }

        for (const file of [result.dockerComposeFile, ...result.extraFiles]) {
          file.content = decryptWithPrivateKey(file.content, config.keyPair.privateKey);
        }

        const deploymentWorkflow = new Workflow([
          new ReadActiveColorStep(),
          new WriteFilesStep(),
        ] as const);

        await deploymentWorkflow.run(result);
      } catch (error) {
        console.error(error);
      } finally {
        await sleep(1000);
      }
    }

    return { config };
  }

  stop() {
    this.isStopped = true;
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
