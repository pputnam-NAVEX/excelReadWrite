const path = require("path");
const locationData = require('../dataValidation/locations.js');


class LocationSpreadsheetReview {
    constructor(fileFullPath, requestedFields, worksheet) {
        this.fileFullPath = fileFullPath;
        this.fileName = path.basename(fileFullPath);
        this.fileType = path.extname(fileFullPath);
        this.requestedFields = requestedFields;
        this.worksheet = worksheet;
        this.headerFields = (worksheet) => {
            let headers = [];
            let headerRow = worksheet.getRow(1);

            headerRow.eachCell( {includeEmpty: true}, function(cell, colNumber) {
                let field = {
                    columnKey: cell.value.toLowerCase(),
                    fieldName: cell.value,
                    columnNumber: colNumber,
                    columnCount: worksheet.getColumn(colNumber).values.length,
                    isValidField: locationData.CI_locations.checkValidityOfData(validLocationFields, cell.value.toLowerCase())
                }
                headers.push(field);

                if (field.isValidField) {
                    this.worksheet.getColumn(colNumber).key = field.columnKey;
                }
            });

            return headers;

        }
    }

    get fullPathToFile() {
        return this.fileFullPath;
    }
}

exports.LocationSpreadsheetReview = LocationSpreadsheetReview;