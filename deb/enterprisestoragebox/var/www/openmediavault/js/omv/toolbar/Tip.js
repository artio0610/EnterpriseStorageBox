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
// require("js/esb/util/Format.js")

/**
 * @class ESB.toolbar.Tip
 * @derived Ext.toolbar.Toolbar
 * @param text The text to display.
 * @param icon The icon to display. Defaults to INFO.
 * @param cls The CSS class that will be added to this component's
 *   element. Defaults to 'x-toolbar-tip'.
 */
Ext.define("ESB.toolbar.Tip", {
	extend: "Ext.toolbar.Toolbar",
	alias: "widget.tiptoolbar",
	requires: [
		"Ext.toolbar.Item",
		"Ext.toolbar.TextItem",
		"ESB.util.Format"
	],
	statics: {
		INFO: Ext.baseCSSPrefix + "message-box-info",
		WARNING: Ext.baseCSSPrefix + "message-box-warning",
		QUESTION: Ext.baseCSSPrefix + "message-box-question",
	},

	cls: Ext.baseCSSPrefix + "toolbar-tip",
	iconHeight: 35,
	iconWidth: 35,

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			items: [{
				xtype: "tbitem",
				height: me.iconHeight,
				width: me.iconWidth,
				cls: me.icon || ESB.toolbar.Tip.INFO
			},{
				xtype: "tbtext",
				flex: 1,
				text: ESB.util.Format.whitespace(me.text)
			}]
		});
		me.callParent(arguments);
	}
});
