const { Debugger } = require('electron');
const ExcelJS = require('exceljs');
const path = require("path");

const dataPrivacyColumn = function(args, win) {
    const workbook = new ExcelJS.Workbook();
    var results = "";
    switch (path.extname(args)) {
        case ".csv":
            workbook.csv.readFile(args).then(() => {
                let DPData = ["true","false","yes","no","y","n",true,false];
                let rowOne = workbook.worksheets[0].getRow('1');

                // better way to iterate through row/columns
                rowOne.eachCell(function(cell, colNumber) {
                    if (cell.value == "Data Privacy") {
                        results += "Data Privacy Column Exists"
                        // regex searches for the column letter(s) in the cell address
                        console.log(cell.address.match(/^[A-Z]*[^0-9]/g))
                        let cellColumn = cell.address.match(/^[A-Z]*[^0-9]/g)[0];
                        let theColumn = workbook.worksheets[0].getColumn(cellColumn);

                        // check if column has data in it at all
                        let isColumnEmpty = true;
                        for (row = 2; row <= workbook.worksheets[0].rowCount; row++) {
                            if (workbook.worksheets[0].getCell(cellColumn + row).value != null) {
                                isColumnEmpty = false;
                                row = workbook.worksheets[0].rowCount + 1;
                            };
                        }

                        // if column isn't empty perform data validation
                        if (!isColumnEmpty) {
                            theColumn.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
                                // skip column header data, e.g. "Data Privacy" or "Tier Name"
                                if (rowNumber > 1) {
                                    let validData = false;
                                    if (cell.value == null || cell.value == undefined || cell.value == '') {
                                        results += "<br/>empty cell in Data Privacy column " + cell.address;
                                        console.log("empty cell in Data Privacy column " + cell.address);
                                    } else {
                                        for (value in DPData) {
                                            if (cell.value.toLowerCase() == DPData[value]) {
                                                validData = true;
                                                break
                                            }

                                            if (value == DPData.length-1 && !validData) {
                                                results += "<br/>invalid data in cell " + cell.address;
                                                console.log("invalid data in cell " + cell.address);
                                            }
                                        }
                                    }

                                }
                            });
                        } else {
                            results += '<br/>Column is Empty';
                            console.log('results = ' + results)
                        }
                        win.webContents.send("fromMain", results);
                    }
                });
            })
            break
        default:
            console.log("Not a spreadsheet maybe?")
    }  // end switch statement
} // end dataPrivacyColumn()


exports.dataPrivacyColumn = dataPrivacyColumn;

// console.log(args);
//     console.log(path.extname(args));
//     const workbook = new ExcelJS.Workbook();
//     let response = 'empty';
//     switch (path.extname(args)) {
//         case ".xlsx":
//             workbook.xlsx.readFile(args).then(() => {
//                 console.log(workbook);
//                 console.log(workbook.worksheets[0]);
//                 console.log(workbook.worksheets[0].actualColumnCount);
//                 console.log(workbook.worksheets[0].getColumn('A'));
//                 console.log(workbook.worksheets[0].getCell('A1'));
//                 console.log(workbook.worksheets[0].getColumn('C').values)
//             });
//             break
//         case ".csv":
//             workbook.csv.readFile(args).then(() => {
//                 console.log("Column (row 1) values:");
//                 console.log(workbook.worksheets[0].getRow('1').values)
//                 console.log("Row 1 in totality")
//                 console.log(workbook.worksheets[0].getRow('1'))
//                 console.log("Row count:");
//                 console.log(workbook.worksheets[0].rowCount);
//                 console.log("Actual Row Count (does not count empty rows):");
//                 console.log(workbook.worksheets[0].actualRowCount);
//                 console.log("actualColumnCount:");
//                 console.log(workbook.worksheets[0].actualColumnCount);
                
//                 // let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//                 let DPData = ["true","false","yes","no","y","n",true,false];
//                 let rowOne = workbook.worksheets[0].getRow('1');
              
//                 // better way to iterate through row/columns
//                 rowOne.eachCell(function(cell, colNumber) { 
                    
//                     if (cell.value == "Data Privacy") {
                        
//                         // regex searches for the column letter(s) in the cell address
//                         console.log(cell.address.match(/^[A-Z]*[^0-9]/g))
//                         let cellColumn = cell.address.match(/^[A-Z]*[^0-9]/g)[0];
//                         let theColumn = workbook.worksheets[0].getColumn(cellColumn);
                        
//                         // check if column has data in it at all
//                         let isColumnEmpty = true;
//                         for (row = 2; row <= workbook.worksheets[0].rowCount; row++) {
//                             if (workbook.worksheets[0].getCell(cellColumn + row).value != null) {
//                                 isColumnEmpty = false;
//                                 row = workbook.worksheets[0].rowCount + 1;
//                             };
//                         }

//                         // if column isn't empty perform data validation
//                         if (!isColumnEmpty) {
//                             theColumn.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
//                                 // skip column header data, e.g. "Data Privacy" or "Tier Name"
//                                 if (rowNumber > 1) {
//                                     let validData = false;
//                                     if (cell.value == null || cell.value == undefined || cell.value == '') {
//                                         console.log("empty cell in Data Privacy column " + cell.address);
//                                     } else {
//                                         for (value in DPData) {
//                                             if (cell.value.toLowerCase() == DPData[value]) {
//                                                 validData = true;
//                                                 break
//                                             }
                    
//                                             if (value == DPData.length-1 && !validData) {
//                                                 console.log("invalid data in cell " + cell.address);
//                                             }
//                                         }
//                                     }
    
//                                 }
//                             });
//                         } else {
//                             response = 'Column is Empty';
//                             console.log('Column is empty')
//                             win.webContents.send("fromMain", response);
//                         }

//                     }

//                 });

//                 for (column in workbook.worksheets[0].getRow('1').values) {
//                     if (workbook.worksheets[0].getRow('1').values[column] == "Data Privacy") {
//                         console.log("True");
//                         console.log("DP Column Values:");
//                         // console.log(workbook.worksheets[0].getColumn(alphabet[column-1]).values);
                        
//                         // iterate over all current cells in this column
//                         // dobCol.eachCell(function(cell, rowNumber) {
//                         //     // ...
//                         // });
//                         // dobCol.eachCell({ includeEmpty: true }, function(cell, rowNumber) {
//                         //     // ...
//                         //   });

//                         for (data in workbook.worksheets[0].getColumn(alphabet[column-1]).values){
//                             let DPData = ["true","false","yes","no","y","n",true,false];
//                             var validData = false;
//                             for (value in DPData) {
//                                 if (workbook.worksheets[0].geColumn[column].values[data] == DPData[value]) {
//                                     validData = true;
//                                 }
//                                 if (validData) {
//                                     break
//                                 } else if (value == DPData-1 && !ValidData) {
//                                     console.log("invalid data on row" + data);
//                                 }
//                             }
//                         }        
                           
//                     }
//                 }
//             });
//             break
//         case ".xls":
//             workbook.xls.readFile(args).then(() => {
//                 console.log(workbook.worksheets[0].getColumn('C').values)
//             });
//             break
//         default:
//             console.log("Not a spreadsheet maybe?")
        
//     }
        
//     workbook.xlsx.readFile(args);
//     console.log(workbook.getWorksheet(1));
//     const worksheet = workbook.getWorksheet('Sheet1');
    
//     console.log(workbook.properties);
//     win.webContents.send("fromMain", response);