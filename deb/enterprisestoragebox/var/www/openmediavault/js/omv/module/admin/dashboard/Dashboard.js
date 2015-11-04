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
// require("js/esb/workspace/dashboard/Dashboard.js")

/**
 * @class ESB.module.admin.system.general.AdminPasswd
 * @derived ESB.workspace.dashboard.Dashboard
 */
Ext.define("ESB.module.admin.dashboard.Dashboard", {
	extend: "ESB.workspace.dashboard.Dashboard",

	getPartAliases: function() {
		// Get the registered dashboard widgets aliases.
		var aliases = Ext.ClassManager.getAliasesByExpression(
		  "part.module.admin.dashboard.part.*");
		return aliases;
	}
});

ESB.WorkspaceManager.registerPanel({
	id: "dashboard",
	path: "/diagnostic",
	text: _("Dashboard"),
	position: 1,
	icon16: "images/grid.png",
	iconSvg: "images/grid.svg",
	className: "ESB.module.admin.dashboard.Dashboard"
});
