const electron = require('electron');
const ExcelJS = require('exceljs');
const { app, BrowserWindow, ipcMain } = electron;
const path = require("path");
const fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

async function createWindow() {

  // Create the browser window.
  win = new BrowserWindow({
    webPreferences: {
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
    }
  });

  // Load app
  win.loadFile(path.join(__dirname, "index.html"));

  // rest of code..
}

app.on("ready", createWindow);

// receiving from and sending to index.html video file path variable
ipcMain.on("toMain", (event, args) => {
    console.log(args);
    console.log(path.extname(args));
    const workbook = new ExcelJS.Workbook();
    switch (path.extname(args)) {
        case ".xlsx":
            workbook.xlsx.readFile(args).then(() => {
                // console.log(workbook);
                // console.log(workbook.worksheets[0]);
                // console.log(workbook.worksheets[0].actualColumnCount);
                // console.log(workbook.worksheets[0].getColumn('A'));
                // console.log(workbook.worksheets[0].getCell('A1'));
                console.log(workbook.worksheets[0].getColumn('C').values)
            });
            break
        case ".csv":
            workbook.csv.readFile(args).then(() => {
                console.log("Column values:");
                console.log(workbook.worksheets[0].getRow('1').values)
                console.log("Row count:");
                console.log(workbook.worksheets[0].rowCount);
                console.log("Actual Row Count (does not count empty rows):");
                console.log(workbook.worksheets[0].actualRowCount);
                console.log("actualColumnCount:");
                console.log(workbook.worksheets[0].actualColumnCount);
                
                let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

                for (column in workbook.worksheets[0].getRow('1').values) {
                    if (workbook.worksheets[0].getRow('1').values[column] == "Data Privacy") {
                        console.log("True");
                        console.log("DP Column Values:");
                        console.log(workbook.worksheets[0].getColumn(alphabet[column-1]).values);
                        
                        // iterate over all current cells in this column
                        // dobCol.eachCell(function(cell, rowNumber) {
                        //     // ...
                        // });
                        // dobCol.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
                        //     // ...
                        //   });

                        // for (data in workbook.worksheets[0].geColumn(column).values){
                        //     let DPData = ["true","false","yes","no","y","n",true,false];
                        //     var validData = false;
                        //     for (value in DPData) {
                        //         if (workbook.worksheets[0].geColumn[column].values[data] == DPData[value]) {
                        //             validData = true;
                        //         }
                        //         if (validData) {
                        //             break
                        //         } else if (value == DPData-1 && !ValidData) {
                        //             console.log("invalid data on row" + data);
                        //         }
                        //     }
                        // }        
                           
                    }
                }
            });
            break
        case ".xls":
            workbook.xls.readFile(args).then(() => {
                console.log(workbook.worksheets[0].getColumn('C').values)
            });
            break
        default:
            console.log("Not a spreadsheet maybe?")
        
        }
        
    // workbook.xlsx.readFile(args);
    // console.log(workbook.getWorksheet(1));
    // const worksheet = workbook.getWorksheet('Sheet1');
    
    // console.log(workbook.properties);
    // win.webContents.send("fromMain", data);
        
});