const path = require("path");
const ExcelJS = require('exceljs');

class LocationSpreadsheetReview {
    constructor(fileFullPath, requestedFields, worksheet) {
        this.fileFullPath = fileFullPath;
        this.fileName = path.basename(fileFullPath);
        this.fileType = path.extname(fileFullPath);
        this.requestedFields = requestedFields;
        this.worksheet = worksheet;
    }
}