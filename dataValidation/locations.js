
// hold in JS object or something like JSON?
CI_locations = {
    uploadValidFields:["counter","name","location","branch","address1","address2","city","state","zip","postal code","country","region","region code","country code","custom field 1","custom field 2","custom field 3","custom field 4","custom field 5","custom field 6","starwoodid","redirectclientid", "violationpackageid","dataprivacy","client identifier"],
    caseOwnerValidFieldsDiff:["add/edit/delete","branch #","branch number","cf1","cf2","cf3","cf4","cf5","cf6","client id","data privacy","dp","location name","starwood id","state/province","tier name","tier"],
    dataValidations:{
        dataPrivacy:["true","false","yes","no","y","n"]
    },
    validCountries:[],
    sanctionedCountries:["Cuba","Syria","Iran"], // check these
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

