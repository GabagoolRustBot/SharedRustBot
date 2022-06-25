//fcm-listen as seperate script for testing

const { register, listen } = require('push-receiver');
const path = require('path');

let server;
let fcmClient;

var configJSON = require("./rustplus.config.json")

async function fcmListen(options) {
  // read config file
  //const configFile = getConfigFile(options);
  //const config = readConfig(configFile);
  const config = configJSON

  // make sure fcm credentials are in config
  if(!config.fcm_credentials){
      console.error("FCM Credentials missing. Please run `fcm-register` first.");
      process.exit(1);
      return;
  }

  console.log("Listening for FCM Notifications"); //persistentIDs not included
  fcmClient = await listen(config.fcm_credentials, ({ notification, persistentId }) => {
      // parse notification body
      const body = JSON.parse(notification.data.body);

      // generate timestamp
      const timestamp = new Date().toLocaleString();

      // log timestamp the notification was received (in green colour)
      console.log('\x1b[32m%s\x1b[0m', `[${timestamp}] Notification Received`)

      // log notification body
      console.log(body);

  });
}

async function shutdown() {
  // close chrome instances launched by pair.js
  //await ChromeLauncher.killAll();

  // close express server
  if(server){
      server.close()
  }

  // destroy fcm client
  if(fcmClient){
      fcmClient.destroy();
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

fcmListen([])