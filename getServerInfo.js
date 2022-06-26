//Runs fcm-listen as child process, caputres user info, saves as user.JSON for use in bot
const { exec, spawn } = require('child_process');
const fs = require('fs');
const { exit } = require('process');

//change to server.json or whatever
var pathString = "user.json"

//Create child process with nerffed callback function for less clutter in output
const child = exec("setup_listen.bat", [], (err, stdout, stderr) => {
  if (err) {
    //console.error(err);
    return;
  }
  //console.log(stdout);
});
//Display child PID
console.log("Regiser process created and running with PID " + child.pid)

//Report fcm-listen process exit code
child.on('exit', function (code, signal) {
  console.log('child process exited with ' + `code ${code} and signal ${signal}`);
});

//Monitor fcm-listen process for console.log events to scrape user data, exit once found
child.stdout.on('data', (data) => {
  //Checks for { to make sure it isn;t one of the "Listening for fcm..." messages fcm-listen prints at the start
  if (data.includes("{")) {
    //MAKE ALL CHANGES INSIDE HERE------------------------------------------------------------------------------------------------------------
    console.log("Data found, extracting...")
    
    //Data here
    console.log(data)
    //Get your data form the message here
    
    //Format the data in an object for output
    var objOut = {
      "userID": idString,
      "userToken": tokenString
    }

    //Make string from object
    var stringOut = JSON.stringify(objOut)
    //Open JOSN
    const jsonFD = fs.openSync("./" + pathString, 'w')
    
    //Write string to JSON. Writes from start and OVERWRITES so alter if you want to modify
    //If the structure is already there, you can alter and use method in appendJSON in bot maybe
    fs.writeSync(jsonFD, stringOut, 0, 'utf8');
    fs.closeSync(jsonFD)
    
    //Inform user and close
    console.log("Data written, exiting...")
    process.exit(0)
  }
});

//Error printing for debugging
child.stderr.on('data', (data) => {
  //console.error(`child stderr:\n${data}`);
});

//Kill children on exit
process.on('exit', function () {
  console.log("Killing child process at PID " + child.pid)
  child.kill();
  console.log("DONE!")
});