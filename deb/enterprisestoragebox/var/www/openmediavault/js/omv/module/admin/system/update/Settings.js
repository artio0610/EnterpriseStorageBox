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
// require("js/esb/workspace/form/Panel.js")

/**
 * @class ESB.module.admin.system.update.Settings
 * @derived ESB.workspace.form.Panel
 */
Ext.define("ESB.module.admin.system.update.Settings", {
	extend: "ESB.workspace.form.Panel",

	rpcService: "Apt",
	rpcGetMethod: "getSettings",
	rpcSetMethod: "setSettings",

	initComponent: function() {
		var me = this;
		me.callParent(arguments);
		me.on("submit", function() {
			ESB.MessageBox.show({
				title: _("Confirmation"),
				msg: _("The information about available software is out-of-date. You need to reload the information about available software."),
				buttons: Ext.MessageBox.OKCANCEL,
				buttonText: {
					ok: _("Reload"),
					cancel: _("Close")
				},
				fn: function(answer) {
					if("cancel" === answer)
						return;
					ESB.RpcObserver.request({
						title: _("Downloading package information"),
						msg: _("The repository will be checked for new, removed or upgraded software packages."),
						rpcData: {
							service: "Apt",
							method: "update"
						}
					});
				},
				scope: me,
				icon: Ext.Msg.QUESTION
			});
		}, me);
	},

	getFormItems: function() {
		return [{
			xtype: "fieldset",
			title: _("Install updates from"),
			fieldDefaults: {
				labelSeparator: "",
				hideLabel: true
			},
			items: [{
				xtype: "checkbox",
				name: "proposed",
				checked: false,
				boxLabel: _("Pre-release updates.")
			},{
				xtype: "checkbox",
				name: "partner",
				checked: false,
				boxLabel: _("Community-maintained updates.")
			}]
		}];
	}
});

ESB.WorkspaceManager.registerPanel({
	id: "settings",
	path: "/system/update",
	text: _("Settings"),
	position: 20,
	className: "ESB.module.admin.system.update.Settings"
});
