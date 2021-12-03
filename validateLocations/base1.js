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

const reviewLocationSpreadsheet = async function(args) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = await workbook.csv.readFile(args.path);
    let results = [];

    worksheet.eachRow({ includeEmpty: true } ,function(row, rowNumber) {
        if (rowNumber == 1) {
            row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
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

                if (worksheet.getColumn(colNumber).key == "Add/Edit/Delete") {deleteLocations(worksheet)};
            });
        } else if (row.values == '' ) {
            let emptyRow = "Row " + rowNumber + " is empty. Please delete empty rows or fix if unintended";
            results.push(emptyRow);
            console.log(emptyRow);
        } else {
            
        }
    });
};

exports.reviewLocations = reviewLocationSpreadsheet;