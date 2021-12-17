const { locResultText } = require('./locResultsText.js')

const parseLocObjResult = (results) => {
    let parsedResults = [];

    (results.requestedFields.length > 0) ? parsedResults.push(locResultText.requestedFields(results.requestedFields)) : null;

    locResultText.worksheetHeaders(results.headerFields, parsedResults);

    if (results.fieldSpecificity.duplicateLocationsByField.length > 0) { // field duplicates, specificity
        parsedResults.push(locResultText.fieldDuplicateTitle);
        for (loc = 0; loc < results.fieldSpecificity.duplicateLocationsByField.length; loc++) {
            locResultText.fieldDuplicate(results.fieldSpecificity.duplicateLocationsByField[loc], parsedResults)
        }
    }

    if (results.fieldSpecificity.locationsWithDataAndEmptyCells.length > 0) {
        parsedResults.push(locResultText.systemOtherTitle);
        locResultText.sysGenOther(results.fieldSpecificity.specificCellsWithMissingData, results.locationsWithDataAndEmptyCells, parsedResults);
    }

    return parsedResults;
}

exports.parseLocObjResult = parseLocObjResult;