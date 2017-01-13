/// <reference path="./DynamicsTreeViewer.js"/>
function getClientUrl() {
    //Get the organization URL
    if (typeof GetGlobalContext == "function" &&
        typeof GetGlobalContext().getClientUrl == "function") {
        return GetGlobalContext().getClientUrl();
    }
    else {
        //If GetGlobalContext is not defined check for Xrm.Page.context;
        if (typeof Xrm != "undefined" &&
            typeof Xrm.Page != "undefined" &&
            typeof Xrm.Page.context != "undefined" &&
            typeof Xrm.Page.context.getClientUrl == "function") {
            try {
                return Xrm.Page.context.getClientUrl();
            } catch (e) {
                throw new Error("Xrm.Page.context.getClientUrl is not available.");
            }
        }
        else { throw new Error("Context is not available."); }
    }
}

function getWebAPIPath() {
    return getClientUrl() + "/api/data/v8.2/";
}

function RetreiveMultipulteRecordsByFetchXml(entitySetName, query) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open("GET", encodeURI(getWebAPIPath() + entitySetName + "?fetchXml=" + query), true);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Prefer", "odata.include-annotations=*");
        req.onreadystatechange = function () {
            if (this.readyState == 4 /* complete */) {
                req.onreadystatechange = null;
                if (this.status == 200) {
                    console.log("JSON.parse:", JSON.parse(this.responseText));
                    resolve(JSON.parse(this.responseText));
                }
                else {
                    reject(Common.WebAPI.ErrorHandler(req.response));
                }
            }
        };
        req.send();
    })
};

$(function () {

    var fetchXml = '<fetch>' +
                    '  <entity name="new_sample" >' +
                    '    <attribute name="new_sampleid" />' +
                    '    <attribute name="new_parentsample" />' +
                    '    <attribute name="new_name"/>' +
                    '    <filter type="and" >' +
                    '      <condition attribute="new_sampleid" operator="eq-or-under" value="0608fd1a-52d6-e611-80fd-c4346bad16b0" />' +
                    '    </filter>' +
                    '  </entity>' +
                    '</fetch>';
    RetreiveMultipulteRecordsByFetchXml("new_samples", fetchXml)
        .then(function(result){
            DTV.InitTree({
                data: result,
                icon: "/_imgs/ico_16_1.gif",
                entityName: "new_sample",
                ParentFieldName: "_new_parentsample_value",
                RecordIdFieldName: "new_sampleid",
                TitleFieldName: "new_name"
            })
        })
        .catch(function (err) {
            console.log(err);
        });
});

