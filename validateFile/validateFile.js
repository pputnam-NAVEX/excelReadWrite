const ExcelJS = require('exceljs');
const path = require("path");

// note add in more frequently used alternatives
// add in a data-type validation (e.g. text, number, etc.)
// add in field size validation (e.g. 200 characters, 100 characters, etc.)
// add in to string and to lowercase for easier data manipulation and comparison
// add check for duplicate or ambiguous headers (e.g. "region" AND "region code" exist, or "Address" could be address1 or address2)
const acceptableLDBFieldNames = ['Add/Edit/Delete', 'Name', 'Branch', 'Address 1', 'Address 2', 'City', "State", "Zip", "Country", "Tier Name", "Data Privacy", "Custom Field 1", "Custom Field 2", "Custom Field 3", "Custom Field 4"];

// need to re-think how to delete and keep track of duplicates as when a row is removed then row id numbers shift and change
// might consider emptying out the data and doing a final loop to remove empty rows before evaluating?
var duplicates = [];

const checkIfRowIsDuplicate = function(rowNumber) {
    let isADuplicate = false;
    for (row in duplicates) {
        console.log("This is where this number is coming from " + duplicates[row])
        if (rowNumber == duplicates[row]) {
            isADuplicate = true;
        }
    }
    return isADuplicate;
}

const validateLDBFields = function(fieldName) {
    let isFieldValue = false;
    for (field in acceptableLDBFieldNames) {
        if (fieldName == acceptableLDBFieldNames[field]) {
            isFieldValue = true;
            break
        }
    }
    return isFieldValue;
}

// need to be careful of when something is being deleted as this re-orders rows
// eg if you delete row 13, row 14 becomes row 13 and all other rows are shifted "down" in id#
// therefore if you are keeping track of rows to delete, the array of id# may be inaccurate after one delete!!
const deleteLocations = function(worksheet) {
    worksheet.getColumn("Add/Edit/Delete").eachCell(function(cell, rowNumber) {
        if (cell.value == "delete") {
            console.log("Removing row " + rowNumber);
            worksheet.spliceRows(rowNumber, 1);
        }
    });
}

// should likely not use NPM package eachCell as we want to break the loop immediately if a cell doesn't match exactly for efficiency, maybe a WHILE LOOP?
const compareRows = function(row1, row2) {
    let exactDuplicate = true;
    row1.eachCell(function(cell, colNumber) {
        if (cell.value != row2.getCell(colNumber).value) {
            exactDuplicate = false;
        }
    })
    if (exactDuplicate) { 
        console.log(row2.values);
        row2.values = ''; // this effectively removes data from the entire row! Could loop through later and remove empty rows!
        // need to test this in a fileWrite ^
        console.log(row2.values);
    };
    return exactDuplicate;
}

