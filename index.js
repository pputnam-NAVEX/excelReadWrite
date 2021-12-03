const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const path = require("path");
// const fs = require("fs");
const validateLocationSpreadsheet = require('./validateLocationSpreadsheet');
const getWorkbook = require('./validateFile/validateFile')
const reviewLocations = require('./validateLocations/reviewLocationsObj.js')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

async function createWindow() {

  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 1000,
    webPreferences: {
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
      devTools: true,
    }
  });

  // Load app
  win.loadFile(path.join(__dirname, "index.html"));

  // rest of code..
}

app.on("ready", createWindow);

// receiving from and sending to index.html video file path variable
ipcMain.on("toMain", (event, args) => {
    // for (key in args) {
    //     console.log(`${key}: ${args[key]}`);
    // }
    if (path.extname(args.path) == ".csv") {
        const results = new Promise((resolve, reject) => {
            resolve(reviewLocations.reviewLocationSpreadsheet(args));
        });
        results.then((results) => {
            // console.log("results = " + results);
            win.webContents.send("fromMain", results)
        });
    } else {
        let results = ["Please utilize a .csv formatted spreadsheet only"]
        win.webContents.send("fromMain", results);
    }


    // validateLocationSpreadsheet.dataPrivacyColumn(args, win);
    // getWorkbook.getWorkbook(args);
});