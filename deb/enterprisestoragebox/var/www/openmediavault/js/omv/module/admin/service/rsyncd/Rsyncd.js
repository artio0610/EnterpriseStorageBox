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
// require("js/esb/module/admin/service/rsyncd/Settings.js")
// require("js/esb/module/admin/service/rsyncd/Modules.js")

/**
 * @class ESB.module.admin.service.rsyncd.Rsyncd
 * @derived ESB.workspace.tab.Panel
 */
Ext.define("ESB.module.admin.service.rsyncd.Rsyncd", {
	extend: "ESB.workspace.tab.Panel",
	requires: [
		"ESB.module.admin.service.rsyncd.Settings",
		"ESB.module.admin.service.rsyncd.Modules"
	],

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			items: [
				Ext.create("ESB.module.admin.service.rsyncd.Settings", {
					title: _("Settings")
				}),
				Ext.create("ESB.module.admin.service.rsyncd.Modules", {
					title: _("Modules")
				})
			]
		});
		me.callParent(arguments);
	}
});

ESB.WorkspaceManager.registerPanel({
	id: "server",
	path: "/service/rsync",
	text: _("Server"),
	position: 20,
	className: "ESB.module.admin.service.rsyncd.Rsyncd"
});
