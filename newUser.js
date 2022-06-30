const fs = require('fs');
const listener = require("./universalListener")
const { EventEmitter } = require('events');

var myListener = new listener
const myEmitter = new EventEmitter();
var pathString = "user.json"

myListener.on("new", (notification) => {
  //Parse notification
  var body = JSON.parse(notification.data.body)
  console.log("Message received. Checking...")
  //Check if contents are valid
  if (body.playerToken != undefined && body.playerId != undefined) {
    //If so, write to file
    var objOut = {
      "userID": body.playerId,
      "userToken": body.playerToken
    }
    var stringOut = JSON.stringify(objOut)
    const jsonFD = fs.openSync("./" + pathString, 'w')
    fs.writeSync(jsonFD, stringOut, 0, 'utf8');
    fs.closeSync(jsonFD)
    console.log("Data written")
    myEmitter.emit('found')
  }
})
//Start listener
myListener.listen()
console.log("Please leave this window open and launch Rust")
console.log("Once in game, pair anything (server/switch) 'via Rust+ menu or wire tool")
//Stop listener and exit once found and written
myEmitter.on('found', () => {
  myListener.shutdown()
  console.log("DONE!")
  process.exit(0)
})