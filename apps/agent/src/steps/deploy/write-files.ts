import fs from 'fs';
import os from 'os';
import path from 'path';

import type { WorkflowStep } from '../../workflow';
import type { ReadActiveColorOutput } from './read-active-color';

export type WriteFilesInput = ReadActiveColorOutput;

export type WriteFilesOutput = WriteFilesInput;

export class WriteFilesStep implements WorkflowStep<WriteFilesInput, WriteFilesOutput> {
  name = 'write-files';
  description = 'Write the files to the deployment';

  async run(context: WriteFilesInput) {
    const appPath = path.join(os.homedir(), context.applicationName);

    await fs.promises.mkdir(appPath, { recursive: true });

    return context;
  }
}
