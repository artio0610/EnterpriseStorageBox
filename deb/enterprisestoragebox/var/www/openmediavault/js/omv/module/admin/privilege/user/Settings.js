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
// require("js/esb/form/field/SharedFolderComboBox.js")

/**
 * @class ESB.module.admin.privilege.user.Settings
 * @derived ESB.workspace.form.Panel
 */
Ext.define("ESB.module.admin.privilege.user.Settings", {
	extend: "ESB.workspace.form.Panel",
	uses: [
		"ESB.form.field.SharedFolderComboBox"
	],

	rpcService: "UserMgmt",
	rpcGetMethod: "getSettings",
	rpcSetMethod: "setSettings",
	onlySubmitIfDirty: true,
	plugins: [{
		ptype: "linkedfields",
		correlations: [{
			name: "sharedfolderref",
			conditions: [
				{ name: "enable", value: true }
			],
			properties: [
				"!allowBlank",
				"!readOnly"
			]
		}]
	}],

	getFormItems: function() {
		return [{
			xtype: "fieldset",
			title: _("User home directory"),
			fieldDefaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "checkbox",
				name: "enable",
				fieldLabel: _("Enable"),
				checked: false
			},{
				xtype: "sharedfoldercombo",
				name: "sharedfolderref",
				fieldLabel: _("Location"),
				allowNone: true,
				value: "",
				plugins: [{
					ptype: "fieldinfo",
					text: _("The location of the user home directories.")
				}]
			}]
		}];
	}
});

ESB.WorkspaceManager.registerPanel({
	id: "settings",
	path: "/privilege/user",
	text: _("Settings"),
	position: 20,
	className: "ESB.module.admin.privilege.user.Settings"
});
