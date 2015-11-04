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
// require("js/esb/tree/Panel.js")
// require("js/esb/data/Model.js")
// require("js/esb/data/proxy/Rpc.js")
// require("js/esb/data/reader/RpcArray.js")

/**
 * @class ESB.tree.Folder
 * @derived ESB.tree.Panel
 * @param uuid The UUID of the volume or shared folder to process. Required.
 * @param type The type of the configuration object. This can be "mntent"
 *   or "sharedfolder". Defaults to "mntent".
 * @param root The root node for this panel. This can be used to override
 *   the default configuration. Note, this is different to the Ext.tree.Panel
 *   behaviour.
 */
Ext.define("ESB.tree.Folder", {
	extend: "ESB.tree.Panel",
	requires: [
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.data.reader.RpcArray"
	],

	type: "mntent",

	scrollable: true,
	rootVisible: false,

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			store: Ext.create("Ext.data.TreeStore", {
				autoLoad: true,
				model: ESB.data.Model.createImplicit({
					fields: [
						{ name: "text", type: "string", mapping: 0 },
						{ name: "name", type: "string", mapping: 0 }
					]
				}),
				proxy: {
					type: "rpc",
					reader: "rpcarray",
					appendSortParams: false,
					rpcData: {
						service: "FolderBrowser",
						method: "get",
						params: {
							uuid: me.uuid,
							type: me.type
						}
					}
				},
				sorters: [{
					direction: "ASC",
					property: "text"
				}],
				root: Ext.apply({
					expanded: false, // Load children async.
					text: "",
					name: ""
				}, me.root || {}),
				listeners: {
					scope: me,
					beforeload: function(store, operation) {
						// Modify the RPC parameters.
						Ext.apply(store.proxy.rpcData.params, {
							path: this.getPathFromNode(operation.node)
						});
					}
				}
			})
		});
		// Delete the 'root' config object, otherwise the ExtJS procedure
		// takes action which might result in unexpected behaviour.
		if(Ext.isDefined(me.root))
			delete me.root;
		me.callParent(arguments);
	},

	/**
	 * Gets the hierarchical path from the root to the given node.
	 * @param node The node to process.
	 * @return The hierarchical path from the root to the given node,
	 *   e.g. '/backup/data/private'.
	 */
	getPathFromNode: function(node) {
		var path = [ node.get("name") ];
		var parent = node.parentNode;
		while (parent) {
			path.unshift(parent.get("name"));
			parent = parent.parentNode;
		}
		return path.join("/");
	}
});
