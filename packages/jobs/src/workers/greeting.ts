import type { WorkHandler } from "../boss";

export interface GreetingPayload {
  name: string;
}

export const greetingWorker: WorkHandler<GreetingPayload> = async ([job]) => {
  const { name } = job.data;

  console.log(`[jobs] greeting: Hello, ${name}! (job ${job.id})`);

  return { greeted: true, name };
};
