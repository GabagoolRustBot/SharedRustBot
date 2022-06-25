//Scan for messages command: npx @liamcottle/rustplus.js fcm-listen

const process = require('process');
const RustPlus = require("@liamcottle/rustplus.js");
const userData = require("./user.json")
const assets = require("./assets.json")
//const { register, listen } = require('push-receiver');     //For listener if added back
const fs = require('fs');

//String for name of JSON file being read (as opposed to hardcoding), can be changed via arguments later
var pathString = "server.json"//Using hardcoding for testing
//var pathString = process.argv[2]//First arg in command line call = path to json, or just filename if in root
var jData = require("./" + pathString)
//Config JSON if needed later
var configJSON = require("./rustplus.config.json")

//Outer scope declaration of ID arrays
var turretSwitches
var samSwitches
var lightSwitches
var heatSwitches
var StorageMonitors

//Command key for servers where ! is being used, define in each server JSON and assign here isntead
var commandKey = jData.serverCommandKey

//Fucntion for pulling info from JSON, ran before any switch array calls for most recent data
function readData(){
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
function genericSwitch(switchType, switchPosition){
  var targetArr = []
  switch(switchType){
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
  switch(switchPosition){
    case 0:
      for(var i = 0; i < targetArr.length; i++){
        rustplus.turnSmartSwitchOff(targetArr[i], (message) => {
          //TODO add error catch from message
          return true;
        });
      }
      rustplus.sendTeamMessage("BOT: " + switchType + " off");
      break
    case 1: 
      for(var i = 0; i < targetArr.length; i++){
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
function appendJSON (newData, key){
  fs.readFile("./" + pathString, 'utf8', function readFileCallback(err, data){
    if (err){
      console.log(err);
    }
    else{
    obj = JSON.parse(data); 
    //Switch keys in JSON for match
    switch(key){
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
    fs.writeFile("./" + pathString, json, 'utf8', function(){x => True}); // write it back 
  }});
  console.log("Wrote "+newData+" to "+key)
}

//BOT START----------------------------------
//Banner
assets.banner.forEach(x => {console.log(x)})

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
  readData()
});

//Bot Commands
rustplus.on("message", (message) => {
  //Refresh data, "brute force" placement here, refreshing after every message, 
  //can be placed inside command calls to lighten loads if need be
  readData()
  //Message event JSON from broadcast, as string
  var str = JSON.stringify(message);
  //SAM
  if(str.includes(commandKey + "samon")){
    genericSwitch("SAMs", 1)
  }
  else if(str.includes(commandKey + "samoff")){
    genericSwitch("SAMs", 0)
  }
  //TURRETS
  else if(str.includes(commandKey + "tton")){
    genericSwitch("Turrets", 1)
  }
  else if(str.includes(commandKey + "ttoff")){
    genericSwitch("Turrets", 0)
  }
  //LIGHTS
  else if(str.includes(commandKey + "lightson")){
    genericSwitch("Lights", 1)
  }
  else if(str.includes(commandKey + "lightsoff")){
    genericSwitch("Lights", 0)
  }
  //HEATERS
  else if(str.includes(commandKey + "heaterson")){
    genericSwitch("Heaters", 1)
  }
  else if(str.includes(commandKey + "heatersoff")){
    genericSwitch("Heaters", 0)
  }
  else if(str.includes(commandKey + "upkeep")){
    for(let i = 0; i < StorageMonitors.length; ++i){
      rustplus.getEntityInfo(StorageMonitors[i], (mess) =>{
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

        let decayTime = Math.floor((rawTime*1000 - Date.now()) / 1000);
        let days = Math.floor(decayTime / day);
        let hours = Math.floor((decayTime - days * day) / hour);
        let minutes = Math.floor((decayTime - days * day - hours * hour) / minute);
        let seconds = decayTime - days * day - hours * hour - minutes * minute;
        //I want to put everything above this into a helper function but I"m not sure how to do that in NodeJS yet. 
        if(i == 0){
          rustplus.sendTeamMessage("MAIN TC:    " + days + "D " + hours + "H " + minutes + "M " + seconds + "S");
        } else{
          rustplus.sendTeamMessage("GATE " + (i) + ":      " + days + "D " + hours + "H " + minutes + "M " + seconds + "S");
        }
        
      });
          
    }
    
  }
  else if(str.includes(commandKey + "rockets")){
    rustplus.sendTeamMessage("BOT: The rockets exist");
  }
  else if(str.includes(commandKey + "bot")){
    rustplus.sendTeamMessage("BOT: Bot is connected");
  }
  else if(str.includes(commandKey + "help")){
    rustplus.sendTeamMessage("BOT: Commands: TODO");
  }
});