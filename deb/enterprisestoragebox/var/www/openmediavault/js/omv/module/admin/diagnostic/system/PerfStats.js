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
// require("js/esb/workspace/tab/Panel.js")

/**
 * @class ESB.module.admin.diagnostic.system.PerfStats
 * @derived ESB.workspace.tab.Panel
 */
Ext.define("ESB.module.admin.diagnostic.system.PerfStats", {
	extend: "ESB.workspace.tab.Panel",
	requires: [
		"Ext.ClassManager"
	],

	initComponent: function() {
		var me = this;
		// Get the registered plugins and initialize them.
		var classes = Ext.ClassManager.getNamesByExpression(
		  "esb.plugin.diagnostic.system.*");
		me.items = [];
		Ext.Array.each(classes, function(name) {
			me.items.push(Ext.create(name));
		});
		// Sort the tabs by their title.
		Ext.Array.sort(me.items, function(a, b) {
			return a.title > b.title ? 1 : (a.title < b.title ? -1 : 0);
		});
		me.callParent(arguments);
	}
});

ESB.WorkspaceManager.registerPanel({
	id: "perfstats",
	path: "/diagnostic/system",
	text: _("Performance statistics"),
	position: 30,
	className: "ESB.module.admin.diagnostic.system.PerfStats"
});
