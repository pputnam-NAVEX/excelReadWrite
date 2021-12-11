const { Debugger } = require('electron');
const ExcelJS = require('exceljs');
const LocationSpreadsheetReview = require('../prototypes/LocationSpreadsheetReview')

const acceptableLDBFieldNames = ['Add/Edit/Delete', 'Name', 'Branch', 'Address 1', 'Address 2', 'City', "State", "Zip", "Country", "Tier Name", "Data Privacy", "Custom Field 1", "Custom Field 2", "Custom Field 3", "Custom Field 4"];

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

const deleteLocations = function(worksheet) {
    worksheet.getColumn("Add/Edit/Delete").eachCell(function(cell, rowNumber) {
        if (cell.value == "delete") {
            // since this is executing at the start of eachRow, deleting "shouldn't" matter. Since row numbers and cell addresses change we need to test to ensure deleting an entire row/column doesn't affect our report.
            console.log("Removing row " + rowNumber);
            worksheet.spliceRows(rowNumber, 1);
        }
    });
}

const removeEmptyColumns = function(worksheet) {
    let row1 = worksheet.getRow(1);
    row1.eachCell({includeEmpty: true}, function(cell, colNumber) {
        let columnValuesLength = worksheet.getColumn(colNumber).values.length;
        if (columnValuesLength <= 2 && cell.value != "Add/Edit/Delete") {
            console.log("Removing column " + worksheet.getColumn(colNumber).letter + " " + cell.value);
            worksheet.spliceColumns(colNumber, 1);
        }
    })
}

const consistentCountryDPConfig = function(worksheet, results) {
    // define location object with "country/DP status/count"
    let countries = [];
    let countryColumn = worksheet.getColumn("Country");
    let DPColumn = worksheet.getColumn("Data Privacy");
    console.log("Data Privacy column letter is " + DPColumn.letter);

    countryColumn.eachCell(function(cell, rowNumber) {
        if (worksheet.getCell("A" + rowNumber) != "delete" && rowNumber != "1") {
            let notUniqueCountry = true;
            for (country in countries) {
                if (cell.value == countries[country]) {
                    notUniqueCountry = false;
                    break;
                }
            }

            if (notUniqueCountry) {
                countries.push(cell.value);
                console.log(cell.value);
            }
        }
    })
}

// this again needs to be called before removing any rows/columns to keep cell addresses (row numbers and column letters) the same of the original file for the IM/case owner to reference.
// this also means checking the "Add/Edit/Delete" column of that row to see if it is going to be scheduled for delete and then if so ignore the data in this cell/row.
const DPData = ["TRUE","FALSE","true","false","yes","no","y","n",true,false];
const validateDataPrivacy = function(worksheet, results) {
    // likely make "dataPrivacyModule" checking for DP/country/country consistency/etc.
    let headerRow = worksheet.getRow(1);
    let headers = []; // this should likely be kept somewhere globally if helpful in other areas, maybe collect more info too like column letter/number/etc. This likely be set when they are created!
    headerRow.eachCell(function(cell, colNumber) {
        headers.push(worksheet.getColumn(colNumber).key);
    })
    let DP = false;
    let country = false;
    // this should all be handled when setting keys unless the column is empty
    for (header in headers) {
        if (headers[header] == "Data Privacy") {
            console.log("Data Privacy exists and has data");
            DP = true;
        }
        if (headers[header] == "Country") {
            country = true
        }
        if (DP == true && country == true) { break }
    }

    if (DP && !country) {
        let noCountryColumn = "Data Privacy column exists and has data, but there is no Country column. The Data Privacy module must utilize Country data as a field.";
        results.push(noCountryColumn);
        console.log(noCountryColumn);
    } else if (DP && country) {
        consistentCountryDPConfig(worksheet, results);
        let dpColumn = worksheet.getColumn("Data Privacy");
        let countryColumn = worksheet.getColumn("Country");
        // likely consolidate these two eachCell for DP & Country just use different validations
        dpColumn.eachCell({ includeEmpty: true}, function(cell, rowNumber) {
            let isValid = true;
            let emptyOrInvalidData = '';
            if (rowNumber > 1 && worksheet.getCell("A" + rowNumber) != 'delete') { // skip header row & location scheduled to be deleted
                for (dpType in DPData) {
                    if (cell.value == undefined || cell.value == null || cell.value == '') {
                        console.log(cell.value)
                        emptyOrInvalidData = `Cell ${cell.address} in Data Privacy column is empty or invalid please update`;
                        results.push(emptyOrInvalidData);
                        break
                    } else if (cell.value == DPData[dpType]) {
                        isValid = true;
                        break
                    } else {
                        isValid = false;
                    }
                }
                if (!isValid) {
                    emptyOrInvalidData = `Cell ${cell.address} in Data Privacy column is empty or invalid please update`;
                    results.push(emptyOrInvalidData);
                }
            }
        });
        countryColumn.eachCell({ includeEmpty: true}, function(cell, rowNumber) { // skip header row & location scheduled to be deleted
            if (rowNumber > 1 && worksheet.getCell("A" + rowNumber) != 'delete') {
                if (cell.value == undefined || cell.value == null || cell.value == '') {
                    emptyOrInvalidData = `Cell ${cell.address} in Country column is empty or invalid, with a Data Privacy module, all locations must have Country data. Please update or review.`;
                    results.push(emptyOrInvalidData);
                }
            }
        })
    }
}

