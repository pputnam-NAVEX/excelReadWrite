const addLocationFieldDropdown = function() {
    let dropDownOptions = {
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
    
    let newDropdown = document.createElement('select');
    newDropdown.className = 'locationField';

    for (field in dropDownOptions) {
        let option = document.createElement('option');
        option.value = field;
        option.innerHTML = dropDownOptions[field];
        newDropdown.appendChild(option);
    }

    document.getElementById('locationFieldDropdownContainer').appendChild(newDropdown);
}