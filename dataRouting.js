document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();

    const { path } = document.querySelector('input').files[0];
    const locationFields = document.getElementsByClassName('locationField');

    let fields = [];
    for (field in locationFields) {
        fields.push(locationFields[field].value)
    };

    const reviewSpreadsheet = {
        path: path,
        fields: fields
    }

    // sending to Electron ->
    window.api.send("toMain", reviewSpreadsheet);

});

window.api.receive("fromMain", (data) => {
    document.querySelector('#duration').innerHTML = '';
    // document.querySelector('#duration').innerHTML = `${data}`;
    for (key in data) {
        document.querySelector('#duration').innerHTML += `${data[key]} <br/>`;
    }
    console.log(`Received ${data} from main process`);
});