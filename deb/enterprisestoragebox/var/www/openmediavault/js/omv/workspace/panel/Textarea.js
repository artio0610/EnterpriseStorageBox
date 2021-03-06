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
// require("js/esb/workspace/panel/Panel.js")
// require("js/esb/Rpc.js")
// require("js/esb/window/MessageBox.js")

/**
 * @ingroup webgui
 * @class ESB.workspace.panel.Textarea
 * @derived ESB.workspace.panel.Panel
 * A panel that contains a text area.
 * @param readOnly Mark the text area as readonly. Defaults to TRUE.
 * @param rpcService The RPC service name. Required.
 * @param rpcMethod The RPC method to request the data. Required.
 * @param rpcParams The RPC parameters. Optional.
 * @param hideDownloadButton Hide the 'Download' button in the top toolbar.
 *   Defaults to TRUE.
 */
Ext.define("ESB.workspace.panel.Textarea", {
	extend: "ESB.workspace.panel.Panel",
	requires: [
		"ESB.Rpc",
		"ESB.window.MessageBox"
	],

	loadMsg: _("Loading ..."),

	layout: "fit",
	hideTopToolbar: false,
	hideDownloadButton: true,
	autoLoadData: true,
	readOnly: true,
	scrollable: false,

	initComponent: function() {
		var me = this;
		me.items = [{
			id: me.getId() + "-content",
			xtype: "textarea",
			readOnly: me.readOnly,
			cls: Ext.baseCSSPrefix + "form-textarea-monospaced",
			inputWrapCls: Ext.form.field.TextArea.prototype.inputWrapCls +
			  " " + Ext.baseCSSPrefix + "form-text-wrap-noborder"
		}];
		me.callParent(arguments);
	},

	getTopToolbarItems: function(c) {
		var me = this;
		var items = me.callParent(arguments);
		Ext.Array.push(items, {
			id: me.getId() + "-download",
			xtype: "button",
			text: _("Download"),
			icon: "images/download.png",
			iconCls: Ext.baseCSSPrefix + "btn-icon-16x16",
			hidden: me.hideDownloadButton,
			handler: Ext.Function.bind(me.onDownloadButton, me, [ me ]),
			scope: me
		});
		return items;
	},

	doLoad: function() {
		var me = this;
		// Display waiting dialog.
		me.setLoading(me.loadMsg);
		// Execute RPC.
		ESB.Rpc.request({
			scope: me,
			callback: function(id, success, response) {
				me.setLoading(false);
				if (!success) {
					ESB.MessageBox.error(null, response);
				} else {
					me.setValue(response);
				}
			},
			relayErrors: true,
			rpcData: {
				service: me.rpcService,
				method: me.rpcMethod,
				params: me.rpcParams || null
			}
		});
	},

	/**
	 * Set the textarea content to be displayed.
	 * @param value The value to set.
	 * @return None.
	 */
	setValue: function(value) {
		var me = this;
		var c = me.queryById(me.getId() + "-content");
		if (!Ext.isEmpty(c)) {
			c.setValue(value);
		}
	},

	/**
	 * Returns the textarea content.
	 * @return The textarea content as string.
	 */
	getValue: function() {
		var me = this;
		var c = me.queryById(me.getId() + "-content");
		if (!Ext.isEmpty(c)) {
			value = c.getValue();
		}
		return value;
	},

	/**
	 * Handler that is called when the 'Download' button in the top toolbar
	 * is pressed.
	 */
	onDownloadButton: function() {
		var me = this;
		ESB.Download.request(me.rpcService, me.rpcMethod,
		  me.rpcParams || null);
	}
});
