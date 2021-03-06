sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter",
	'sap/ui/core/Fragment',
	'sap/ui/model/json/JSONModel',
	'../model/lodash',
	"sap/m/MessageBox"
], function (Controller, formatter, Fragment, JSONModel, Lodash, MessageBox) {
	"use strict";

	return Controller.extend("roc.deployer.controller.App", {

		formatter: formatter,

		onInit: function () {
			var ws = new WebSocket('ws://localhost:'+window.location.port);

			ws.onopen = () => {
				console.log("SUPER")
			}
			var ProjToModel = new JSONModel([]);
			var SpacesModel = new JSONModel([]);
			var TerminalModel = new JSONModel([]);
			var oModel = new JSONModel({ Type: "Default", Env: "Dev", Org: "", Space: "", CFVersion: "CF", Busy: { SpaceSelect: false } });
			this.getView().setModel(TerminalModel, "TerminalModel")
			this.getView().setModel(oModel, "UtilModel");
			this.getView().setModel(ProjToModel, "ProjToDeploy");
			this.getView().setModel(SpacesModel, "SpacesModel");
			this.ProjToDeploy = this.getView().getModel("ProjToDeploy");
			this.SpacesModel = this.getView().getModel("SpacesModel");
			this.UtilModel = this.getView().getModel("UtilModel");
			this.TerminalModel = this.getView().getModel("TerminalModel")
			this.ProjModel = this.getOwnerComponent().getModel("ProjectsModel");
			this.OrgsModel = this.getOwnerComponent().getModel("OrgsModel");
			this.TerminalModel.setSizeLimit(9000);
		},



		handleOptionsPopoverPress: function (oEvent) {
			var oButton = oEvent.getSource();

			// create popover
			if (!this._oPopover) {
				// this._oPopover = sap.ui.xmlfragment("roc.deployer.view.optionsPopOver", this);
				Fragment.load({
					name: "roc.deployer.view.optionsPopOver",
					controller: this
				}).then(function (pPopover) {
					this._oPopover = pPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}
		},

		itemsToDeploy: function () {
			this._traspasItems(false);
		},

		itemsToNotDeploy: function () {
			this._traspasItems(true);
		},


		handleOrgChange: async function (oEvt) {
			this.UtilModel.setProperty("/Busy/SpaceSelect", true);
			let key = oEvt.getParameter("selectedItem").getKey();
			if (!!key) {
				this.SpacesModel.setData(await this._callAjax("/deployer/spaces", "POST", { ID: key }));
				this.UtilModel.setProperty("/Busy/SpaceSelect", false);
			}
		},

		// handleVersionChange: function(){
		// 	let version = this.UtilModel.getProperty("/CFVersion");
		// 	this.OrgsModel
		// },

		handleDeployWarning: function () {
			var infoDeployment = this.UtilModel.getData();
			var projectsToDeploy = this.ProjToDeploy.getData();

			if (!infoDeployment.Org || !infoDeployment.Space)
				return MessageBox.error("No Organitzation or Space!!!");

			if (!projectsToDeploy.length)
				return MessageBox.error("No selected Projects!!!");

			if (infoDeployment.Type !== "Default")
				return MessageBox.error("For now only Ext Deploy is unavailable, please use the other.");

			MessageBox.warning(`Are you sure you want to deploy on ${infoDeployment.Org} - ${infoDeployment.Space}?`, {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: async (sAction) => {
					if (sAction == "OK") {
						// await this._callAjax("/deployer/deploy", "POST", { info: infoDeployment, projects: projectsToDeploy });
						// Do deployment
						var ws = new WebSocket('ws://localhost:'+window.location.port+'/main');


						ws.onopen = () => {
							ws.send(JSON.stringify({ info: infoDeployment, projects: projectsToDeploy }));
							this._terminalDialog();
						};
						ws.onclose = () => {
							MessageBox.success("Finitto ;) !!");
							console.log("DISCONECTED")
						};
						ws.onmessage = (event) => {
							let terminal = this.TerminalModel.getData();
							terminal.push(JSON.parse(event.data));
							this.TerminalModel.setData(terminal);
							$('#firstScrollContainer').scrollTop($('#firstScrollContainer')[0].scrollHeight);
						};


					}
				}
			});
		},

		_terminalDialog: function () {
			if (!this._oDialog) {
				// this._oPopover = sap.ui.xmlfragment("roc.deployer.view.optionsPopOver", this);
				Fragment.load({
					name: "roc.deployer.view.terminalDialog",
					controller: this
				}).then(function (pDialog) {
					this.TerminalModel.setData([]);
					this._oDialog = pDialog;
					this.getView().addDependent(this._oDialog);
					this._oDialog.open()
				}.bind(this));
			} else {
				this._oDialog.open();
			}
		},
		_traspasItems: function (invers) {
			var selectedItems = this.getView().byId(invers ? "ListToDeploy" : "ListToNotDeploy").getSelectedItems();
			var projects = invers ? _.cloneDeep(this.ProjToDeploy.getData()) : _.cloneDeep(this.ProjModel.getData());
			var projectsTo = invers ? _.cloneDeep(this.ProjModel.getData()) : _.cloneDeep(this.ProjToDeploy.getData());
			for (var i in selectedItems) {
				for (var a in projects) {
					if (projects[a].ID == selectedItems[i].getBindingContext(invers ? "ProjToDeploy" : "ProjectsModel").getObject().ID) {
						projectsTo.push(projects.splice(a, 1)[0]);
					}
				}
			}

			this.ProjToDeploy.setData(invers ? projects : projectsTo);
			this.ProjModel.setData(invers ? projectsTo : projects);
			this.getView().byId(invers ? "ListToDeploy" : "ListToNotDeploy").removeSelections()
		},
		/**
		 * 
		 * @param {String} endpoint 
		 * @param {String} method 
		 * @param {Object} data 
		 */
		_callAjax: function (endpoint, method, data) {
			return new Promise((resolve, reject) => {
				$.ajax({
					url: endpoint,
					method: method,
					dataType: "json",
					data: JSON.stringify(data),
					contentType: 'application/json',
					success: (data) => {
						resolve(data);
					}
				});
			});
		}
	});
});