//
//Dynamics Tree Viewer
// Displays Dynamics 365 entity data in TreeView
//requires 
// jquery.1.12.1 or higher
// jquery.ui.min.js
// jquery.fancytree.min.js


var DTV = (function () {
    var Config = {
        ParentFieldName: "",
        TitleFieldName: "",
        RecordIdFieldName: ""
    };

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

    return {
        InitTree: function (param) {

            Config.ParentFieldName = param.ParentFieldName;
            Config.TitleFieldName = param.TitleFieldName;
            Config.RecordIdFieldName = param.RecordIdFieldName;

            var baseUrl = getClientUrl() + "/main.aspx?etn=" + param.entityName + "&pagetype=entityrecord&navbar=off&cmdbar=true"

            $("#tree").fancytree({
                checkbox: false,
                source: DTV.ConvertDataForTreeView(param.data),
                icon: param.icon,
                activate: function (event, data) {
                    $("#statusLine").text("Active node: " + data.node);
                },
                click: function (event, data) {
                    // clickイベント                    
                    if (data.targetType === "title") {
                        $("#entityFrame").attr("src", "");
                        $("#entityFrame").attr("src", baseUrl + "&id=%7B" + data.node.data.selfId + "%7D");
                    }

                }
            });
        },
        ConvertDataForTreeView: function (data) {
            var treeData = [];

            // データ入れ子変換
            for (var i = 0; i < data.value.length; i++) {
                //var parentid = data.value[i]._parentaccountid_value;
                //var title = data.value[i].name;
                //var accountid = data.value[i].accountid;
                var parentid = data.value[i][Config.ParentFieldName];
                var title = data.value[i][Config.TitleFieldName];
                var selfId = data.value[i][Config.RecordIdFieldName];

                // ノード
                var node = {
                    title: title,
                    selfId: selfId
                };

                if (!parentid) {
                    // 最上位（親なし）
                    treeData.push(node);
                } else {
                    // 子捜査
                    DTV.SearchChildren(treeData, parentid, node);
                }
            }

            return treeData;
        },
        SearchChildren: function (data, parentid, node) {
            for (k in data) {
                for (key in data[k]) {
                    if (key === "selfId") {
                        if (data[k][key] === parentid) {
                            if (!data[k].children) {
                                data[k].children = [];
                            }
                            data[k].children.push(node);
                        }
                    } else if (key === "children") {
                        if (data[k][key].length > 0) {
                            if (data[k][key] === parentid) {
                                return data;
                            } else {
                                // 再帰
                                DTV.SearchChildren(data[k][key], parentid, node);
                            }
                        };
                    }
                }
            }
            return data;
        }
    };
})();