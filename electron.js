var tempsAffichageSplash = 4000;
var debugVars = {
    debugging: false, // Debugging is the Electron app
    testing: false, // Testing is testing snippets like Google Sheets
    openWindow: false,
    firstWindow: "pages/dashboard.html",
    args: {}
}

/** Début du programme **/

const electron = require('electron');
const {ipcMain, app, nativeImage, Menu} = electron;
const ansi = require("ansi-colors");
const childProcess = require("child_process");

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let splashWindow = null; // Variable globale

const logPath = path.resolve(app.getPath("temp") + "/appLog.txt");
console.log(ansi.gray(`Fichier de debogage : ${logPath} \n`));

/*******************************/
/*           DEBUG             */
/*           BEGIN             */
/*******************************/
if(process.argv.length>2) debugVars.debugging = true; // If there are arguments specified 

if(debugVars.debugging){
    tempsAffichageSplash = 1;
    
    var lastArg = null;
    process.argv.forEach(function(val, ix){
        if(ix<2) return false; // return false; <==> continue;
        
        var letterArgsPattern = /^-(?!-)(.+)$/;
        var anyArgPattern = /^--.*/;
        
        if(val.match(letterArgsPattern)){ // If argument starts with ONLY ONE `-``
        var letterArgsReg = (letterArgsPattern).exec(val); // ==> ["-abc", "abc", index: 0, input: '-abc', ...]
        
        debugVars.args.letterArgs = letterArgsReg[1]; // Returns "abc" for "-abc"
    }
    if(val.match(anyArgPattern)){ // If argument starts with `--`
    var argValue = process.argv[ix+1];
    debugVars.args[val] = argValue;    
}
});

console.log("\n");
console.log(debugVars.args);
console.log("\n");
}

// Interpret process args
if(debugVars.args.hasOwnProperty("--firstWindow")) debugVars.firstWindow = debugVars.args["--firstWindow"];

if(debugVars.args.hasOwnProperty("--test")){
    debugVars.testing = true;

    var processArgs = debugVars.args.hasOwnProperty("--testArgs") ? debugVars.args["--testArgs"] : "";

    var testProcess = childProcess.fork(`${app.getAppPath()}/tests/${debugVars.args["--test"]}`, {execArgv: processArgs});
    testProcess.on("exit", function(code){
        var text = "";
        if(code==0){
            text = ansi.greenBright("The test has passed with no errors. Code : 0")
        }else{
            text = ansi.redBright("Test failed with code "+code)
        }
        console.log(`\n      ${text} \n`);
        process.exit(0);
    })
}

/*******************************/
/*           DEBUG             */
/*            END              */
/*******************************/

const frame_settings = {
    "dashboard.html": false,
    "editeur.html": true
}

function createWindow (urlToOpen) {
    // Create the browser window.
    var showFrame = false;
    for(let key in frame_settings){
        if(urlToOpen.match(key) !== null){
            showFrame = frame_settings[key];
        }
    }

    var newWindow = new BrowserWindow({
        transparent: !showFrame,
        width: 900,
        height: 600,
        show: false,
        frame: showFrame,
        resizable: false,
        maximizable: false,
        hasShadow: true,
        webPreferences:{
            nodeIntegration: true
        }
    })
    
    logDebug(ansi.gray(`Creation de ${urlToOpen}`));
    
    // and load the index.html of the app.
    newWindow.loadURL(url.format({
        pathname: path.join(__dirname, urlToOpen),
        protocol: 'file:',
        slashes: true
    }))
    newWindow.setTouchBar(touchBar)
    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
    
    // Emitted when the window is closed.
    newWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    
    newWindow.once("ready-to-show", function(){
        newWindow.show();
        if(typeof mainWindow != "undefined" && mainWindow != null) mainWindow.destroy();
        mainWindow = newWindow;
        logDebug(ansi.green(`Affichage de ${ansi.bold(mainWindow.webContents.getURL())}`));
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
if(debugVars.testing === false){
    app.on('ready', function(){
        createWindow(debugVars.firstWindow);
    }) //Démarre l'appli
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        logDebug(ansi.yellow("Fin de l'execution"))
        app.quit();
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null && debugVars.testing ===
         false) {
        createWindow(debugVars.firstWindow);
    }
})

app.on('quit', function(){
    logStream.end(new Date() + " : Fin du processus")
})

// Fonction pour afficher le splash
function splash(){
    logDebug(ansi.yellow("Ouverture du splash"));
    
    mainWindow = splashWindow = new BrowserWindow({
        width: 600,
        height: 280,
        movable: false,
        frame: false,
        resizable: false,
        hasShadow: false,
        titleBarStyle: "none",
        show: false,
        transparent: true,
        icon: path.join(__dirname, 'assets/icons/png/64x64.png')
    });
    splashWindow.on("ready-to-show", function () {
        splashWindow.show();
    });
    
    splashWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/splash.html'),
        protocol: 'file:',
        slashes: true
    }));
    
    setTimeout(function () {
        // TO SHOW
        createWindow(debugVars.firstWindow);
    }, tempsAffichageSplash);
}