// const validateSpecificity = function(worksheet, results, requestedFields, headers) {
//     let fields = ["Country"];
//     let headers = ["Add/Edit/Delete", "Country", "Data Privacy", "Custom Field 1", "City", "State"];
//     let validFields = [];

//     for (field in fields) {
//         let validField = false;
//         for (header in headers) {
//             if (fields[field] == headers[header]) {
//                 validField = true;
//                 validFields.push(fields[field]);
//                 break;
//             }
//         }
//     }
// }

const reviewLocationSpreadsheet = async function(args) {
    let argsObject = args;
    console.log(argsObject);
    const workbook = new ExcelJS.Workbook();
    // do we fork files here, one for CI one for IM? Two files, somehow keep workload down
    // keep global "working copy" of review results ready for edit in index.js or something similar (e.g. don't just send it to the front end and remove from memory.)
    const worksheet = await workbook.csv.readFile(args.path);
    let results = [];
    let evaluateLocations = new LocationSpreadsheetReview.LocationSpreadsheetReview(args.path, args.fields, worksheet);

    worksheet.eachRow({ includeEmpty: true } ,function(row, rowNumber) {
        if (rowNumber == 1) {
            row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                if (worksheet.getColumn(colNumber).values.length > 2 || cell.value == 'Add/Edit/Delete') {
                    // if colNumber.header == FIELD
                    if (cell.value == undefined || cell.value == '' || cell.value == null) {
                        let emptyHeader = "Column " + worksheet.getColumn(colNumber).letter + " doesn't have a field name (" + cell.address + "). Please add a valid field name or delete this column if it is unnecessary.";
                        results.push(emptyHeader);
                        console.log(emptyHeader);
                    }
                    else {
                        let isFieldValueValid = validateLDBFields(cell.value);
                        if (isFieldValueValid) {
                            worksheet.getColumn(colNumber).key = cell.value;
                        } else {
                            let invalidHeader = 'Field Value "' + cell.value + '" (' + cell.address + ') is invalid, please update.';
                            results.push(invalidHeader);
                            console.log(invalidHeader);
                        }
                    }
                } else {
                    let emptyColumn = 'Column ' + worksheet.getColumn(colNumber).letter + " " + cell.value + " is empty and can be removed/deleted."
                    results.push(emptyColumn);
                    console.log(emptyColumn);
                }
            });
            validateDataPrivacy(worksheet, results);
            // For now - anything below this comment section will not be accurately reported on frontend as the worksheet object is edited.
            // If we haven't forked into two different files we could do so now
            // 
            // for accurate cell addresses for case owner/IM review before removing anything
            // call after for accurate report column letter on frontend in unedited original spreadsheet.
            removeEmptyColumns(worksheet);
        } else if (row.values == '' ) {
            let emptyRow = "Row " + rowNumber + " is empty. Please delete empty rows or fix if unintended";
            results.push(emptyRow);
            console.log(emptyRow);
        } else {

        }
    });
    // call this after eachRow because if empty rows are deleted this will change the row number that is reported to user/case owner/IM when they are shifted up.
    // this will throw error if it doesn't exist, need to validate
    if (worksheet.getColumn("Add/Edit/Delete")) {deleteLocations(worksheet)};
    

    return results;
};

exports.reviewLocationSpreadsheet = reviewLocationSpreadsheet;