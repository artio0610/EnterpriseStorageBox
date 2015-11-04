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
// require("js/esb/window/Execute.js")

/**
 * @class ESB.module.admin.storage.smart.schedule.Job
 * @derived ESB.workspace.window.Form
 */
Ext.define("ESB.module.admin.storage.smart.schedule.Job", {
	extend: "ESB.workspace.window.Form",
	requires: [
		"ESB.Rpc",
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.workspace.window.plugin.ConfigObject"
	],

	rpcService: "Smart",
	rpcGetMethod: "getScheduledTest",
	rpcSetMethod: "setScheduledTest",
	plugins: [{
		ptype: "configobject"
	}],

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
			}
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
			name: "devicefile",
			fieldLabel: _("Device"),
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			store: Ext.create("ESB.data.Store", {
				autoLoad: true,
				model: ESB.data.Model.createImplicit({
					idProperty: "devicefilebyid",
					fields: [
						{ name: "devicefilebyid", type: "string" },
						{ name: "description", type: "string" }
					]
				}),
				proxy: {
					type: "rpc",
					appendSortParams: false,
					rpcData: {
						service: "Smart",
						method: "enumerateMonitoredDevices"
					}
				},
				sorters: [{
					direction: "ASC",
					property: "description"
				}]
			}),
			emptyText: _("Select a device ..."),
			valueField: "devicefilebyid",
			displayField: "description",
			plugins: [{
				ptype: "fieldinfo",
				text: _("S.M.A.R.T. monitoring must be activated for the selected device.")
			}],
			validator: function(value) {
				if (!Ext.isEmpty(value) && !this.findRecordByDisplay(value))
					return _("The device does not exist");
				return true;
			}
		},{
			xtype: "combo",
			name: "type",
			fieldLabel: _("Type"),
			queryMode: "local",
			store: Ext.create("Ext.data.ArrayStore", {
				fields: [ "value", "text" ],
				data: [
					[ "S", _("Short self-test") ],
					[ "L", _("Long self-test") ],
					[ "C", _("Conveyance self-test") ],
					[ "O", _("Offline immediate test") ]
				]
			}),
			displayField: "text",
			valueField: "value",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			value: "S"
		},{
			xtype: "combo",
			name: "hour",
			fieldLabel: _("Hour"),
			queryMode: "local",
			store: Ext.create("Ext.data.ArrayStore", {
				fields: [ "value", "text" ],
				data: Date.mapHour2Digits
			}),
			displayField: "text",
			valueField: "value",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			value: Ext.Date.format(new Date(), "H")
		},{
			xtype: "combo",
			name: "dayofmonth",
			fieldLabel: _("Day of month"),
			queryMode: "local",
			store: Ext.create("Ext.data.ArrayStore", {
				fields: [ "value", "text" ],
				data: Date.mapDayOfMonth2Digits
			}),
			displayField: "text",
			valueField: "value",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			value: "*"
		},{
			xtype: "combo",
			name: "month",
			fieldLabel: _("Month"),
			queryMode: "local",
			store: Ext.create("Ext.data.ArrayStore", {
				fields: [ "value", "text" ],
				data: Date.mapMonth2Digits
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
			xtype: "textarea",
			name: "comment",
			fieldLabel: _("Comment"),
			allowBlank: true,
			flex: 1
		}];
	}
});

/**
 * @class ESB.module.admin.storage.smart.schedule.Jobs
 * @derived ESB.workspace.grid.Panel
 */
Ext.define("ESB.module.admin.storage.smart.schedule.Jobs", {
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
		"Ext.XTemplate",
		"ESB.module.admin.storage.smart.schedule.Job"
	],

	hidePagingToolbar: false,
	stateful: true,
	stateId: "ca86feba-53c1-42b4-8eea-5119f0244fb5",
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
		text: _("Device"),
		stateId: "device",
		sortable: true,
		renderer: function(value, metaData, record) {
			var tpl = Ext.create("Ext.XTemplate",
			  _("Model"),': {volumemodel}<br/>',
			  _("Device"),': {volumedevicefile}<br/>',
			  _("Capacity"),': {[ESB.util.Format.binaryUnit(values.volumesize)]}');
			return tpl.apply(record.data);
		}
	},{
		xtype: "mapcolumn",
		text: _("Type"),
		sortable: true,
		dataIndex: "type",
		stateId: "type",
		mapItems: {
			"S": _("Short self-test"),
			"L": _("Long self-test"),
			"C": _("Conveyance self-test"),
			"O": _("Offline immediate test")
		}
	},{
		text: _("Hour"),
		sortable: true,
		dataIndex: "hour",
		stateId: "hour"
	},{
		text: _("Day of month"),
		sortable: true,
		dataIndex: "dayofmonth",
		stateId: "dayofmonth",
		renderer: ESB.util.Format.arrayRenderer(Date.mapDayOfMonth2Digits)
	},{
		text: _("Month"),
		sortable: true,
		dataIndex: "month",
		stateId: "month",
		renderer: ESB.util.Format.arrayRenderer(Date.mapMonth2Digits)
	},{
		text: _("Day of week"),
		sortable: true,
		dataIndex: "dayofweek",
		stateId: "dayofweek",
		renderer: ESB.util.Format.arrayRenderer(Date.mapDayOfWeek)
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
						{ name: "volumedevicefile", mapping: "volume.devicefile", type: "string" },
						{ name: "volumemodel", mapping: "volume.model", type: "string" },
						{ name: "volumesize", mapping: "volume.size", type: "string" },
						{ name: "type", type: "string" },
						{ name: "hour", type: "string" },
						{ name: "dayofmonth", type: "string" },
						{ name: "month", type: "string" },
						{ name: "dayofweek", type: "string" },
						{ name: "comment", type: "string" }
					]
				}),
				proxy: {
					type: "rpc",
					rpcData: {
						service: "Smart",
						method: "getScheduleList"
					}
				},
				remoteSort: true,
				sorters: [{
					direction: "ASC",
					property: "volumedevicefile"
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
		Ext.create("ESB.module.admin.storage.smart.schedule.Job", {
			title: _("Add scheduled test"),
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
		Ext.create("ESB.module.admin.storage.smart.schedule.Job", {
			title: _("Edit scheduled test"),
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
				service: "Smart",
				method: "deleteScheduledTest",
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
			title: _("Execute scheduled test"),
			rpcService: "Smart",
			rpcMethod: "executeScheduledTest",
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

ESB.WorkspaceManager.registerPanel({
	id: "scheduledjobs",
	path: "/storage/smart",
	text: _("Scheduled tests"),
	position: 30,
	className: "ESB.module.admin.storage.smart.schedule.Jobs"
});
