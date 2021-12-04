const ExcelJS = require('exceljs');

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
        // going to need to pass in result or return something for this to display on frontend
        let noCountryColumn = "Data Privacy column exists and has data, but there is no Country column. The Data Privacy module must utilize Country data as a field.";
        results.push(noCountryColumn);
        console.log(noCountryColumn);
    } else if (DP && country) {
        let dpColumn = worksheet.getColumn("Data Privacy");
        let countryColumn = worksheet.getColumn("Country");
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
        countryColumn.eachCell({ includeEmpty: true}, function(cell, rowNumber) {
            if (cell.value == undefined || cell.value == null || cell.value == '') {
                emptyOrInvalidData = `Cell ${cell.address} in Country column is empty or invalid, with a Data Privacy module, all locations must have Country data. Please update or review.`;
                results.push(emptyOrInvalidData);
            }
        })
    }
}

const reviewLocationSpreadsheet = async function(args) {
    const workbook = new ExcelJS.Workbook();
    // do we fork files here, one for CI one for IM? Two files, somehow keep workload down
    // keep global "working copy" of review results ready for edit in index.js or something similar (e.g. don't just send it to the front end and remove from memory.)
    const worksheet = await workbook.csv.readFile(args.path);
    let results = [];

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
            // 
            // 
            // for accurate cell addresses for case owner/IM review before removing anything
            // call after for accurate report column letter report on frontend in unedited original spreadsheet.
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