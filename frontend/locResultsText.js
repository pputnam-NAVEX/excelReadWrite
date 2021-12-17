const locResultText = {
    requestedFields: (fields) => `<h3>Requested fields: ${fields}</h3>`,
    worksheetHeaders: (headers, parsedResults) => {
        let invalidOrEmptyHeaders = [];
        let validNonEmptyHeaders = [];
        for (header in headers) {
            if ((headers[header].columnKey != 'add/edit/delete' && headers[header].isValidField == false)) {
                invalidOrEmptyHeaders.push(headers[header].fieldName)
                console.log(headers[header].fieldName)
            } else if (headers[header].isValidField == true && headers[header].columnCount > 2) {
                validNonEmptyHeaders.push(headers[header].fieldName);
            }
        }
        if (invalidOrEmptyHeaders.length > 0) {
            let invalidHeaderString = `<strong>The following headers/columns are either invalid, or empty. Please review that this is intentional or if empty, these can be removed: `;
            for (invalidHeader in invalidOrEmptyHeaders) {invalidHeaderString += `${invalidOrEmptyHeaders[invalidHeader]}, `};
            invalidHeaderString += `</strong>`
            parsedResults.push(invalidHeaderString);
        }
        let validHeaderString = `<strong>Valid headers with data, please review: `
        if (validNonEmptyHeaders.length > 0) {
            for (validHeader in validNonEmptyHeaders) {validHeaderString += `${validNonEmptyHeaders[validHeader]}, `}
            validHeaderString += `</strong>`
            parsedResults.push(validHeaderString);
        }
    },
    fieldDuplicateTitle:`Based on the fields provided, the following locations have duplicate data and require more specificity. Please edit data or add a field to prevent location search after issue selection:`,
    fieldDuplicate: function(dupObj, parsedResultArray) {
        let output = `Row ${dupObj.duplicate.row} has the same requested field data as row ${dupObj.duplicateOf.row}: ${JSON.stringify(dupObj.duplicate.locationFieldData)}`
        parsedResultArray.push(output);
    },
    systemOtherTitle:`Based on the fields provided and the data in the LDB the following locations and cells need data to avoid a system generated "Other" from occurring:`,
    sysGenOther: function(cellAddresses, locations, parsedResultArray) {
        let output = `Cells with missing data: ${cellAddresses}`
        parsedResultArray.push(output);
    }
}

exports.locResultText = locResultText;