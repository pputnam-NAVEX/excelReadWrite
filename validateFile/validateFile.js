const ExcelJS = require('exceljs');
const path = require("path");

const getWorkbook = async function(args) {
    const workbook2 = new ExcelJS.Workbook();
    const worksheet = await workbook2.csv.readFile(args);
    // console.log(worksheet);

    let rowCount = worksheet.rowCount;
    console.log('Row count including empty = ' + rowCount);

    let startingPoint = '';
    let addEditDeleteLetter = '';

    for (x = 1; x < rowCount; x++) {
        let row = worksheet.getRow(x);
        console.log(row.values);

        if (row.getCell(1).value = "Add/Edit/Delete") {
            startingPoint = row.getCell(1).address;
            addEditDeleteLetter = row.getCell(1).address.match(/^[A-Z]*[^0-9]/g)[0];
            x = rowCount;
        }
    }

    let addEditDeleteColumn = worksheet.getColumn(addEditDeleteLetter);

    addEditDeleteColumn.eachCell(function(cell, rowNumber) {
        if (cell.value != null || cell.value == "delete" || cell.value == "remove") {
            worksheet.spliceRows(rowNumber, 1);
        }
    });

    rowCount = worksheet.rowCount;
    console.log('Row count including empty = ' + rowCount);

    // let firstColumn = worksheet.getColumn("A");

    // firstColumn.eachCell(function(cell, rowNumber) {
    //     console.log(cell.value);
    // })

    // let columnsUnreal = worksheet.columnCount;
    // console.log(columnsUnreal);

    // let columnsReal = worksheet.actualColumnCount;
    // console.log(columnsReal);



    // // iterate over columns
    // for (x = 1; x < columnsUnreal; x++) {
    //     console.log('header = ' + worksheet.getColumn(x).header);
    //     console.log('id = ' + worksheet.getColumn(x).id);
    //     console.log('key = ' + worksheet.getColumn(x).key);

    //     let columnLetter = worksheet.getColumn(x).letter;
    //     console.log('column letter = ' + columnLetter);

    //     let firstCell = worksheet.getColumn(x).getCell(1).value;
    //     console.log(firstCell);

    //     console.log('First cell value in column = ' + worksheet.getCell(columnLetter).value);

    //     let firstCellColumnHeader = worksheet.getColumn(x).number;
    //     console.log(firstCellColumnHeader);

    //     console.log(worksheet.getColumn(x));
    // }
}

exports.getWorkbook = getWorkbook;