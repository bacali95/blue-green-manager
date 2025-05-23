export interface WorkflowStep<Input, Output extends Input> {
  name: string;
  description: string;
  run: (context: Input) => Promise<Output>;
  stop?: () => void;
}

type StepInput<T> = T extends WorkflowStep<infer I, any> ? I : never;

type StepOutput<T> = T extends WorkflowStep<any, infer O> ? O : never;

export type AreStepsCompatible<Steps extends WorkflowStep<any, any>[]> = Steps extends [
  infer First,
  infer Second,
  ...infer Rest,
]
  ? First extends WorkflowStep<any, any>
    ? Second extends WorkflowStep<any, any>
      ? StepInput<Second> extends StepOutput<First>
        ? Rest extends WorkflowStep<any, any>[]
          ? AreStepsCompatible<[Second, ...Rest]>
          : true
        : ['Incompatible step types', StepOutput<Second>, StepInput<First>]
      : true
    : true
  : true;

export class Workflow<Steps extends WorkflowStep<any, any>[]> {
  steps: Steps;

  constructor(steps: AreStepsCompatible<Steps> extends true ? Steps : AreStepsCompatible<Steps>) {
    this.steps = steps as Steps;
  }

  async run(context: StepInput<Steps[0]>) {
    let output: StepOutput<Steps[0]> = { ...context } as StepOutput<Steps[0]>;

    for (const step of this.steps) {
      output = (await step.run(output)) as StepOutput<Steps[0]>;
    }

    return output;
  }

  stop() {
    this.steps.forEach((step) => step.stop?.());
  }
}
