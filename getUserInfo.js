//Runs fcm-listen as child process, caputres user info, saves as user.JSON for use in bot
const { exec, spawn } = require('child_process');
const fs = require('fs');
const { exit } = require('process');

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
  if (data.includes("{")) {
    console.log("Data found, extracting...")
    
    //Pull values from notification data string
    var idObj = data.match(/playerId: '[0-9]*'/g)
    var tokenObj = data.match(/playerToken: '.[0-9]*'/g)

    //Get rid of everything that isnt the number or "-" in the case of token
    var idString = JSON.stringify(idObj).replace(/[^0-9]/g, '')
    var tokenString = JSON.stringify(tokenObj).replace(/[^0-9|^-]/g, '')
    
    //If one of the targets is not found, exit and we will wait for another one
    //**** NEEDS TESTING
    if (idString == "" || tokenString == "") {
      return
    }
    
    //Format for output
    var objOut = {
      "userID": idString,
      "userToken": tokenString
    }
    var stringOut = JSON.stringify(objOut)
    //Check contents
    console.log(typeof stringOut + "STRING: " + stringOut)
    
    //Open JOSN
    const jsonFD = fs.openSync("./" + pathString, 'w')
    
    //Write object to JSON as string
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