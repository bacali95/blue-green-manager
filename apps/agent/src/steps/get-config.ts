import { promises } from 'fs';
import path from 'path';

import { generateKeyPair } from '@commons/server';
import type { AgentRegisterResult } from '@commons/shared';

import { api } from '../master';
import { getExternalIp } from '../utils';
import type { WorkflowStep } from '../workflow';

export type Config = {
  ip: string;
  hostname: string;
  registrationToken: string;
  keyPair: { publicKey: string; privateKey: string };
  master?: AgentRegisterResult;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class GetConfigStep implements WorkflowStep<{}, { config: Config }> {
  name = 'get-config';
  description = 'Get the config for the agent';

  async run() {
    const configPath = path.join(process.cwd(), 'config.json');
    const configExists = await promises
      .access(configPath)
      .then(() => true)
      .catch(() => false);

    if (configExists) {
      return { config: JSON.parse(await promises.readFile(configPath, 'utf8')) as Config };
    }

    const config: Config = {
      ip: await getExternalIp(),
      hostname: process.env.HOSTNAME,
      registrationToken: process.env.REGISTRATION_TOKEN,
      keyPair: generateKeyPair(),
      master: null,
    };

    config.master = await api.agent.register({
      ip: config.ip,
      hostname: config.hostname,
      registrationToken: config.registrationToken,
      publicKey: config.keyPair.publicKey,
    });

    await promises.writeFile('config.json', JSON.stringify(config, null, 2));

    return { config };
  }
}
