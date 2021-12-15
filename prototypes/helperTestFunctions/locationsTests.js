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

const tests = {
    locationSpecificity: function(requestedFields, worksheetHeaderFields, worksheet) {
        let fieldsWithData = [];
        for (field in requestedFields) {
            if (requestedFields[field] != undefined) {
                for (actualField in worksheetHeaderFields) {
                    if (requestedFields[field] == worksheetHeaderFields[actualField].columnKey) {
                        fieldsWithData.push(worksheetHeaderFields[actualField]);
                    }
                }
            }
        }

        let numberOfFieldsRequested = fieldsWithData.length;

        if (numberOfFieldsRequested == 1) {
            console.log(`Only one field requested, do your thing!`)
        } else if (numberOfFieldsRequested > 1) {
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

            // compareLocationArrays(results, locationArray);

            for (i = 0; i < locationArray.length; i++){

                if (locationArray[i].locationFieldData[0] == null) {
                    results.locationsWithDataAndEmptyCells.push(locationArray[i])
                    results.specificCellsWithMissingData.push(locationArray[i].cellAddresses[0])
                }

                let isDuplicate = false;
                for (dup in results.duplicateLocationsByField) {
                    (locationArray[i].row == results.duplicateLocationsByField[dup].duplicate.row) ? isDuplicate = true : null}

                for (x = i+1; x < locationArray.length; x++) {
                    if (!isDuplicate) {
                        3
                        if (equals(locationArray[i].locationFieldData, locationArray[x].locationFieldData)) {
                            let duplicate = {
                                duplicate: locationArray[x],
                                duplicateOf: locationArray[i],
                            }
                            results.duplicateLocationsByField.push(duplicate);
                        } else {
                            for (field = 0;  field < locationArray[i].locationFieldData.length; field++) {
                                if (!equals(locationArray[i].locationFieldData[0], locationArray[x].locationFieldData[0])) {
                                    field = locationArray[i].locationFieldData.length;
                                } else {
                                    if (locationArray[i].locationFieldData[field] == null && locationArray[x].locationFieldData[field] != null) {
                                        if (!alreadyInResults(results.locationsWithDataAndEmptyCells, locationArray[i].row, 'row')) {
                                            results.locationsWithDataAndEmptyCells.push(locationArray[i])
                                            results.specificCellsWithMissingData.push(locationArray[i].cellAddresses[field])
                                            field = locationArray[i].locationFieldData.length;
                                        }
                                    } else if (locationArray[i].locationFieldData[field] != null && locationArray[x].locationFieldData[field] == null) {
                                        if (!alreadyInResults(results.locationsWithDataAndEmptyCells, locationArray[x].row, 'row')) {
                                            results.locationsWithDataAndEmptyCells.push(locationArray[x])
                                            results.specificCellsWithMissingData.push(locationArray[x].cellAddresses[field])
                                            field = locationArray[i].locationFieldData.length;
                                        }
                                    } else if (!equals(locationArray[i].locationFieldData[field], locationArray[x].locationFieldData[field])) {
                                        field = locationArray[i].locationFieldData.length;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            for (dup in results.duplicateLocationsByField) { 
                for (item in results.duplicateLocationsByField[dup]) {
                    console.log(`${results.duplicateLocationsByField[dup][item].row}`)
                }
             }
            console.log(`Locs with empty cells = ${results.locationsWithDataAndEmptyCells}`)
            console.log(`Specific cells = ${results.specificCellsWithMissingData}`)
        }
    }
}

exports.tests = tests;