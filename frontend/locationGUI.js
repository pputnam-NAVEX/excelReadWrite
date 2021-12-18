const dropDownOptions = {
    country:"Country",
    state:"State",
    city:"City",
    name:"Name",
    branch:"Branch or Branch Number",
    address1:"Address1 (primary)",
    address2:"Address2 (alternate)",
    cf1:"custom field 1",
    cf2:"custom field 2",
    cf3:"custom field 3",
    cf4:"custom field 4",
}

function updateDropdownValues(event) {
    document.getElementsByClassName("locationField");
    // Remove AND add value to other drop downs dynamically
    // console.log(event.target.value)
    console.log(event.target.id);
    let currentDropDowns = document.getElementsByClassName("locationField");
    let currentValues = [];
    for (index = 0; index < currentDropDowns.length; index++) {
        currentValues.push(currentDropDowns[index].value)
    };
    let nonChosenValues = [];
    for (option in dropDownOptions) {
        let found = false;
        for (value in currentValues) {
            if (option == currentValues[value]) {
                found = true;
            }
        }
        (!found) ? nonChosenValues.push(dropDownOptions[option]) : null;
    }

    for (select = 0; select < currentDropDowns.length; select++) {
        for (option = 0; option < currentDropDowns[select].length; option++) {
            if (currentDropDowns[select].id != event.target.id) {
                if (event.target.value == currentDropDowns[select][option].value) {
                    currentDropDowns[select][option].remove();
                }
            }
        }
    };
}

const addLocationFieldDropdown = function() {
    let optionAlreadySelected = []
    let currentDropDowns = document.getElementsByClassName("locationField");
    let numberOfFields = currentDropDowns.length;
    for (index = 0; index < currentDropDowns.length; index++) {
        optionAlreadySelected.push(currentDropDowns[index].value)
    };

    let newDropdown = document.createElement('select');
    numberOfFields++
    newDropdown.className = 'locationField';
    newDropdown.id = "field" + numberOfFields;

    for (field in dropDownOptions) {
        let alreadyChosen = false;
        for (option = 0; option < optionAlreadySelected.length; option++) {
            if (optionAlreadySelected[option] == field) {
                alreadyChosen = true;
            }
        }
        if (!alreadyChosen) {
            let option = document.createElement('option');
            option.value = field;
            option.innerHTML = dropDownOptions[field];
            newDropdown.appendChild(option);
        }

    }
    newDropdown.addEventListener("change", updateDropdownValues);
    document.getElementById('locationFieldDropdownContainer').appendChild(newDropdown);

    // removes the default value from previous drop down
    for (select = 0; select < currentDropDowns.length-1; select++) {
        for (option = 0; option < currentDropDowns[select].length; option++) {
            if (currentDropDowns[select][option].value == newDropdown.value) {
                currentDropDowns[select][option].remove();
                option = currentDropDowns[select].length;
            }
        }
    }
}