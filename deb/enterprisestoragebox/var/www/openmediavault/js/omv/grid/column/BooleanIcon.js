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
 * @ingroup webgui
 * @class ESB.grid.column.BooleanIcon
 * @derived Ext.grid.column.Column
 * @param iconCls A CSS class used to render the boolean value. This can
 *   be for example:<ul>
 *   \li x-grid-cell-booleaniconcolumn-yesno
 *   \li x-grid-cell-booleaniconcolumn-led
 *   \li x-grid-cell-booleaniconcolumn-switch
 *   </ul>
 *   Defaults to 'x-grid-cell-booleaniconcolumn-yesno'.
 */
Ext.define("ESB.grid.column.BooleanIcon", {
	extend: "Ext.grid.column.Column",
	alias: [ "widget.booleaniconcolumn" ],
	uses: [
		"ESB.util.Format"
	],

	iconBaseCls: Ext.baseCSSPrefix + "grid-cell-booleaniconcolumn",
	iconCls: Ext.baseCSSPrefix + "grid-cell-booleaniconcolumn-yesno",
	undefinedText: "&#160;",
	trueValue: [ true, 1, "true", "ok", "1", "y", "yes", "on" ],

	align: "center",

	defaultRenderer: function(value, metaData) {
		var me = this;
		var iconCls = me.iconCls + "-false";
		if (!Ext.isDefined(value))
			return me.undefinedText;
		if (Ext.Array.contains(me.trueValue, value))
			iconCls = me.iconCls + "-true";
		metaData.tdCls = me.iconBaseCls + " " + iconCls;
		return "";
	},

	updater: function(cell, value, record, view, dataSource) {
        cell.firstChild.innerHTML = this.defaultRenderer(value, null);
    }
});
