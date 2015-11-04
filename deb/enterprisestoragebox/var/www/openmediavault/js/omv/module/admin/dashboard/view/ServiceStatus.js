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

/**
 * @class ESB.module.admin.dashboard.view.ServiceStatus
 * @derived ESB.workspace.dashboard.View
 */
Ext.define("ESB.module.admin.dashboard.view.ServiceStatus", {
	extend: "ESB.workspace.dashboard.View",
	alias: "widget.module.admin.dashboard.view.servicestatus",
	requires: [
		"ESB.workspace.grid.Panel",
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc"
	],

	height: 200,
	refreshInterval: 10000,

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			items: [ me.gp = Ext.create("ESB.workspace.grid.Panel", {
				disableLoadMaskOnLoad: true,
				hideTopToolbar: true,
				hidePagingToolbar: true,
				disableSelection: true,
				stateful: true,
				stateId: "08ee3b76-e325-11e3-ad0a-00221568ca88",
				columns: [{
					text: _("Service"),
					sortable: true,
					dataIndex: "title",
					stateId: "title",
					flex: 1
				},{
					xtype: "booleaniconcolumn",
					text: _("Enabled"),
					sortable: true,
					dataIndex: "enabled",
					stateId: "enabled",
					width: 80,
					resizable: false,
					align: "center",
					iconCls:  Ext.baseCSSPrefix + "grid-cell-booleaniconcolumn-switch"
				},{
					text: _("Running"),
					sortable: true,
					dataIndex: "running",
					stateId: "running",
					width: 80,
					resizable: false,
					align: "center",
					renderer: function(value, metaData, record) {
						var iconCls;
						switch (record.get("enabled")) {
						case 1:
						case true: // Service enabled
							iconCls = (true == value) ?
							  "grid-cell-booleaniconcolumn-led-blue" :
							  "grid-cell-booleaniconcolumn-led-red";
							break;
						default: // Service disabled
							iconCls = (true == value) ?
							  "grid-cell-booleaniconcolumn-led-blue" :
							  "grid-cell-booleaniconcolumn-led-gray";
							break;
						}
						metaData.tdCls = Ext.baseCSSPrefix +
						  "grid-cell-booleaniconcolumn" + " " +
						  Ext.baseCSSPrefix + iconCls;
						return "";
					}
				}],
				viewConfig: {
					trackOver: false
				},
				store: Ext.create("ESB.data.Store", {
					autoLoad: true,
					model: ESB.data.Model.createImplicit({
						idProperty: "name",
						fields: [
							{ name: "name", type: "string" },
							{ name: "title", type: "string" },
							{ name: "enabled", type: "boolean" },
							{ name: "running", type: "boolean" }
						]
					}),
					proxy: {
						type: "rpc",
						appendSortParams: false,
						rpcData: {
							service: "Services",
							method: "getStatus",
							options: {
								updatelastaccess: false
							}
						}
					},
					sorters: [{
						direction: "ASC",
						property: "name"
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
