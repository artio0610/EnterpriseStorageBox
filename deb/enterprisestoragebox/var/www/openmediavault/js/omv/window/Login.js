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
// require("js/esb/window/Window.js")
// require("js/esb/window/MessageBox.js")
// require("js/esb/form/Panel.js")
// require("js/esb/form/field/Password.js")
// require("js/esb/form/field/LanguageComboBox.js")

/**
 * @ingroup webgui
 * @class ESB.window.Login
 * @derived ESB.window.Window
 */
Ext.define("ESB.window.Login", {
	extend: "ESB.window.Window",
	requires: [
		"ESB.Rpc",
		"ESB.form.Panel",
		"ESB.form.field.Password",
		"ESB.form.field.LanguageComboBox",
		"ESB.window.MessageBox"
	],

	title: _("Login"),
	layout: "fit",
	width: 320,
	closable: false,
	resizable: false,
	buttonAlign: "center",

	constructor: function() {
		var me = this;
		me.callParent(arguments);
		/**
		 * @event login
		 * Fires when the 'Login' button has been pressed and the RPC
		 * has been executed.
		 * @param this The window object.
		 * @param response The RPC response.
		 */
	},

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			buttons: [{
				id: me.getId() + "-login",
				text: _("Login"),
				handler: me.onLogin,
				scope: me
			}],
			items: [ me.fp = Ext.create("ESB.form.Panel", {
				bodyPadding: "5 5 0",
				items: [{
					xtype: "languagecombo",
					fieldLabel: _("Language"),
					submitValue: false,
					listeners: {
						scope: me,
						localechange: function(combo, locale) {
							ESB.util.i18n.setLocale(locale);
							// Force rendering of the whole page with the
							// selected language.
							ESB.confirmPageUnload = false;
							document.location.reload();
						}
					}
				},{
					id: "username",
					xtype: "textfield",
					fieldLabel: _("Username"),
					name: "username",
					blankText: _("Enter your username"),
					autoCapitalize: false,
					allowBlank: false
				},{
					id: "password",
					xtype: "passwordfield",
					fieldLabel: _("Password"),
					name: "password",
					blankText: _("Enter your password"),
					autoCapitalize: false
				}]
			}) ]
		});
		me.callParent(arguments);
		me.on("show", function() {
			// Set focus to field 'Username'.
			var field = me.fp.findField("username");
			if (!Ext.isEmpty(field))
				field.focus(false, 500);
		}, me);
	},

	/**
	 * @method onRender
	 */
	onRender: function() {
		var me = this;
		me.callParent(arguments);
		// Monitor keyboard activities.
		me.map = new Ext.util.KeyMap(me.getEl(), [{
			key: [ 10, 13 ],
			fn: me.onLogin,
			scope: me
		}]);
	},

	/**
	 * Method that is called when the 'Login' button is pressed.
	 */
	onLogin: function() {
		var me = this;
		if (!me.fp.isValid())
			return;
		// Get the username and password.
		var params = me.fp.getValues();
		// Display waiting mask.
		me.setLoading(_("Please wait ..."));
		// Execute RPC.
		ESB.Rpc.request({
			scope: me,
			callback: function(id, success, response) {
				this.setLoading(false);
				if (!success)
					ESB.MessageBox.error(null, response);
				else
					// Fire event but do not close the window.
					this.fireEvent("login", this, response);
			},
			relayErrors: true,
			rpcData: {
				service: "Session",
				method: "login",
				params: params
			}
		});
	}
});
