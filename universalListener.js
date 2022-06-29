const { EventEmitter } = require('events');
const { listen } = require('push-receiver');
var configJSON = require("./rustplus.config.json")

class listener extends EventEmitter {
  constructor() {
    super()
    this.prevIDs = []
    this.messageQ
    this.server = undefined
    this.fcmClient = undefined
  }
  async listen(options) {
    // read config file
    const config = configJSON

    // make sure fcm credentials are in config
    if (!config.fcm_credentials) {
      console.error("FCM Credentials missing. Please run `fcm-register` first.");
      //TODO
      process.exit(1);
      return;
    }
    //Listen and send to client
    this.fcmClient = await listen(config.fcm_credentials, ({ notification, prevIDs }) => {
      // parse notification body
      const body = JSON.parse(notification.data.body);
      //Put message at the end of the message queue (not used currently)
      this.messageQ = notification
      //Let clients know new message has been captured
      this.emit("new", notification)
    });
  }

  //Can be used to kill the listener but keep its declared values (not used right now)
  shutdown() {
    // close express server
    if (this.server) {
      this.server.close()
    }
    // destroy fcm client
    if (this.fcmClient) {
      this.fcmClient.destroy();
      console.log("FCM Client ended")
    }
  }
}

module.exports = listener