const getWorkbook = async function(args) {
    duplicates = []; // reset this if a spreadsheet has already been run;
    const workbook2 = new ExcelJS.Workbook();
    const options = { encoding: 'UTF-8' };
    const worksheet = await workbook2.csv.readFile(args, options);
    let columnsUnreal = worksheet.columnCount;

    // console.log("Outcome of compareRows 83 & 84 = " + compareRows(worksheet.getRow(83), worksheet.getRow(84)));
    // console.log("Outcome of compareRows 75 & 76 = " + compareRows(worksheet.getRow(75), worksheet.getRow(76)));

    worksheet.eachRow({ includeEmpty: true } ,function(row, rowNumber) {
        // add check if "Add/Edit/Delete" column is empty, prompt if this is an initial LDB upload or an edit, request or mention to case owner that it appears nothing is changing if it is an edit.
        if (rowNumber == 1) {
            row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                // if colNumber.header == FIELD
                if (cell.value == undefined || cell.value == '' || cell.value == null) {
                    console.log("Column " + worksheet.getColumn(colNumber).letter + " doesn't have a field name (" + cell.address + "). Please add a valid field name or delete this column if it is unnecessary.")
                }
                else {
                    let isFieldValueValid = validateLDBFields(cell.value);
                    if (isFieldValueValid) {
                        worksheet.getColumn(colNumber).key = cell.value;
                        // console.log(worksheet.getColumn(colNumber).key)
                    } else {
                        console.log('Field Value "' + cell.value + '" (' + cell.address + ') is invalid, please update.')
                    }
                }

                if (worksheet.getColumn(colNumber).key == "Add/Edit/Delete") {deleteLocations(worksheet)};
            });
        }
        
        if (rowNumber > 1) {
            // if rows are empty, this may also delete ghost rows at the end of data/spreadsheet
            // CHECK IF THIS EFFECTS SOMETHING WITHIN eachRow function as we're deleting an entire row!
            // eg if we're keeping track of duplicates to delete later... the row numbers change on delete
            // SHOULD REMOVE EMPTY ROWS AFTER or BEFORE REMOVING DUPLICATES OR POSSIBLY KEEP TRACK IN AN ARRAY
            // Could DELETE DATA WITHIN A DUPLICATE ROW THEN DELETE ALL EMPTY ROWS?
            if (row.values == '' ) {
                console.log("Row " + rowNumber + " is empty. Deleting row");
                worksheet.spliceRows(rowNumber, 1);
            }
            // if rows are duplicates
            let isADuplicateRow = checkIfRowIsDuplicate(rowNumber);
            if (isADuplicateRow == false) {
                worksheet.eachRow(function(rowCompare, rowNumberCompare) { // only checks non-empty rows
                    // Since we're starting with row #2, the first skips previous rows up to the next row
                    // IF we're not comparing the row against itself, just in case
                    // AND if the row we're comparing against hasn't already been found to be a duplicate
                    if (rowNumber < rowNumberCompare && rowNumber != rowNumberCompare && checkIfRowIsDuplicate(rowNumberCompare) == false) {
                        console.log("rowNumber = " + rowNumber);
                        console.log("rowNumberCompare = " + rowNumberCompare);
                        console.log("check if dupe func result = " + checkIfRowIsDuplicate(rowNumberCompare));
                        if (compareRows(row, rowCompare)) {
                            duplicates.push(rowNumberCompare);
                            console.log("Row " + rowNumberCompare + " is a duplicate of rowNumber " + rowNumber);
                            isADuplicateRow = true;
                        }
                    }
                });
            } else {
                console.log("Row " + rowNumber + " already deemed a duplicate, skipping.")
            }
        }
    });
    // some encoding issues when spitting out or writing data, long hyphens are an example
    // only on the write though, they console.log fine....(from what I've tested)
    // console.log(worksheet.getColumn("Add/Edit/Delete").values);
    // ENCODE errors only seem to happen opening with Excel?!?! Notepad++ does just fine UTF-8!
    // When looking at Notepad++, difference seems to be UTF-8-BOM (Byte order mark) vs UTF-8 and perhaps Windows (CR LF) vs Unix LF. Using Notepad++ to change encoding to UTF-8-BOM makes the spreadsheet encode correctly.
    // worksheet.getCell('A1').value = "\ufeff" + worksheet.getCell('A1').value; // !!! THIS IS FOR UTF-8-BOM!!!
    // workbook2.csv.writeFile("newLDBspreadsheet.csv", options);

    // if (row.getCell(1) == 'delete') {
    //     console.log(row.getCell(1).address);
    // }

    // for (x = 1; x < columnsUnreal; x++) {
    //     worksheet.getColumn(x).eachCell(function(cell, rowNumber) {
    //         if (cell.value = "Add/Edit/Delete") {

    //         }
    //     })
    // }


    // let rowCount = worksheet.rowCount;
    // console.log('Row count including empty = ' + rowCount);

    // let startingPoint = '';
    // let addEditDeleteLetter = '';

    // for (x = 1; x < rowCount; x++) {
    //     let row = worksheet.getRow(x);
    //     console.log(row.values);

    //     if (row.getCell(1).value = "Add/Edit/Delete") {
    //         startingPoint = row.getCell(1).address;
    //         addEditDeleteLetter = row.getCell(1).address.match(/^[A-Z]*[^0-9]/g)[0];
    //         x = rowCount;
    //     }
    // }

    // let addEditDeleteColumn = worksheet.getColumn(addEditDeleteLetter);

    // addEditDeleteColumn.eachCell(function(cell, rowNumber) {
    //     if (cell.value != null || cell.value == "delete" || cell.value == "remove") {
    //         worksheet.spliceRows(rowNumber, 1);
    //     }
    // });

    // rowCount = worksheet.rowCount;
    // console.log('Row count including empty = ' + rowCount);

    // let firstColumn = worksheet.getColumn("A");

    // firstColumn.eachCell(function(cell, rowNumber) {
    //     console.log(cell.value);
    // })

    // let columnsUnreal = worksheet.columnCount;
    // console.log(columnsUnreal);

    // let columnsReal = worksheet.actualColumnCount;
    // console.log(columnsReal);



    // // iterate over columns
    // for (x = 1; x < columnsUnreal; x++) {
    //     console.log('header = ' + worksheet.getColumn(x).header);
    //     console.log('id = ' + worksheet.getColumn(x).id);
    //     console.log('key = ' + worksheet.getColumn(x).key);

    //     let columnLetter = worksheet.getColumn(x).letter;
    //     console.log('column letter = ' + columnLetter);

    //     let firstCell = worksheet.getColumn(x).getCell(1).value;
    //     console.log(firstCell);

    //     console.log('First cell value in column = ' + worksheet.getCell(columnLetter).value);

    //     let firstCellColumnHeader = worksheet.getColumn(x).number;
    //     console.log(firstCellColumnHeader);

    //     console.log(worksheet.getColumn(x));
    // }
}

exports.getWorkbook = getWorkbook;