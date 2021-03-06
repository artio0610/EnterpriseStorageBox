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
 * @class ESB.module.admin.dashboard.view.SysInfo
 * @derived ESB.workspace.dashboard.View
 */
Ext.define("ESB.module.admin.dashboard.view.SysInfo", {
	extend: "ESB.workspace.dashboard.View",
	alias: "widget.module.admin.dashboard.view.sysinfo",
	requires: [
		"ESB.workspace.grid.Panel",
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.util.Format"
	],

	height: 200,
	refreshInterval: 5000,

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			items: [ me.gp = Ext.create("ESB.workspace.grid.Panel", {
				disableLoadMaskOnLoad: true,
				hideTopToolbar: true,
				hidePagingToolbar: true,
				hideHeaders: true,
				disableSelection: true,
				columns: [{
					dataIndex: "name",
					stateId: "name",
					width: 150,
					tdCls: Ext.baseCSSPrefix + "grid-cell-gray",
					renderer: function(value, metaData, record) {
						return _(value);
					}
				},{
					dataIndex: "value",
					stateId: "value",
					flex: 1,
					renderer: function(value, metaData, record) {
						var me = this;
						var result = value;
						switch (record.get("type")) {
						case "time":
							var renderer = ESB.util.Format.localeTimeRenderer();
							result = renderer.apply(me, arguments);
							break;
						case "progress":
							var renderer = ESB.util.Format.progressBarRenderer(
							  value.value / 100, value.text);
							result = renderer.apply(me, arguments);
							break;
						default:
							// Nothing to do here
							break;
						}
						return result;
					}
				}],
				viewConfig: {
					trackOver: false
				},
				store: Ext.create("ESB.data.Store", {
					autoLoad: true,
					model: ESB.data.Model.createImplicit({
						idProperty: "index",
						fields: [
							{ name: "index", type: "int" },
							{ name: "type", type: "string" },
							{ name: "name", type: "string" },
							{ name: "value", type: "auto" }
						]
					}),
					proxy: {
						type: "rpc",
						appendSortParams: false,
						rpcData: {
							service: "System",
							method: "getInformation",
							options: {
								updatelastaccess: false
							}
						}
					},
					sorters: [{
						direction: "ASC",
						property: "index"
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