ipcMain.on("newWindowRequest", function (event, urlToOpen) {
    logDebug(ansi.gray(`Request to open ${urlToOpen}`));
    createWindow(urlToOpen)
});


var logStream = fs.createWriteStream(logPath, {
    flags: "w"
})
logDebug(new Date()+ " : Debut de l'execution")


function logDebug(text, level){
    if(level==undefined) level = 5;
    
    console.log(text);
    
    var date = new Date();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var secs = date.getSeconds();
    var msec = date.getMilliseconds();
    var formattedDate = `[${hour}:${mins}:${secs}.${msec}] `;
    logStream.write(ansi.unstyle(formattedDate+text+"\n"));
}


/// TESTING PRE-REQUISITES
const cosmixFolder = app.getPath("userData"); // Mac OS ==> /Users/[Username]/Library/Application Support/Cosmix Desktop 

const folders = ["conf", "data"]; // Default folders which should be in the userData folder
for (const i in folders) {
    let folder = path.join(cosmixFolder, folders[i]);
    if(!fs.existsSync(folder)){
        fs.mkdirSync(folder);
        logDebug("Default folder made at "+folder);
    }
}

const { TouchBar } = require('electron')

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar

let spinning = false

// Reel labels
const reel1 = new TouchBarLabel()
const reel2 = new TouchBarLabel()
const reel3 = new TouchBarLabel()

// Spin result label
const result = new TouchBarLabel()

// Spin button
const spin = new TouchBarButton({
  label: '🎰 Spin',
  backgroundColor: '#7851A9',
  click: () => {
    // Ignore clicks if already spinning
    if (spinning) {
      return
    }

    spinning = true
    result.label = ''

    let timeout = 10
    const spinLength = 4 * 1000 // 4 seconds
    const startTime = Date.now()

    const spinReels = () => {
      updateReels()

      if ((Date.now() - startTime) >= spinLength) {
        finishSpin()
      } else {
        // Slow down a bit on each spin
        timeout *= 1.1
        setTimeout(spinReels, timeout)
      }
    }

    spinReels()
  }
})

const getRandomValue = () => {
  const values = ['🍒', '💎', '7️⃣', '🍊', '🔔', '⭐', '🍇', '🍀']
  return values[Math.floor(Math.random() * values.length)]
}

const updateReels = () => {
  reel1.label = getRandomValue()
  reel2.label = getRandomValue()
  reel3.label = getRandomValue()
}

const finishSpin = () => {
  const uniqueValues = new Set([reel1.label, reel2.label, reel3.label]).size
  if (uniqueValues === 1) {
    // All 3 values are the same
    result.label = '💰 Jackpot!'
    result.textColor = '#FDFF00'
  } else if (uniqueValues === 2) {
    // 2 values are the same
    result.label = '😍 Winner!'
    result.textColor = '#FDFF00'
  } else {
    // No values are the same
    result.label = '🙁 Spin Again'
    result.textColor = null
  }
  spinning = false
}

const touchBar = new TouchBar({
  items: [
    spin,
    new TouchBarSpacer({ size: 'large' }),
    reel1,
    new TouchBarSpacer({ size: 'small' }),
    reel2,
    new TouchBarSpacer({ size: 'small' }),
    reel3,
    new TouchBarSpacer({ size: 'large' }),
    result
  ]
})
