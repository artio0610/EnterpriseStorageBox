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
// require("js/esb/data/Store.js")
// require("js/esb/data/Model.js")
// require("js/esb/data/proxy/Rpc.js")

/**
 * @ingroup webgui
 * @class ESB.form.field.UserComboBox
 * @derived Ext.form.field.ComboBox
 * Display user names.
 * @param userType Which users should be displayed, system, normal or all.
 *   Defaults to 'all'.
 */
Ext.define("ESB.form.field.UserComboBox", {
	extend: "Ext.form.field.ComboBox",
	alias: "widget.usercombo",
	requires: [
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc"
	],

	userType: "all",

	allowBlank: false,
	editable: true,
	typeAhead: true,
	forceSelection: true,
	selectOnFocus: true,
	minChars: 1,
	emptyText: _("Select a user name ..."),
	valueField: "name",
	displayField: "name",
	vtype: "username",

	initComponent: function() {
		var me = this;
		var rpcMethod = {
			"normal": "enumerateUsers",
			"system": "enumerateSystemUsers",
			"all": "enumerateAllUsers"
		};
		Ext.apply(me, {
			store: Ext.create("ESB.data.Store", {
				autoLoad: true,
				model: ESB.data.Model.createImplicit({
					idProperty: "name",
					fields: [
						{ name: "name", type: "string" }
					]
				}),
				proxy: {
					type: "rpc",
					appendSortParams: false,
					rpcData: {
						service: "UserMgmt",
						method: rpcMethod[me.userType]
					}
				},
				sorters: [{
					direction: "ASC",
					property: "name"
				}],
				listeners: {
					scope: me,
					load: function(store, records, options) {
						// Switch combobox to queryMode = 'local' to do not
						// execute an RPC on each query (e.g. typeahead).
						if(true === me.typeAhead) {
							me.queryMode = "local";
						}
					}
				}
			})
		});
		me.callParent(arguments);
	}
});
