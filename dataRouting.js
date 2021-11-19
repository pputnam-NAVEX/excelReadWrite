document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();

    const { path } = document.querySelector('input').files[0];

    // sending to Electron ->
    window.api.send("toMain", path);

});

window.api.receive("fromMain", (data) => {
    document.querySelector('#duration').innerHTML = `${data}`;
    console.log(`Received ${data} from main process`);
});