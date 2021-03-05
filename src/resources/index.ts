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

const anyoneTaskQueue = new Resource("eveyone-taskQueue", {
  resource: ["taskrouter", { "workspaces" : flexWorkspace.id }, "taskQueues"],
  attributes: {
      targetWorkers: `1==1`,
      friendlyName: 'Everyone',
  }
});

const workflow = new Resource("anyone", {
  resource: ["taskrouter", { "workspaces" : flexWorkspace.sid }, "workflows"],
  attributes: {
      friendlyName: 'Assign to Anyone',
      configuration: pulumi.all([anyoneTaskQueue.sid])
            .apply(([ anyoneTaskQueueSID ]) => JSON.stringify(
                {
                    task_routing: {
                        filters: [],
                        default_filter: {
                          queue: anyoneTaskQueueSID
                        }
                    }
                }
            ))
  },
});

const environmentFlow = new Resource("example-environment-studio", {
  resource: ["studio", "flows"],
  attributes: {
      commitMessage: "Release of revision 18", 
      friendlyName: 'A New Flow v6',
      status: 'published',
      definition: pulumi.all([workflow.sid]).apply(([workflowSid]) => 
          Studio.getStudioFlowDefinition({
            pathToFlow: "../studio-flows/webchat_flow.json",
          },{
              transformations: [
                  {
                      name: "changeWidgetProps",
                      types: ["send-to-flex"],
                      exec: props => {
                          props.properties.workflow =  workflowSid
                      }
                  },
              ]
          })
      )
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
      serviceName,
      env: pulumi.all([domain]).apply(([ domain ]) => (
          {
              REACT_APP_SERVERLESSassets_DOMAIN_NAME: domain
          }
      )),
      runTestsOnPreview: true
  }
});
