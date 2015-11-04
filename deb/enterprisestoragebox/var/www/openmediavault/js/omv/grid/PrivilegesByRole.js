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
// require("js/esb/grid/Panel.js")

/**
 * @ingroup webgui
 * @class ESB.grid.PrivilegesByRole
 * @derived ESB.grid.Panel
 * Display the user or group privileges for all shared folder.
 * @param roleType The role type, e.g. 'user' or 'group'. Required.
 * @param roleName The name of the user or group. Required.
 * @param autoLoadData TRUE to call the store's load method automatically
 *   creation. Defaults to TRUE.
 * @param readOnly Set this grid to read-only. Defaults to FALSE.
 */
Ext.define("ESB.grid.PrivilegesByRole", {
	extend: "ESB.grid.Panel",
	alias: [ "widget.privilegesbyrolegrid" ],
	requires: [
		"Ext.grid.column.CheckColumn",
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc"
	],

	autoLoadData: true,
	readOnly: false,

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			store: Ext.create("ESB.data.Store", {
				autoLoad: me.autoLoadData,
				model: ESB.data.Model.createImplicit({
					idProperty: "uuid",
					fields: [
						{ name: "uuid", type: "string" },
						{ name: "name", type: "string" },
						{ name: "perms", type: "int", allowNull: true, defaultValue: null },
						{ name: "deny", type: "boolean", defaultValue: false },
						{ name: "readonly", type: "boolean", defaultValue: false },
						{ name: "writeable", type: "boolean", defaultValue: false }
					]
				}),
				proxy: {
					type: "rpc",
					appendSortParams: false,
					extraParams: {
						role: me.roleType,
						name: me.roleName
					},
					rpcData: {
						service: "ShareMgmt",
						method: "getPrivilegesByRole"
					}
				},
				sorters: [{
					direction: "ASC",
					property: "name"
				}],
				listeners: {
					scope: me,
					load: function(store, records, successful, eOpts) {
						Ext.Array.each(records, function(record) {
							record.beginEdit();
							switch (record.get("perms")) {
							case 0:
								record.set("deny", true);
								break;
							case 5:
								record.set("readonly", true);
								break;
							case 7:
								record.set("writeable", true);
								break;
							default:
								break;
							}
							record.endEdit();
						});
						store.commitChanges();
					}
				}
			}),
			columns: [{
				text: _("Name"),
				sortable: true,
				dataIndex: "name",
				stateId: "name",
				flex: 2
			},{
				xtype: "checkcolumn",
				text: _("Read/Write"),
				sortable: true,
				groupable: false,
				dataIndex: "writeable",
				stateId: "writeable",
				align: "center",
				flex: 1,
				listeners: {
					scope: me,
					checkchange: me.onCheckChange
				}
			},{
				xtype: "checkcolumn",
				text: _("Read-only"),
				sortable: true,
				groupable: false,
				dataIndex: "readonly",
				stateId: "readonly",
				align: "center",
				flex: 1,
				listeners: {
					scope: me,
					checkchange: me.onCheckChange
				}
			},{
				xtype: "checkcolumn",
				text: _("No access"),
				sortable: true,
				groupable: false,
				dataIndex: "deny",
				stateId: "deny",
				align: "center",
				flex: 1,
				listeners: {
					scope: me,
					checkchange: me.onCheckChange
				}
			}]
		});
		me.callParent(arguments);
	},

	onCheckChange: function(column, rowIndex, checked, eOpts) {
		var me = this;
		if (me.readOnly)
			return;
		var record = me.store.getAt(rowIndex);
		var fieldNames = [ "readonly", "writeable", "deny" ];
		// Clear all other fields except the current selected one.
		record.beginEdit();
		Ext.Array.each(fieldNames, function(fieldName) {
			if (fieldName == column.dataIndex)
				return;
			record.set(fieldName, false);
		});
		record.endEdit();
	}
});
