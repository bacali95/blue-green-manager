import fs from 'fs';
import os from 'os';
import path from 'path';

import type { AgentPollResult } from '@commons/shared';

import type { WorkflowStep } from '../../workflow';

export type ReadActiveColorInput = AgentPollResult;
export type ReadActiveColorOutput = AgentPollResult & { activeColor: 'blue' | 'green' };

export class ReadActiveColorStep
  implements WorkflowStep<ReadActiveColorInput, ReadActiveColorOutput>
{
  name = 'read-active-color';
  description = 'Read the active color from the deployment';

  async run(context: ReadActiveColorInput) {
    const appPath = path.join(os.homedir(), context.applicationName);
    const colorPath = path.join(appPath, 'active_color');

    return {
      ...context,
      activeColor: (await fs.promises.readFile(colorPath, 'utf8')).trim().toLowerCase() as
        | 'blue'
        | 'green',
    };
  }
}
