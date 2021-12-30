// helper functions
const equals = (array1, array2) => JSON.stringify(array1) === JSON.stringify(array2);

const alreadyInResults = (resultsArray, rowOrCell, key) => {
    let foundMatch = false
    for (item in resultsArray) {
        if (resultsArray[item][key] == rowOrCell) {
            foundMatch = true;
        }
    }
    return foundMatch;
}

// primary function
// this does specificity and system generated other
const tests = {
    locationSpecificity: function(requestedFields, worksheetHeaderFields, worksheet) {
        let fieldsWithData = [];
        for (field in requestedFields) {
            for (actualField in worksheetHeaderFields) {
                if (requestedFields[field] == worksheetHeaderFields[actualField].columnKey) {
                    fieldsWithData.push(worksheetHeaderFields[actualField]);
                }
            }
        }

        let firstField = fieldsWithData[0];
        let remainingFields = fieldsWithData;
        remainingFields.shift();
        let locationArray = [];
        let results = {
            duplicateLocationsByField: [], // not enough specificity given fields provided
            locationsWithDataAndEmptyCells:[], // system generated other
            specificCellsWithMissingData:[] // system generated other but more specific
        }
        let firstColumn = worksheet.getColumn(firstField.columnKey);
        firstColumn.eachCell( {includeEmpty: true}, function(cell, rowNumber) {
            if (rowNumber > 1 && worksheet.getRow(rowNumber).getCell(1).value != 'delete') {
                let location = {
                    row: rowNumber,
                    locationFieldData: [],
                    cellAddresses:[]
                };
                location.locationFieldData.push(cell.value);
                location.cellAddresses.push(cell.address);
                for (field in remainingFields) {
                    location.locationFieldData.push(worksheet.getCell(remainingFields[field].columnLetter + rowNumber).value)
                    location.cellAddresses.push(worksheet.getCell(remainingFields[field].columnLetter + rowNumber).address)
                }
                locationArray.push(location);
            }
        });

        for (i = 0; i < locationArray.length; i++){ // start loop through locations by field column here
            let locPrime = locationArray[i].locationFieldData;

            if (locPrime[0] == null) { // if the location's first field value is null, immediately add it
                results.locationsWithDataAndEmptyCells.push(locationArray[i])
                results.specificCellsWithMissingData.push(locationArray[i].cellAddresses[0])
            }
            let loc1AlreadyInResults = alreadyInResults(results.locationsWithDataAndEmptyCells, locationArray[i].row, 'row'); // we can skip comparing if it is already found

            let isDuplicate = false;
            for (dup in results.duplicateLocationsByField) {(locationArray[i].row == results.duplicateLocationsByField[dup].duplicate.row) ? isDuplicate = true : null} // given fields, check if already found duplicate

            for (x = i+1; x < locationArray.length; x++) {
                let locCompare = locationArray[x].locationFieldData;

                if (!isDuplicate) { // if not already duplicate (given fields provided - specificity)
                    if (equals(locPrime, locCompare)) {
                        let duplicate = {
                            duplicate: locationArray[x],
                            duplicateOf: locationArray[i],
                        }
                        results.duplicateLocationsByField.push(duplicate);
                    }
                    if (!loc1AlreadyInResults) { // can skip if already found
                        for (field = 0;  field < locPrime.length; field++) { // cycle through field values of each loc, 
                            if (!equals(locPrime[0], locCompare[0])) { // if the first value doesn't equal we're done
                                field = locPrime.length;
                            } else { // checked if first value isn't equal so logically only get here if they ARE equal
                                if ((locPrime[field] == null && locCompare[field] != null) || (locPrime[field] != null && locCompare[field] == null)) {
                                    let nullItem = 0;
                                    (locPrime[field] == null) ? nullItem = i : nullItem = x;
                                    if (!alreadyInResults(results.locationsWithDataAndEmptyCells, locationArray[nullItem].row, 'row')) { // already done for locPrime but not locCompare
                                        results.locationsWithDataAndEmptyCells.push(locationArray[nullItem])
                                        results.specificCellsWithMissingData.push(locationArray[nullItem].cellAddresses[field])
                                        field = locPrime.length;
                                    }
                                } else if (!equals(locPrime[field], locCompare[field])) { // if unique data is found, break loop, not system generated other and able to narrow to location
                                    field = locPrime.length;
                                }
                            } // loop continues if values are equal to each other as missing data was not found but haven't reached enough specificity until they don't equal
                        }
                    }
                }
            }
        }

        return results;
    }
}

exports.tests = tests;