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
// require("js/esb/Rpc.js")
// require("js/esb/workspace/tab/Panel.js")

/**
 * @class ESB.module.admin.diagnostic.system.plugin.NetworkInterfaces
 * @derived ESB.workspace.tab.Panel
 */
Ext.define("ESB.module.admin.diagnostic.system.plugin.NetworkInterfaces", {
	extend: "ESB.workspace.tab.Panel",
	alias: "esb.plugin.diagnostic.system.networkinterfaces",
	requires: [
		"ESB.Rpc"
	],

	title: _("Network interfaces"),

	initComponent: function() {
		var me = this;
		me.items = [];
		me.callParent(arguments);
		// Execute RPC to get the information required to add tab panels.
		ESB.Rpc.request({
			callback: function(id, success, response) {
				// Sort the list of network interfaces by name.
				var items = new Ext.util.MixedCollection();
				items.addAll(response);
				items.sort([{
					property: "devicename",
					direction: "ASC"
				}]);
				// Create a RRD graph panel per network interface.
				items.each(function(item) {
					me.add(Ext.create("ESB.workspace.panel.RrdGraph", {
						title: item.devicename,
						rrdGraphName: "interface-" + item.devicename
					}));
				});
			},
			relayErrors: false,
			rpcData: {
				service: "Network",
				method: "enumerateConfiguredDevices"
			}
		});
	}
});
