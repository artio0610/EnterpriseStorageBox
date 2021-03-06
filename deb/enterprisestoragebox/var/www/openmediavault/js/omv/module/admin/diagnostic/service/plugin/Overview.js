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
// require("js/esb/data/Store.js")
// require("js/esb/data/Model.js")
// require("js/esb/data/proxy/Rpc.js")
// require("js/esb/workspace/grid/Panel.js")

/**
 * @class ESB.module.admin.diagnostic.service.plugin.Overview
 * @derived ESB.workspace.grid.Panel
 * Display statistics from various services, e.g. SSH, FTP or SMB/CIFS.
 */
Ext.define("ESB.module.admin.diagnostic.service.plugin.Overview", {
	extend: "ESB.workspace.grid.Panel",
	alias: "esb.plugin.diagnostic.service.overview",
	requires: [
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc"
	],

	title: _("Overview"),
	position: 10,

	constructor: function(config) {
		var me = this;
		config = Ext.apply({
			hideAddButton: true,
			hideEditButton: true,
			hideDeleteButton: true,
			hideRefreshButton: false,
			hidePagingToolbar: true,
			disableSelection: true,
			stateful: true,
			stateId: "976130ef-a647-40e8-9b08-02ced906680a",
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
			}]
		}, config || {});
		me.callParent([ config ]);
	},

	initComponent: function() {
		var me = this;
		me.store = Ext.create("ESB.data.Store", {
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
					method: "getStatus"
				}
			},
			sorters: [{
				direction: "ASC",
				property: "name"
			}]
		});
		me.callParent(arguments);
	}
});
