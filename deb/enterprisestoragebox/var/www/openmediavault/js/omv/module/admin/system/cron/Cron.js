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
// require("js/esb/workspace/grid/Panel.js")
// require("js/esb/workspace/window/Form.js")
// require("js/esb/workspace/window/plugin/ConfigObject.js")
// require("js/esb/util/Format.js")
// require("js/esb/Rpc.js")
// require("js/esb/data/Store.js")
// require("js/esb/data/Model.js")
// require("js/esb/data/proxy/Rpc.js")
// require("js/esb/form/field/UserComboBox.js")
// require("js/esb/window/Execute.js")

/**
 * @class ESB.module.admin.system.cron.Job
 * @derived ESB.workspace.window.Form
 */
Ext.define("ESB.module.admin.system.cron.Job", {
	extend: "ESB.workspace.window.Form",
	requires: [
		"ESB.form.field.UserComboBox",
		"ESB.workspace.window.plugin.ConfigObject"
	],

	rpcService: "Cron",
	rpcGetMethod: "get",
	rpcSetMethod: "set",
	plugins: [{
		ptype: "configobject"
	}],
	height: 450,

	/**
	 * The class constructor.
	 * @fn constructor
	 * @param uuid The UUID of the database/configuration object. Required.
	 */

	getFormConfig: function() {
		return {
			layout: {
				type: "vbox",
				align: "stretch"
			},
			plugins: [{
				ptype: "linkedfields",
				correlations: [{
					name: [
						"minutecf",
						"hourcf",
						"dayofmonthcf",
						"month",
						"dayofweek"
					],
					conditions: [{
						name: "execution",
						value: "exactly"
					}],
					properties: [
						"show"
					]
				}]
			}]
		};
	},

	getFormItems: function() {
		return [{
			xtype: "checkbox",
			name: "enable",
			fieldLabel: _("Enable"),
			checked: true
		},{
			xtype: "combo",
			name: "execution",
			fieldLabel: _("Time of execution"),
			queryMode: "local",
			store: [
				[ "exactly", _("Certain date") ],
				[ "hourly", _("Hourly") ],
				[ "daily", _("Daily") ],
				[ "weekly", _("Weekly") ],
				[ "monthly", _("Monthly") ],
				[ "yearly", _("Yearly") ],
				[ "reboot", _("At reboot") ]
			],
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			value: "exactly"
		},{
			xtype: "compositefield",
			id: "minutecf",
			fieldLabel: _("Minute"),
			combineErrors: false,
			items: [{
				xtype: "combo",
				name: "minute",
				queryMode: "local",
				store: Ext.Array.insert(Ext.Array.range(0, 59, 1, true),
				  0, [ "*" ]),
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				value: String(new Date().getMinutes()),
				flex: 1
			},{
				xtype: "checkbox",
				name: "everynminute",
				fieldLabel: "",
				checked: false,
				boxLabel: _("Every N minute"),
				width: 140
			}]
		},{
			xtype: "compositefield",
			id: "hourcf",
			fieldLabel: _("Hour"),
			combineErrors: false,
			items: [{
				xtype: "combo",
				name: "hour",
				queryMode: "local",
				store: Ext.create("Ext.data.ArrayStore", {
					fields: [ "value", "text" ],
					data: Date.mapHour
				}),
				displayField: "text",
				valueField: "value",
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				value: String(new Date().getHours()),
				flex: 1
			},{
				xtype: "checkbox",
				name: "everynhour",
				fieldLabel: "",
				checked: false,
				boxLabel: _("Every N hour"),
				width: 140
			}]
		},{
			xtype: "compositefield",
			id: "dayofmonthcf",
			fieldLabel: _("Day of month"),
			combineErrors: false,
			items: [{
				xtype: "combo",
				name: "dayofmonth",
				queryMode: "local",
				store: Ext.create("Ext.data.ArrayStore", {
					fields: [ "value", "text" ],
					data: Date.mapDayOfMonth
				}),
				displayField: "text",
				valueField: "value",
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				value: "*",
				flex: 1
			},{
				xtype: "checkbox",
				name: "everyndayofmonth",
				fieldLabel: "",
				checked: false,
				boxLabel: _("Every N day of month"),
				width: 140
			}]
		},{
			xtype: "combo",
			name: "month",
			fieldLabel: _("Month"),
			queryMode: "local",
			store: Ext.create("Ext.data.ArrayStore", {
				fields: [ "value", "text" ],
				data: Date.mapMonth
			}),
			displayField: "text",
			valueField: "value",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			value: "*"
		},{
			xtype: "combo",
			name: "dayofweek",
			fieldLabel: _("Day of week"),
			queryMode: "local",
			store: Ext.create("Ext.data.ArrayStore", {
				fields: [ "value", "text" ],
				data: Date.mapDayOfWeek
			}),
			displayField: "text",
			valueField: "value",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			value: "*"
		},{
			xtype: "usercombo",
			name: "username",
			fieldLabel: _("User"),
			value: "root"
		},{
			xtype: "textfield",
			name: "command",
			fieldLabel: _("Command"),
			allowBlank: false
		},{
			xtype: "checkbox",
			name: "sendemail",
			fieldLabel: _("Send email"),
			checked: false,
			boxLabel: _("Send command output via email"),
			plugins: [{
				ptype: "fieldinfo",
				text: _("An email message with the command output (if any produced) is send to the user who performs the job.")
			}]
		},{
			xtype: "textarea",
			name: "comment",
			fieldLabel: _("Comment"),
			allowBlank: true,
			vtype: "comment",
			flex: 1
		},{
			xtype: "hidden",
			name: "type",
			value: "userdefined"
		}];
	},

	isValid: function() {
		var me = this;
		if(!me.callParent(arguments))
			return false;
		var valid = true;
		// It is not allowed to select '*' if the everyxxx checkbox
		// is checked.
		Ext.Array.each([ "minute", "hour", "dayofmonth" ], function(name) {
			var field = me.findField(name);
			field.clearInvalid(); // combineErrors is false
			if((field.getValue() === "*") && (me.findField(
			  "everyn" + name).checked)) {
				field.markInvalid(_("Ranges of numbers are not allowed"));
				valid = false;
			}
		});
		return valid;
	}
});

