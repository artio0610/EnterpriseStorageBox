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
// require("js/esb/workspace/dashboard/View.js")
// require("js/esb/data/Store.js")
// require("js/esb/data/Model.js")
// require("js/esb/data/proxy/Rpc.js")
// require("js/esb/workspace/grid/Panel.js")
// require("js/esb/util/Format.js")

/**
 * @class ESB.module.admin.dashboard.view.FileSystemStatus
 * @derived ESB.workspace.dashboard.View
 */
Ext.define("ESB.module.admin.dashboard.view.FileSystemStatus", {
	extend: "ESB.workspace.dashboard.View",
	alias: "widget.module.admin.dashboard.view.filesystemstatus",
	requires: [
		"ESB.workspace.grid.Panel",
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.util.Format"
	],

	height: 150,
	refreshInterval: 60000,

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			items: [ me.gp = Ext.create("ESB.workspace.grid.Panel", {
				disableLoadMaskOnLoad: true,
				hideTopToolbar: true,
				hidePagingToolbar: true,
				disableSelection: true,
				stateful: true,
				stateId: "778ea266-eaf3-11e3-8211-0002b3a176b4",
				columns: [{
					xtype: "emptycolumn",
					text: _("Device/Label"),
					sortable: true,
					dataIndex: "devicefile",
					stateId: "devicelabel",
					flex: 1,
					renderer: function(value, metaData, record) {
						if (!Ext.isEmpty(record.get("label")))
							return record.get("label");
						return value;
					}
				},{
					xtype: "emptycolumn",
					text: _("Device"),
					sortable: true,
					dataIndex: "devicefile",
					stateId: "devicefile",
					hidden: true,
					flex: 1
				},{
					text: _("Label"),
					sortable: true,
					dataIndex: "label",
					stateId: "label",
					hidden: true,
					flex: 1
				},{
					xtype: "binaryunitcolumn",
					text: _("Total"),
					sortable: true,
					dataIndex: "size",
					stateId: "size",
					flex: 1
				},{
					xtype: "binaryunitcolumn",
					text: _("Available"),
					sortable: true,
					dataIndex: "available",
					stateId: "available",
					flex: 1
				},{
					text: _("Used"),
					sortable: true,
					dataIndex: "used",
					stateId: "used",
					align: "center",
					flex: 2,
					renderer: function(value, metaData, record) {
						var percentage = parseInt(record.get("percentage"));
						if (-1 == percentage)
							return _("n/a");
						var text = Ext.String.format("{0}% [{1}]",
						  percentage, value);
						var renderer = ESB.util.Format.progressBarRenderer(
						  percentage / 100, text);
						return renderer.apply(this, arguments);
					}
				}],
				viewConfig: {
					trackOver: false
				},
				store: Ext.create("ESB.data.Store", {
					autoLoad: true,
					model: ESB.data.Model.createImplicit({
						idProperty: "devicefile",
						fields: [
							{ name: "devicefile", type: "string" },
							{ name: "label", type: "string" },
							{ name: "size", type: "string" },
							{ name: "available", type: "string" },
							{ name: "used", type: "string" },
							{ name: "percentage", type: "string" }
						]
					}),
					proxy: {
						type: "rpc",
						appendSortParams: false,
						rpcData: {
							service: "FileSystemMgmt",
							method: "enumerateFilesystems",
							options: {
								updatelastaccess: false
							}
						}
					},
					sorters: [{
						direction: "ASC",
						property: "devicefile"
					}]
				})
			}) ]
		});
		me.callParent(arguments);
	},

	doRefresh: function() {
		var me = this;
		me.gp.doReload();
	}
});
