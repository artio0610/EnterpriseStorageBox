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
 * @class ESB.module.admin.diagnostic.service.Status
 * @derived ESB.workspace.tab.Panel
 */
Ext.define("ESB.module.admin.diagnostic.service.Status", {
	extend: "ESB.workspace.tab.Panel",
	requires: [
		"Ext.ClassManager"
	],

	initComponent: function() {
		var me = this;
		// Get the registered plugins and initialize them.
		var classes = Ext.ClassManager.getNamesByExpression(
		  "esb.plugin.diagnostic.service.*");
		me.items = [];
		Ext.Array.each(classes, function(name) {
			// Create the child panel.
			var item = Ext.create(name);
			// Append default position if necessary.
			Ext.applyIf(item, {
				position: 100
			});
			// Add child to the parent tab panel.
			me.items.push(item);
		});
		// Sort the tabs by their position.
		Ext.Array.sort(me.items, function(a, b) {
			return a.position > b.position ? 1 : (a.position < b.position ?
			  -1 : 0);
		});
		me.callParent(arguments);
	}
});

ESB.WorkspaceManager.registerPanel({
	id: "status",
	path: "/diagnostic/service",
	text: _("Services"),
	position: 10,
	className: "ESB.module.admin.diagnostic.service.Status"
});
