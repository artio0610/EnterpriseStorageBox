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
// require("js/esb/data/Store.js")
// require("js/esb/data/Model.js")
// require("js/esb/data/proxy/Rpc.js")
// require("js/esb/workspace/grid/Panel.js")
// require("js/esb/util/Format.js")

/**
 * @class ESB.module.admin.diagnostic.system.Overview
 * @derived ESB.workspace.grid.Panel
 */
Ext.define("ESB.module.admin.diagnostic.system.Overview", {
	extend: "ESB.workspace.grid.Panel",
	requires: [
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.util.Format"
	],

	disableLoadMaskOnLoad: true,
	autoReload: true,
	reloadInterval: 5000,
	hideTopToolbar: true,
	hidePagingToolbar: true,
	hideHeaders: true,
	disableSelection: true,
	columns: [{
		dataIndex: "name",
		stateId: "name",
		width: 150,
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

	initComponent: function() {
		var me = this;
		me.store = Ext.create("ESB.data.Store", {
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
		});
		me.callParent(arguments);
	}
});

ESB.WorkspaceManager.registerPanel({
	id: "overview",
	path: "/diagnostic/system",
	text: _("Overview"),
	position: 10,
	className: "ESB.module.admin.diagnostic.system.Overview"
});
