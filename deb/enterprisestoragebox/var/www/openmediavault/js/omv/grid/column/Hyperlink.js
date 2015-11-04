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

/**
 * @ingroup webgui
 * @class ESB.grid.column.Hyperlink
 * @derived Ext.grid.column.Column
 * @param target The target attribute specifies a window or a frame where
 *   the linked document is loaded. Defaults to '_blank'.
 */
Ext.define("ESB.grid.column.Hyperlink", {
	extend: "Ext.grid.column.Column",
	alias: [ "widget.hyperlinkcolumn" ],

	target: "_blank",

	defaultRenderer: function(value) {
		var me = this;
		return Ext.String.format('<a href="{0}" target="{1}">{0}</a>',
		  Ext.String.htmlEncode(value), me.target);
	}
});
