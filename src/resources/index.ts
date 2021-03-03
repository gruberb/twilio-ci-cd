import { CheckServerless, Resource, Serverless, FlexPlugin, Studio } from 'twilio-pulumi-provider';
import * as pulumi from '@pulumi/pulumi';

const stack = pulumi.getStack();

const serviceName = 'serverless';
const domain = CheckServerless.getDomainName(serviceName, stack);

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


const serverless = new Serverless("functions-assets", {
  attributes: {
      cwd: `../serverless/main`,
      serviceName,          
      envPath: `.${stack}.env`,
      functionsEnv: stack,
      pkgJson: require("../serverless/main/package.json")
  }
});


const soundNotificationFlexPlugin = new FlexPlugin("sound-notification-flex-plugin", { 
  attributes: {
      cwd: "../flex-plugins/plugin-sound-notification",
      env: pulumi.all([domain]).apply(([ domain ]) => (
          {
              REACT_APP_SERVERLESSassets_DOMAIN_NAME: domain
          }
      )),
      runTestsOnPreview: true
  }
});
