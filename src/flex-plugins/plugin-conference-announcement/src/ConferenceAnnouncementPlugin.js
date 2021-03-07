import { FlexPlugin } from 'flex-plugin';

const PLUGIN_NAME = 'ConferenceAnnouncementPlugin';

export default class ConferenceAnnouncementPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    console.log("PLUGIN loaded");

    flex.Actions.addListener("beforeAcceptTask", (payload) => {
      payload.conferenceOptions.conferenceStatusCallback = `https://${process.env.REACT_APP_SERVERLESS_DOMAIN_NAME}/set-client-announce`;
      payload.conferenceOptions.conferenceStatusCallbackEvent = "join";
    });
  }
}
