//Topia Small = 0.0.0.0:28076 = hostname
//Scan for messages command: npx @liamcottle/rustplus.js fcm-listen

//MAIN SWITCHES
//BEDROOMS starting with Ryan/Twix and going clockwise
//r/t: 9331004 -> (sam, no turret) -> 9332360 -> 9321241 -> 9334053 -> 9325142
//BEDROOM FLOOR OUTER RING
//r/t: (Lights) 10723613 -> (Heaters) 76576392 -> (Turrets) 20002729

//GATE SWITCHES
//Keos L: Turret 11311303 R: Sam 26618389, Nothing 26618579
//1 L: Turret 17411035 R: Turret 12496557, Middle: Heaters and lights for gate 1 ***
//2 L: Turret 11274989 R: SAM 11276478, Nothing 26646402
//3 L: Turret 17404490 R: Nothing 20239610
//4 L: Turret 11328218 R: SAM 26675114, Nothing 26675021
//5 L: Turret 13006497 R: Nothing 11545782

console.log("Starting");
const RustPlus = require('@liamcottle/rustplus.js');
var rustplus = new RustPlus('208.52.152.118', '28145', '76561198050799967', '-841804922');
const samSwitches = ['26618389', '11276478', '26675114', '9229886', '26034625']
const turretSwitches = ['9331004','9332360', '9321241', '9334053', '9325142', 
                        '20002729',
                        '11311303', '17411035', '12496557', '11274989', '17404490', '11328218', '13006497']
const lightSwitches = ['10723613']
const heatSwitches = ['76576392']

// connect to rust server
rustplus.connect();

// wait until connected before sending commands
rustplus.on('connected', () => {
  console.log("Connected");
  rustplus.sendTeamMessage("BOT: Bot connected");  
  // ready to send requests
});

//Bot Commands
rustplus.on('message', (message) => {
  //Unused 
  var hitCheck = false
  var stateCounter = 0
  //Message event JSON from broadcast, as string
  var str = JSON.stringify(message);
  //SAM------------------------------------
  if(str.includes('!samon')){
    //hitCheck = true
    for(var i = 0; i < samSwitches.length; i++){
      rustplus.turnSmartSwitchOn(samSwitches[i], (message) => {
        //console.log("turnSmartSwitchOn response message: " + JSON.stringify(message));
        return true;
      });
    }
    rustplus.sendTeamMessage("BOT: SAM switches on");
  }
  else if(str.includes('!samoff')){
    //hitCheck = true
    for(var i = 0; i < samSwitches.length; i++){
      rustplus.turnSmartSwitchOff(samSwitches[i], (message) => {
        //console.log("turnSmartSwitchOn response message: " + JSON.stringify(message));
        return true;
      });
    }
    rustplus.sendTeamMessage("BOT: SAM switches off");
  }
  //TURRETS----------------------------------
  else if(str.includes('!tton')){
    //hitCheck = true
    for(var i = 0; i < turretSwitches.length; i++){
      rustplus.turnSmartSwitchOn(turretSwitches[i], (message) => {
        //console.log("turnSmartSwitchOn response message: " + JSON.stringify(message));
        return true;
      });
    }
    rustplus.sendTeamMessage("BOT: Turret switches on");
  }
  else if(str.includes('!ttoff')){
    //hitCheck = true
    for(var i = 0; i < turretSwitches.length; i++){
      rustplus.turnSmartSwitchOff(turretSwitches[i], (message) => {
        //console.log("turnSmartSwitchOn response message: " + JSON.stringify(message));
        return true;
      });
    }
    rustplus.sendTeamMessage("BOT: Turret switches off");
  }
  //LIGHTS----------------------------------
  else if(str.includes('!lightson')){
    //hitCheck = true
    for(var i = 0; i < lightSwitches.length; i++){
      rustplus.turnSmartSwitchOn(lightSwitches[i], (message) => {
        //console.log("turnSmartSwitchOn response message: " + JSON.stringify(message));
        return true;
      });
    }
    rustplus.sendTeamMessage("BOT: Light switches on");
  }
  else if(str.includes('!lightsoff')){
    //hitCheck = true
    for(var i = 0; i < lightSwitches.length; i++){
      rustplus.turnSmartSwitchOff(lightSwitches[i], (message) => {
        //console.log("turnSmartSwitchOn response message: " + JSON.stringify(message));
        return true;
      });
    }
    rustplus.sendTeamMessage("BOT: Light switches off");
  }
  //HEATERS--------------------------------------
  else if(str.includes('!heaterson')){
    //hitCheck = true
    for(var i = 0; i < heatSwitches.length; i++){
      rustplus.turnSmartSwitchOn(heatSwitches[i], (message) => {
        //console.log("turnSmartSwitchOn response message: " + JSON.stringify(message));
        return true;
      });
    }
    rustplus.sendTeamMessage("BOT: Heater switches on");
  }
  else if(str.includes('!heatersoff')){
    //hitCheck = true
    for(var i = 0; i < heatSwitches.length; i++){
      rustplus.turnSmartSwitchOff(heatSwitches[i], (message) => {
        //console.log("turnSmartSwitchOn response message: " + JSON.stringify(message));
        return true;
      });
    }
    rustplus.sendTeamMessage("BOT: Heater switches off");
  }
  else if(str.includes('!rockets')){
    rustplus.sendTeamMessage("BOT: The rockets exist");
  }
  else if(str.includes('!bot')){
    rustplus.sendTeamMessage("BOT: Bot is connected");
  }
  else if(str.includes('!help')){
    rustplus.sendTeamMessage("BOT: Commands: TODO");
  }
  //DISABLED: If a command was given, confirm switch states and send message with results
  /*if(hitCheck){
    for(var i = 0; i < samSwitches.length; i++){
      rustplus.getEntityInfo(samSwitches[i], (message) => {
        //TODO fix this parse with path JSON.response.entityinfo.payload.value (maybe)
        if(JSON.parse(message).response.entityinfo.payload.value){
          stateCounter += 1
        }
        return true;
      });
    }
    rustplus.sendTeamMessage("BOT: " + stateCounter + " SAMs are turned on");
  }*/
  
});
//Storage Monitor changes
/*rustplus.on('message', (message) => {
  if(message.broadcast && message.broadcast.entityChanged){

      var entityChanged = message.broadcast.entityChanged;
  
      var entityId = entityChanged.entityId;
      var value = entityChanged.payload.value;
      var capacity = entityChanged.payload.capacity;
      var items = entityChanged.payload.items;
      
      // only print info when second broadcast is received
      if(!value){

          console.log(`entity ${entityId} has a capacity of ${capacity}`);
          console.log(`entity ${entityId} contains ${items.length} item(s)`);
          
          // print out the items in this storage entity
          items.forEach((item) => {
              console.log(item);
          });
      }
  }
});*/
//Log all messages
//rustplus.on('message', (message) => {
  //console.log("message received: " + JSON.stringify(message));
//});

//rustplus.getEntityInfo('11274989', (message) => {
  //console.log("Switch")
  //console.log("getEntityInfo response message: " + JSON.stringify(message));
  //return true;
//});

