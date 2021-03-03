import { CheckServerless, Resource, Serverless, FlexPlugin, Studio } from 'twilio-pulumi-provider';

const flexWorkspace = new Resource("flex-workspace", {
  resource: ["taskrouter", "workspaces"],
  attributes: {
      sid: process.env.FLEX_WORKFLOW_SID,
  }
});

const englishTaskQueue = new Resource("english-taskQueue", {
  resource: ["taskrouter", { "workspaces" : flexWorkspace.id }, "taskQueues"],
  attributes: {
      targetWorkers: `languages HAS "english"`,
      friendlyName: 'English Queue',
  }
});
