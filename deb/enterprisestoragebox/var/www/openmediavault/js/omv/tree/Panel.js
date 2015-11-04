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
 * @class ESB.tree.Panel
 * @derived Ext.tree.Panel
 * @param singleClickExpand TRUE for single click expand on nodes.
 *   Defaults to FALSE.
 */
Ext.define("ESB.tree.Panel", {
	extend: "Ext.tree.Panel",

	singleClickExpand: false,

	initComponent: function() {
		var me = this;
		me.callParent(arguments);
		if(true === me.singleClickExpand) {
			// Expand nodes with a single click.
			me.on("itemclick", function(view, record) {
				if(record.isLeaf()) // Skip leafs.
					return;
				record.isExpanded() ? record.collapse() : record.expand();
			}, me);
		}
	},

	/**
	 * Get the tree's selected record.
	 * @return The selected record, otherwise NULL.
	 */
	getSelected: function() {
		var me = this;
		var records = me.getSelection();
		if (!Ext.isArray(records))
			return null;
		return records[0];
	}
});
