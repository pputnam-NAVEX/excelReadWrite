const CI_locations = {
    // add *lowercase* to either uploadValidFields (for CI) or caseOwnerValidFieldsDiff (for common synonyms from case owners)
    // strictly used by CI to upload locations
    uploadValidFields:["counter","name","location","branch","address1","address2","city","state","zip","postal code","country","region","region code","country code","custom field 1","custom field 2","custom field 3","custom field 4","custom field 5","custom field 6","starwoodid","redirectclientid", "violationpackageid","dataprivacy","client identifier"],
    // acceptable determinable fields that can be later changed into valid strict fields used by CI
    caseOwnerValidFieldsDiff:["add/edit/delete","address 1","address 2","branch #","branch number","cf1","cf2","cf3","cf4","cf5","cf6","client id","data privacy","dp","location name","starwood id","state/province","tier name","tier"],
    dataPrivacy:["dataprivacy","data privacy","dp"],
    dataPrivacyData:["true","false","yes","no","y","n"],
    delete:['del, delete, remove'],
    add:['add, ad, new, additional'],
    edit:["edit, ed, change, update"],
    invalidCharacters:[";",'"'],
    sanctionedCountries:["Cuba","Syria","Iran"], // check these
    // arrayToCompare should be an object key in CI_locations, e.g. CI_locations[arrayToCompare]
    // dataString is a string to compare array, e.g. "DP"
    checkValidityOfData: function(arrayToCompare, dataString) {
        let isValidData = false;
        let comparisonArray = CI_locations[arrayToCompare]
        for (data in comparisonArray) {
            if (dataString == comparisonArray[data]) {
                isValidData = true;
                break;
            }
        }
        return isValidData;
    },
    // maybe these functions aren't here, this may be just for validation data?
    checkSynonymousFields: function(fields){
        // cannot have:
        // name AND location
        // zip AND postal code
        // region and region code
    },
    makeSimple: function(data) {
        // check data type toString()
        // toLower()
    }
}

CI_locations.validLocationFields = CI_locations.uploadValidFields.concat(CI_locations.caseOwnerValidFieldsDiff)

exports.CI_locations = CI_locations;