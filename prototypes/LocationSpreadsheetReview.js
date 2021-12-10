const path = require("path");
const locationData = require('../dataValidation/locations.js');

setHeaderFields = (worksheet) => {
    let headers = [];
    let headerRow = worksheet.getRow(1);

    headerRow.eachCell( {includeEmpty: true}, function(cell, colNumber) {
        let cellValueLowerCase =  cell.value ? cell.value.toLowerCase() : '';
        let field = {
            address: cell.address,
            columnKey: cellValueLowerCase,
            fieldName: cell.value,
            columnNumber: colNumber,
            columnLetter: worksheet.getColumn(colNumber).letter,
            columnCount: worksheet.getColumn(colNumber).values.length,
            isValidField: locationData.CI_locations.checkValidityOfData("validLocationFields", cellValueLowerCase)
        }
        headers.push(field);

        if (field.isValidField) {
            worksheet.getColumn(colNumber).key = field.columnKey;
        }
    });

    return headers;
}

class LocationSpreadsheetReview {
    constructor(fullFilePath, requestedFields, worksheet) {
        this.fullFilePath = fullFilePath;
        this.fileName = path.basename(fullFilePath);
        this.fileType = path.extname(fullFilePath);
        this.requestedFields = requestedFields;
        this.worksheet = worksheet;
        this.headerFields = setHeaderFields(worksheet);
    }

    get fileDirectory() {
        return this.fullFilePath;
    }

    get allHeaders() {
        return this.headerFields;
    }
}

exports.LocationSpreadsheetReview = LocationSpreadsheetReview;