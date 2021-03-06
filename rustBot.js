//Scan for messages command: npx @liamcottle/rustplus.js fcm-listen

const process = require('process');
const { exec } = require('child_process');
const RustPlus = require("@liamcottle/rustplus.js");
const userData = require("./user.json")
const assets = require("./assets.json")
//const { register, listen } = require('push-receiver');     //For listener if added back
const fs = require('fs');
const listener = require("./universalListener")

//String for name of JSON file being read (as opposed to hardcoding), can be changed via arguments later
var pathString = "server.json"//Using hardcoding for testing
//var pathString = process.argv[2]//First arg in command line call = path to json, or just filename if in root
var jData = require("./" + pathString)
//Config JSON if needed later
var configJSON = require("./rustplus.config.json")

//Global boolean for tracking if bot is paused, starts unpaused
var paused = false

//Outer scope declaration of ID arrays
var turretSwitches
var samSwitches
var lightSwitches
var heatSwitches
var StorageMonitors

//Command key for servers where ! is being used, define in each server JSON and assign here isntead
var commandKey = jData.serverCommandKey

//Store the most recent notification from listener. Set to undefined if none / most recent has been read and deprecated
var lastNotif = undefined
var notifTimestamp
//Tell when the user wants to monitor output
var monitor = false
//Global listener decloration
var myListener = new listener
//Listener behavior functions
myListener.on("new", (notification) => {
  //Save notificaiton object and record timestamp
  lastNotif = notification
  notifTimestamp = new Date().toLocaleString();
  //console.log("Bot heard " + JSON.parse(notification.data.body).entityId)
})

//Fucntion for pulling info from JSON, ran before any switch array calls for most recent data
function readData() {
  //Delete old data from cache
  delete require.cache[require.resolve("./" + pathString)]
  //Load new data
  jData = require("./" + pathString)
  //Assign new data
  turretSwitches = jData.turretSwitches
  samSwitches = jData.samSwitches
  lightSwitches = jData.lightSwitches
  heatSwitches = jData.heatSwitches
  StorageMonitors = jData.StorageMonitors
}

//Helper function for switch calls, takes switch type as string, and on/off as 1/0
function genericSwitch(switchType, switchPosition) {
  var targetArr = []
  switch (switchType) {
    case "Turrets":
      targetArr = turretSwitches
      break
    case "SAMs":
      targetArr = samSwitches
      break
    case "Lights":
      targetArr = lightSwitches
      break
    case "Heaters":
      targetArr = heatSwitches
      break
    //TODO error catch maybe
  }
  switch (switchPosition) {
    case 0:
      for (var i = 0; i < targetArr.length; i++) {
        rustplus.turnSmartSwitchOff(targetArr[i], (message) => {
          //TODO add error catch from message
          return true;
        });
      }
      rustplus.sendTeamMessage("BOT: " + switchType + " off");
      break
    case 1:
      for (var i = 0; i < targetArr.length; i++) {
        rustplus.turnSmartSwitchOn(targetArr[i], (message) => {
          //TODO add error catch from message
          return true;
        });
      }
      rustplus.sendTeamMessage("BOT: " + switchType + " on");
      break
  }
}

//Append data to JSON. Takes data to append and the key to append to as string (TurretSwitches etc). 
function appendJSON(newData, key, rustPlusInstance) {
  fs.readFile("./" + pathString, 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
      rustPlusInstance.sendTeamMessage("BOT: There was an error, switch not added.")
    }
    else {
      obj = JSON.parse(data);
      //Check for existing
      if(data.includes(newData)){
        rustPlusInstance.sendTeamMessage("BOT: Switch has already been added.")
      }
      //If not add
      else{
        switch (key) {
          case "Turrets":
            obj.turretSwitches.push(newData);
            break
          case "SAMs":
            obj.samSwitches.push(newData);
            break
          case "Lights":
            obj.lightSwitches.push(newData);
            break
          case "Heaters":
            obj.heaterSwitches.push(newData);
            break
          case "Storage":
            obj.storageMonitors.push(newData);
            break
        }
        json = JSON.stringify(obj); //convert it back to json
        fs.writeFile("./" + pathString, json, 'utf8', function () { x => True }); // write it back
        rustPlusInstance.sendTeamMessage("BOT: Switch added!")
      }
      
    }
  });
  //console.log("Wrote " + newData + " to " + key)
}

//Check to see if the message was sent by the bot owner
function checkSender(message){
  if(message.includes(userData.userID)){
    return true
  }
  else{
    return false
  }
}

//BOT START----------------------------------
//Banner
assets.banner.forEach(x => { console.log(x) })

