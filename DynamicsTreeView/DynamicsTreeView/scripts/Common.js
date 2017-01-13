var Common = (function () {

    //Internal supporting functions
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

    function dateReviver() {

    }

    return {
        WebAPI: {
            RetreiveMultipulteRecords: function (entitySetName, query) {

                query = (query) ? query : "";

                return new Promise(function (resolve, reject) {
                    var req = new XMLHttpRequest();
                    req.open("GET", encodeURI(getWebAPIPath() + entitySetName + query), true);
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
                });
            },
            RetreiveMultipulteRecordsByFetchXml: function (entitySetName, query) {
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
                });
            },
            CreateRecord: function (entitySetName, data) {
                return new Promise(function (resolve, reject) {
                    var req = new XMLHttpRequest();
                    req.open("POST", encodeURI(getWebAPIPath() + entitySetName), true);
                    req.setRequestHeader("Accept", "application/json");
                    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                    req.setRequestHeader("OData-MaxVersion", "4.0");
                    req.setRequestHeader("OData-Version", "4.0");
                    req.setRequestHeader("Prefer", "return=representation");
                    req.onreadystatechange = function () {
                        if (this.readyState == 4 /* complete */) {
                            req.onreadystatechange = null;
                            if (this.status == 201) {
                                console.log("JSON.parse:", JSON.parse(this.responseText));
                                resolve(JSON.parse(this.responseText));
                            }
                            else {
                                reject(Common.WebAPI.ErrorHandler(req.response));
                            }
                        }
                    };
                    req.send(JSON.stringify(data));
                });
            },
            ErrorHandler: function (resp) {
                try {
                    return JSON.parse(resp).error;
                } catch (e) {
                    return new Error("Unexpected Error")
                }
            }
        }
    };
})();