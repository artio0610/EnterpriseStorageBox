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
// require("js/esb/form/field/Password.js")

/**
 * @class ESB.module.admin.system.general.AdminPasswd
 * @derived ESB.workspace.form.Panel
 */
Ext.define("ESB.module.admin.system.general.AdminPasswd", {
	extend: "ESB.workspace.form.Panel",
	requires: [
		"ESB.form.field.Password",
	],

	rpcService: "WebGui",
	rpcSetMethod: "setPassword",

	getFormItems: function() {
		return [{
			xtype: "fieldset",
			title: _("Administrator password"),
			fieldDefaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "passwordfield",
				name: "password",
				fieldLabel: _("Password"),
				allowBlank: true
			},{
				xtype: "passwordfield",
				name: "passwordconf",
				fieldLabel: _("Confirm password"),
				allowBlank: true,
				submitValue: false
			}]
		}];
	},

	isValid: function() {
		var me = this;
		if(!me.callParent(arguments))
			return false;
		var values = me.getValues();
		// Check the password.
		var field = me.findField("passwordconf");
		if(values.password !== field.getValue()) {
			var msg = _("Passwords don't match");
			me.markInvalid([
				{ id: "password", msg: msg },
				{ id: "passwordconf", msg: msg }
			]);
			return false;
		}
		return true;
	},

	doLoad: function() {
		var me = this;
		// Do not display any text in password fields by default.
		me.setValues({
			password: "",
			passwordconf: ""
		});
	}
});

ESB.WorkspaceManager.registerPanel({
	id: "adminpasswd",
	path: "/system/general",
	text: _("Web Administrator Password"),
	position: 20,
	className: "ESB.module.admin.system.general.AdminPasswd"
});