//JSON server data used instead of hardcoding 
var rustplus = new RustPlus(jData.serverIP, jData.serverPort, userData.userID, userData.userToken);

//Connect to rust server
console.log("Starting");
rustplus.connect();

// wait until connected before sending commands
rustplus.on("connected", () => {
  console.log("Connected");
  rustplus.sendTeamMessage("BOT: Bot connected");
  // ready to send requests
  //Update server.json
  readData()
  //Start listener
  myListener.listen()
});

//Send team message when heard a notif when listening
myListener.on("new", (notification) => {
  if(monitor){
    var ID = "ERROR"
    ID = JSON.parse(notification.data.body).entityId
    rustplus.sendTeamMessage("BOT: Heard switch number: " + ID);
  }
})

//Bot Commands
rustplus.on("message", (message) => {
  //Refresh data, "brute force" placement here, refreshing after every message, 
  //can be placed inside command calls to lighten loads if need be
  readData()
  //Message event JSON from broadcast, as string
  var str = JSON.stringify(message);
  //console.log(str)
  //Block if paused
  if (!paused) {
    //SAM
    if (str.includes(commandKey + "samon")) {
      genericSwitch("SAMs", 1)
    }
    else if (str.includes(commandKey + "samoff")) {
      genericSwitch("SAMs", 0)
    }
    //TURRETS
    else if (str.includes(commandKey + "tton")) {
      genericSwitch("Turrets", 1)
    }
    else if (str.includes(commandKey + "ttoff")) {
      genericSwitch("Turrets", 0)
    }
    //LIGHTS
    else if (str.includes(commandKey + "lightson")) {
      genericSwitch("Lights", 1)
    }
    else if (str.includes(commandKey + "lightsoff")) {
      genericSwitch("Lights", 0)
    }
    //HEATERS
    else if (str.includes(commandKey + "heaterson")) {
      genericSwitch("Heaters", 1)
    }
    else if (str.includes(commandKey + "heatersoff")) {
      genericSwitch("Heaters", 0)
    }
    else if (str.includes(commandKey + "upkeep")) {
      for (let i = 0; i < StorageMonitors.length; ++i) {
        rustplus.getEntityInfo(StorageMonitors[i], (mess) => {
          var st = JSON.stringify(mess);
          //console.log(st);

          var start = st.search("protectionExpiry");
          st = st.slice(start);
          var end = st.search("}");
          st = st.slice(18, end); //Hard Coded, yes I know its bad. 

          var rawTime = parseInt(st);
          //console.log(st);

          let day = 86400;
          let hour = 3600;
          let minute = 60;

          let decayTime = Math.floor((rawTime * 1000 - Date.now()) / 1000);
          let days = Math.floor(decayTime / day);
          let hours = Math.floor((decayTime - days * day) / hour);
          let minutes = Math.floor((decayTime - days * day - hours * hour) / minute);
          let seconds = decayTime - days * day - hours * hour - minutes * minute;
          //I want to put everything above this into a helper function but I"m not sure how to do that in NodeJS yet. 
          if (i == 0) {
            rustplus.sendTeamMessage("MAIN TC:    " + days + "D " + hours + "H " + minutes + "M " + seconds + "S");
          } else {
            rustplus.sendTeamMessage("GATE " + (i) + ":      " + days + "D " + hours + "H " + minutes + "M " + seconds + "S");
          }

        });

      }

    }
    else if (str.includes(commandKey + "rockets")) {
      rustplus.sendTeamMessage("BOT: The rockets exist");
    }
    else if (str.includes(commandKey + "status")) {
      rustplus.sendTeamMessage("BOT: Bot is connected and on");
    }
    else if (str.includes(commandKey + "raid")) {
      genericSwitch("SAMs", 1)
      genericSwitch("Turrets", 1)
      genericSwitch("Heaters", 1)
      genericSwitch("Lightss", 1)
      rustplus.sendTeamMessage("BOT: Everything is on. Godspeed.");
    }
    else if (str.includes(commandKey + "help")) {
      rustplus.sendTeamMessage("BOT: Commands: TODO");
    }
    else if(str.includes(commandKey + "botoff")){
      if(checkSender(str)){
        paused = true
        rustplus.sendTeamMessage("BOT: Bot is off");
      }
    }
    //Prepare listener and cache for capture
    else if(str.includes(commandKey + "listen")){
      //Must check sender for all lisener based commands. Only owner since its only their notifs
      if(checkSender(str)){
        //Enable monitor for new notifs in team chat
        monitor = true
        //Reset cache
        lastNotif = undefined
        notifTimestamp = undefined
        rustplus.sendTeamMessage("BOT: Listening, pair switch now");
      }
    }
    //Optional check of the data in cache before saving
    else if(str.includes(commandKey + "check")){
      if(checkSender(str)){
        //Lowest level error check
        if(lastNotif == undefined){
          rustplus.sendTeamMessage("BOT: Erorr, try pairing again");
        }
        else{
          var body = JSON.parse(lastNotif.data.body)
          console.log(body)
          rustplus.sendTeamMessage("BOT: Saved notification from: " + notifTimestamp)
          rustplus.sendTeamMessage("BOT: Type: " + body.entityName)
          rustplus.sendTeamMessage("BOT: ID Number: " + body.entityId)
        }
      }
    }
    //Use appendJSON to add data and reset cache
    else if(str.includes(commandKey + "addtt")){
      if(checkSender(str)){
        //Body as new object
        var ID = JSON.parse(lastNotif.data.body).entityId
        //TODO --- Error checking for notif type and values
        //Add
        appendJSON(ID, "Turrets", rustplus)
        //Testing "Add"
        //console.log("Added: "+ JSON.parse(lastNotif.data.body).entityId)
        //Notify
        //rustplus.sendTeamMessage("BOT: Switch " + ID + " added under Turrets");
        //Reset for new messgae
        lastNotif = undefined
        monitor = false
      }
    }
    else if(str.includes(commandKey + "addsam")){
      if(checkSender(str)){
        var ID = JSON.parse(lastNotif.data.body).entityId
        appendJSON(ID, "SAMs", rustplus)
        lastNotif = undefined
        monitor = false
      }
    }
    else if(str.includes(commandKey + "addlight")){
      if(checkSender(str)){
        var ID = JSON.parse(lastNotif.data.body).entityId
        appendJSON(ID, "Lights", rustplus)
        lastNotif = undefined
        monitor = false
      }
    }
    else if (str.includes(commandKey + "addheater")) {
      if (checkSender(str)) {
        var ID = JSON.parse(lastNotif.data.body).entityId
        appendJSON(ID, "Heaters", rustplus)
        lastNotif = undefined
        monitor = false
      }
    }
    //PULL / PUSH  COMMANDS
    else if (str.includes(commandKey + "refresh")) {
      if (checkSender(str)) {
        var proc = exec('_UPDATE.bat')
        proc.stdout.on('data', function (data) {
          //console.log(data.toString());
        });
        proc.stderr.on('data', function (data) {
          console.log(data.toString());
        });
        proc.on('exit', function (code) {
          //console.log('0 if success: ' + code);
          if (code == 0) {
            rustplus.sendTeamMessage("BOT: Success")
          }
          else {
            rustplus.sendTeamMessage("BOT: Fail, check log")
          }
        });
      }
    }
    else if (str.includes(commandKey + "adminup")) {
      if (checkSender(str)) {
        var proc = exec('pushAdmin.bat')
        proc.stdout.on('data', function (data) {
          console.log(data.toString());
        });
        proc.stderr.on('data', function (data) {
          console.log(data.toString());
        });
        proc.on('exit', function (code) {
          //console.log('0 if success: ' + code);
          if (code == 0) {
            rustplus.sendTeamMessage("BOT: Success")
          }
          else {
            rustplus.sendTeamMessage("BOT: Fail, check log")
          }
        });
      }
    }
    /*else if (str.includes(commandKey + "upload")) {
      if (checkSender(str)) {
        var proc = exec('pushGuest.bat')
        proc.stdout.on('data', function (data) {
          //console.log(data.toString());
        });
        proc.stderr.on('data', function (data) {
          console.log(data.toString());
        });
        proc.on('exit', function (code) {
          //console.log('0 if success: ' + code);
          if (code == 0) {
            rustplus.sendTeamMessage("BOT: Success")
          }
          else {
            rustplus.sendTeamMessage("BOT: Fail, check log")
          }
        });
      }
    }*/
  }
  //If paused, still process these commands
  else {
    if(str.includes(commandKey + "status")) {
      rustplus.sendTeamMessage("BOT: Bot is connected but off. To turn on use 'boton'")
    }
    else if(str.includes(commandKey + "boton")){
      if(checkSender(str)){
        paused = false
        rustplus.sendTeamMessage("BOT: Bot is on");
      }
    }
    else if (str.includes(commandKey + "raid")) {
      genericSwitch("SAMs", 1)
      genericSwitch("Turrets", 1)
      genericSwitch("Heaters", 1)
      genericSwitch("Lightss", 1)
      rustplus.sendTeamMessage("BOT: Everything is on. Godspeed.");
    }
  }
});