/**
 * @class ESB.module.admin.system.cron.Jobs
 * @derived ESB.workspace.grid.Panel
 */
Ext.define("ESB.module.admin.system.cron.Jobs", {
	extend: "ESB.workspace.grid.Panel",
	requires: [
		"ESB.Rpc",
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.util.Format",
		"ESB.window.Execute"
	],
	uses: [
		"ESB.module.admin.system.cron.Job"
	],

	hidePagingToolbar: false,
	stateful: true,
	stateId: "a882a76d-6804-4632-b31b-8b48c0ea6dde",
	columns: [{
		xtype: "booleaniconcolumn",
		text: _("Enabled"),
		sortable: true,
		dataIndex: "enable",
		stateId: "enable",
		align: "center",
		width: 80,
		resizable: false,
		iconCls:  Ext.baseCSSPrefix + "grid-cell-booleaniconcolumn-switch"
	},{
		xtype: "cronscheduling",
		text: _("Scheduling"),
		sortable: true,
		stateId: "scheduling"
	},{
		text: _("User"),
		sortable: true,
		dataIndex: "username",
		stateId: "username"
	},{
		text: _("Command"),
		sortable: true,
		dataIndex: "command",
		stateId: "command"
	},{
		text: _("Comment"),
		sortable: true,
		dataIndex: "comment",
		stateId: "comment"
	}],

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			store: Ext.create("ESB.data.Store", {
				autoLoad: true,
				model: ESB.data.Model.createImplicit({
					idProperty: "uuid",
					fields: [
						{ name: "uuid", type: "string" },
						{ name: "enable", type: "boolean" },
						{ name: "execution", type: "string" },
						{ name: "type", type: "string" },
						{ name: "minute", type: "string" },
						{ name: "everynminute", type: "boolean" },
						{ name: "hour", type: "string" },
						{ name: "everynhour", type: "boolean" },
						{ name: "dayofmonth", type: "string" },
						{ name: "everyndayofmonth", type: "boolean" },
						{ name: "month", type: "string" },
						{ name: "dayofweek", type: "string" },
						{ name: "username", type: "string" },
						{ name: "command", type: "string" },
						{ name: "sendemail", type: "boolean" },
						{ name: "comment", type: "string" }
					]
				}),
				proxy: {
					type: "rpc",
					rpcData: {
						service: "Cron",
						method: "getList"
					},
					extraParams: {
						type: [ "userdefined" ]
					}
				},
				remoteSort: true,
				sorters: [{
					direction: "ASC",
					property: "enable"
				}]
			})
		});
		me.callParent(arguments);
	},

	getTopToolbarItems: function() {
		var me = this;
		var items = me.callParent(arguments);
		// Add 'Run' button to top toolbar.
		Ext.Array.insert(items, 2, [{
			id: me.getId() + "-run",
			xtype: "button",
			text: _("Run"),
			icon: "images/play.png",
			iconCls: Ext.baseCSSPrefix + "btn-icon-16x16",
			handler: Ext.Function.bind(me.onRunButton, me, [ me ]),
			scope: me,
			disabled: true,
			selectionConfig: {
				minSelections: 1,
				maxSelections: 1
			}
		}]);
		return items;
	},

	onAddButton: function() {
		var me = this;
		Ext.create("ESB.module.admin.system.cron.Job", {
			title: _("Add scheduled job"),
			uuid: ESB.UUID_UNDEFINED,
			listeners: {
				scope: me,
				submit: function() {
					this.doReload();
				}
			}
		}).show();
	},

	onEditButton: function() {
		var me = this;
		var record = me.getSelected();
		Ext.create("ESB.module.admin.system.cron.Job", {
			title: _("Edit scheduled job"),
			uuid: record.get("uuid"),
			listeners: {
				scope: me,
				submit: function() {
					this.doReload();
				}
			}
		}).show();
	},

	doDeletion: function(record) {
		var me = this;
		ESB.Rpc.request({
			scope: me,
			callback: me.onDeletion,
			rpcData: {
				service: "Cron",
				method: "delete",
				params: {
					uuid: record.get("uuid")
				}
			}
		});
	},

	onRunButton: function() {
		var me = this;
		var record = me.getSelected();
		Ext.create("ESB.window.Execute", {
			title: _("Execute cron job"),
			rpcService: "Cron",
			rpcMethod: "execute",
			rpcParams: {
				uuid: record.get("uuid")
			},
			listeners: {
				scope: me,
				exception: function(wnd, error) {
					ESB.MessageBox.error(null, error);
				}
			}
		}).show();
	}
});

ESB.WorkspaceManager.registerNode({
	id: "cron",
	path: "/system",
	text: _("Scheduled Jobs"),
	icon16: "images/alarm.png",
	iconSvg: "images/alarm.svg",
	position: 70
});

ESB.WorkspaceManager.registerPanel({
	id: "scheduledjobs",
	path: "/system/cron",
	text: _("Scheduled Jobs"),
	position: 10,
	className: "ESB.module.admin.system.cron.Jobs"
});
