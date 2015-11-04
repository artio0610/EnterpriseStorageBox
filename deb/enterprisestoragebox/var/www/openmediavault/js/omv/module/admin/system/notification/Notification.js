/**
 * This file is part of EnterpriSestorageBox.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author   Artur Osinski-Stachowicz <artio0610@gmail.com>
 * @copyright Copyright (c) 2009-2015 Artur Osinski-Stachowicz
 *
 * EnterpriSestorageBox is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * EnterpriSestorageBox is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EnterpriSestorageBox. If not, see <http://www.gnu.org/licenses/>.
 */
// require("js/esb/WorkspaceManager.js")
// require("js/esb/Rpc.js")
// require("js/esb/data/Store.js")
// require("js/esb/data/Model.js")
// require("js/esb/data/proxy/Rpc.js")
// require("js/esb/window/MessageBox.js")
// require("js/esb/workspace/form/Panel.js")
// require("js/esb/workspace/grid/Panel.js")
// require("js/esb/form/field/Password.js")
// require("js/esb/util/Format.js")

/**
 * @class ESB.module.admin.system.notification.Settings
 * @derived ESB.workspace.form.Panel
 */
Ext.define("ESB.module.admin.system.notification.Settings", {
	extend: "ESB.workspace.form.Panel",
	requires: [
		"ESB.Rpc",
		"ESB.window.MessageBox",
		"ESB.form.field.Password"
	],

	rpcService: "EmailNotification",
	plugins: [{
		ptype: "linkedfields",
		correlations: [{
			name: [
				"server",
				"port",
				"sender",
				"primaryemail"
			],
			conditions: [
				{ name: "enable", value: true }
			],
			properties: "!allowBlank"
		},{
			name: [
				"username",
				"password"
			],
			conditions: [
				{ name: "authenable", value: true }
			],
			properties: [
				"!readOnly"
			]
		},{
			name: [
				"username",
				"password"
			],
			conditions: [
				{ name: "enable", value: true },
				{ name: "authenable", value: true }
			],
			properties: [
				"!allowBlank"
			]
		}]
	}],

	initComponent: function() {
		var me = this;
		me.callParent(arguments);
		me.on("load", function(c, values) {
			// Update the 'Send a test email' button.
			this.setButtonDisabled("test", !values.enable);
		}, me);
	},

	getButtonItems: function() {
		var me = this;
		var items = me.callParent(arguments);
		// Add 'Send test email' button.
		items.push({
			id: me.getId() + "-test",
			xtype: "button",
			text: _("Send a test email"),
			icon: "images/mail.png",
			iconCls: Ext.baseCSSPrefix + "btn-icon-16x16",
			disabled: true,
			scope: me,
			handler: function() {
				// Is the form valid?
				if(!this.isValid()) {
					this.markInvalid();
				} else {
					// Display waiting dialog
					ESB.MessageBox.wait(null, _("Sending test email ..."));
					// Execute RPC
					ESB.Rpc.request({
						scope: this,
						callback: function(id, success, response) {
							ESB.MessageBox.updateProgress(1);
							ESB.MessageBox.hide();
							if(success) {
								ESB.MessageBox.success(null, _("The test email has been sent successfully. Please check your mailbox."));
							} else {
								ESB.MessageBox.error(null, response);
							}
						},
						relayErrors: true,
						rpcData: {
							service: this.rpcService,
							method: "sendTestEmail"
						}
					});
				}
			}
		});
		return items;
	},

	getFormItems: function() {
		var me = this;
		return [{
			xtype: "fieldset",
			title: _("General settings"),
			fieldDefaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "checkbox",
				name: "enable",
				fieldLabel: _("Enable"),
				checked: false
			}]
		},{
			xtype: "fieldset",
			title: _("SMTP settings"),
			fieldDefaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "textfield",
				name: "server",
				fieldLabel: _("SMTP server"),
				allowBlank: true,
				vtype: "domainnameIP",
				plugins: [{
					ptype: "fieldinfo",
					text: _("Outgoing SMTP mail server address, e.g. smtp.mycorp.com.")
				}]
			},{
				xtype: "numberfield",
				name: "port",
				fieldLabel: _("SMTP port"),
				allowBlank: true,
				allowDecimals: false,
				minValue: 1,
				vtype: "port",
				value: 25,
				plugins: [{
					ptype: "fieldinfo",
					text: _("The default SMTP mail server port, e.g. 25 or 587.")
				}]
			},{
				xtype: "checkbox",
				name: "tls",
				fieldLabel: _("Use SSL/TLS secure connection"),
				checked: false
			},{
				xtype: "textfield",
				name: "sender",
				fieldLabel: _("Sender email"),
				allowBlank: true,
				vtype: "email"
			},{
				xtype: "checkbox",
				name: "authenable",
				fieldLabel: _("Authentication required"),
				checked: false
			},{
				xtype: "textfield",
				name: "username",
				fieldLabel: _("Username"),
				allowBlank: true
			},{
				xtype: "passwordfield",
				name: "password",
				fieldLabel: _("Password"),
				allowBlank: true
			}]
		},{
			xtype: "fieldset",
			title: _("Recipient"),
			fieldDefaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "textfield",
				name: "primaryemail",
				fieldLabel: _("Primary email"),
				allowBlank: true,
				vtype: "email"
			},{
				xtype: "textfield",
				name: "secondaryemail",
				fieldLabel: _("Secondary email"),
				allowBlank: true,
				vtype: "email"
			}]
		}];
	}
});

