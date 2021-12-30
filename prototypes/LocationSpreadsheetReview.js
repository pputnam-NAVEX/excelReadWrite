const path = require("path");
const { CI_locations } = require('../dataValidation/locations.js');
const { tests } = require('./helperTestFunctions/locationsTests.js');

class LocationSpreadsheetReview {
    constructor(fullFilePath, requestedFields, worksheet) {
        this.fullFilePath = fullFilePath;
        this.fileName = path.basename(fullFilePath);
        this.fileType = path.extname(fullFilePath);
        this.requestedFields = requestedFields;
        this.worksheet = worksheet;
        this.headerFields = this.setHeaderFields(worksheet, this.worksheet);
        this.fieldSpecificity = tests.locationSpecificity(requestedFields, this.headerFields, worksheet);
    }

    setHeaderFields(worksheet, thisWorksheet) {
        let headers = {};
        let headerRow = worksheet.getRow(1);

        headerRow.eachCell( {includeEmpty: true}, function(cell, colNumber) {
            let cellValueLowerCase =  cell.value ? cell.value.toLowerCase() : '';
            (cellValueLowerCase != '') ? headers[cellValueLowerCase] = {} : headers[cell.address] = {}
            let field = {
                address: cell.address,
                columnKey: cellValueLowerCase,
                fieldName: cell.value,
                columnNumber: colNumber,
                columnLetter: worksheet.getColumn(colNumber).letter,
                columnCount: worksheet.getColumn(colNumber).values.length,
                isValidField: CI_locations.checkValidityOfData("validLocationFields", cellValueLowerCase)
            }
            headers[cellValueLowerCase] = field;

            (field.isValidField) ? thisWorksheet.getColumn(colNumber).key = field.columnKey : null;
        });
        return headers;
    }

    get fileDirectory() {
        return this.fullFilePath;
    }

    get allHeaders() {
        return this.headerFields;
    }

    get userRequestedFields() {
        return this.requestedFields;
    }

    get theEntireWorksheet() {
        return this.worksheet;
    }
}

exports.LocationSpreadsheetReview = LocationSpreadsheetReview;