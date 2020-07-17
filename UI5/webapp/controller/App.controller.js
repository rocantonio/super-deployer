sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/model/odata/v4/ODataModel"
], function(Controller, formatter, ODataModel) {
	"use strict";

	return Controller.extend("roc.deployer.controller.App", {

		formatter: formatter,

		onInit: function () {
			var o = new ODataModel();
		}
	});
});