/**
 * @class ESB.module.admin.system.notification.Notifications
 * @derived ESB.workspace.grid.Panel
 */
Ext.define("ESB.module.admin.system.notification.Notifications", {
	extend: "ESB.workspace.grid.Panel",
	requires: [
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.util.Format"
	],

	stateful: true,
	stateId: "e03bdc0e-4f66-11e2-8510-00221568ca88",
	bodyCls: "x-grid-without-dirty-cell",
	features: [{
		ftype: "grouping",
		groupHeaderTpl: "{name}"
	}],
	columns: [{
		text: _("Type"),
		sortable: true,
		groupable: true,
		hidden: true,
		dataIndex: "type",
		stateId: "type",
		align: "center",
		renderer: function(value, metaData, record, rowIndex, colIndex,
		  store, view) {
			return _(value);
		}
	},{
		text: _("Notification"),
		sortable: true,
		groupable: false,
		dataIndex: "title",
		stateId: "title",
		flex: 1,
		renderer: function(value, metaData, record, rowIndex, colIndex,
		  store, view) {
			return _(value);
		}
	},{
		xtype: "checkcolumn",
		text: _("Enable"),
		groupable: false,
		dataIndex: "enable",
		stateId: "enable",
		align: "center",
		width: 100,
		resizable: false
	}],
	hideAddButton: true,
	hideEditButton: true,
	hideDeleteButton: true,
	hideApplyButton: false,
	hideRefreshButton: false,

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			store: Ext.create("ESB.data.Store", {
				autoLoad: true,
				groupField: "type",
				model: ESB.data.Model.createImplicit({
					idProperty: "id",
					fields: [
						{ name: "id", type: "string" },
						{ name: "type", type: "string" },
						{ name: "title", type: "string" },
						{ name: "enable", type: "boolean" }
					]
				}),
				proxy: {
					type: "rpc",
					appendSortParams: false,
					rpcData: {
						service: "Notification",
						method: "get"
					}
				},
				sorters: [{
					direction: "ASC",
					property: "title"
				}]
			})
		});
		me.callParent(arguments);
	},

	onApplyButton: function() {
		var me = this;
		var records = me.store.getRange();
		var params = [];
		Ext.Array.each(records, function(record) {
			params.push({
				  "id": record.get("id"),
				  "enable": record.get("enable")
			  });
		});
		// Execute RPC.
		ESB.Rpc.request({
			  scope: me,
			  callback: function(id, success, response) {
				  this.store.reload();
			  },
			  relayErrors: false,
			  rpcData: {
				  service: "Notification",
				  method: "set",
				  params: params
			  }
		  });
	}
});

ESB.WorkspaceManager.registerNode({
	id: "notification",
	path: "/system",
	text: _("Notification"),
	icon16: "images/mail.png",
	iconSvg: "images/mail.svg",
	position: 40
});

ESB.WorkspaceManager.registerPanel({
	id: "settings",
	path: "/system/notification",
	text: _("Settings"),
	position: 10,
	className: "ESB.module.admin.system.notification.Settings"
});

ESB.WorkspaceManager.registerPanel({
	id: "notifications",
	path: "/system/notification",
	text: _("Notifications"),
	position: 20,
	className: "ESB.module.admin.system.notification.Notifications"
});
