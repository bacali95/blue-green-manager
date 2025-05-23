import { GetConfigStep } from './steps/get-config';
import { PollJobStep } from './steps/poll-job';
import { Workflow } from './workflow';

const workflow = new Workflow([new GetConfigStep(), new PollJobStep()] as const);

workflow.run({});
