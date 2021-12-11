const equals = (array1, array2) => JSON.stringify(array1) === JSON.stringify(array2);

const compareLocationArrays = (results, locationArray) => {
    let compareArray = [];
    let workingArray = locationArray;
    let length = workingArray.length;

    for (i = 0; i < length; i++) {
        let foundMatch = false;
        let locationSubGroup = [];
        
        for (x = i+1; x < length; x++) {
            if (workingArray[i].locationFieldData[0] == workingArray[x].locationFieldData[0]) {
                let location = workingArray.splice(x,1);
                locationSubGroup.push(location);
                length = workingArray.length;
                foundMatch = true;
            }
        }
        foundMatch ? locationSubGroup.unshift(workingArray[i]) : null;
        (locationSubGroup.length > 0) ? compareArray.push(locationSubGroup) : null;
    }
    for (obj in compareArray) {
        console.log(compareArray[obj])
    }
    // console.log(compareArray);
    // console.log(workingArray);
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
                fieldsWithDataAndEmptyCells:[] // system generated other
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

            compareLocationArrays(results, locationArray);

            for (i = 0; i < locationArray.length; i++){
                let isDuplicate = false;
                emptyDataCellsInField = [];
                for (dup in results.duplicateLocationsByField) {
                    if (locationArray[i].row == results.duplicateLocationsByField[dup].duplicate.row){
                        isDuplicate = true;
                    }
                }
                for (x = i+1; x < locationArray.length; x++) {
                    if (!isDuplicate) {
                        if (equals(locationArray[i].locationFieldData, locationArray[x].locationFieldData)) {
                            let duplicate = {
                                duplicate: locationArray[x],
                                duplicateOf: locationArray[i],
                            }
                            results.duplicateLocationsByField.push(duplicate);
                        }
                    }
                }
            }
            // console.log(results.duplicateLocationsByField)
        }
    }
}

exports.tests = tests;