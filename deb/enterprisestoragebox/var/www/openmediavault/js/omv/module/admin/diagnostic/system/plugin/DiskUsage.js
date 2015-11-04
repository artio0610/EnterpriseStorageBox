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
 * @class ESB.module.admin.diagnostic.system.plugin.DiskUsage
 * @derived ESB.workspace.tab.Panel
 */
Ext.define("ESB.module.admin.diagnostic.system.plugin.DiskUsage", {
	extend: "ESB.workspace.tab.Panel",
	alias: "esb.plugin.diagnostic.system.diskusage",
	requires: [
		"ESB.Rpc"
	],

	title: _("Disk usage"),

	initComponent: function() {
		var me = this;
		me.items = [];
		me.callParent(arguments);
		// Execute RPC to get the information required to add tab panels.
		ESB.Rpc.request({
			callback: function(id, success, response) {
				// The function used to create the tab configuration.
				var fnBuildRrdGraphConfig = function(item) {
					var config = {
						title: item.title,
						rrdGraphName: "df-" + item.mountpoint.substr(1).
						  replace(/\//g, "-")
					};
					if ("/dev/root" === item.devicefile) {
						Ext.apply(config, {
							rrdGraphName: "df-root"
						});
					}
					return config;
				}
				// Sort the list of filesystems by devicefile or label.
				var items = new Ext.util.MixedCollection();
				items.addAll(response);
				items.each(function(item) {
					item.title = item.label || item.devicefile;
					if ("/dev/root" === item.devicefile)
						item.title = _("System");
				});
				items.sort([{
					property: "title",
					direction: "ASC"
				}]);
				// Create a tab panel for each filesystem.
				items.each(function(item) {
					me.add(Ext.create("ESB.workspace.panel.RrdGraph",
					  fnBuildRrdGraphConfig(item)));
				});
			},
			relayErrors: false,
			rpcData: {
				service: "FileSystemMgmt",
				method: "enumerateMountedFilesystems",
				params: {
					includeRoot: false
				}
			}
		});
	}
});
