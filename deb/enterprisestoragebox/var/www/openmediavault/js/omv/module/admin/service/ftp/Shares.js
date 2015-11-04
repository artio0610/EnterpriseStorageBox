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
// require("js/esb/workspace/grid/Panel.js")
// require("js/esb/workspace/window/Form.js")
// require("js/esb/workspace/window/plugin/ConfigObject.js")
// require("js/esb/Rpc.js")
// require("js/esb/data/Store.js")
// require("js/esb/data/Model.js")
// require("js/esb/data/proxy/Rpc.js")
// require("js/esb/form/field/SharedFolderComboBox.js")

/**
 * @class ESB.module.admin.service.ftp.Share
 * @derived ESB.workspace.window.Form
 */
Ext.define("ESB.module.admin.service.ftp.Share", {
	extend: "ESB.workspace.window.Form",
	uses: [
		"ESB.form.field.SharedFolderComboBox",
		"ESB.workspace.window.plugin.ConfigObject"
	],

	rpcService: "FTP",
	rpcGetMethod: "getShare",
	rpcSetMethod: "setShare",
	plugins: [{
		ptype: "configobject"
	}],

	/**
	 * The class constructor.
	 * @fn constructor
	 * @param uuid The UUID of the database/configuration object. Required.
	 */

	getFormConfig: function() {
		return {
			layout: {
				type: "vbox",
				align: "stretch"
			}
		};
	},

	getFormItems: function() {
		var me = this;
		return [{
			xtype: "sharedfoldercombo",
			name: "sharedfolderref",
			fieldLabel: _("Shared folder"),
			readOnly: (me.uuid !== ESB.UUID_UNDEFINED),
			plugins: [{
				ptype: "fieldinfo",
				text: _("The location of the files to share.")
			}]
		},{
			xtype: "textarea",
			name: "extraoptions",
			fieldLabel: _("Extra options"),
			allowBlank: true,
			flex: 1,
			plugins: [{
				ptype: "fieldinfo",
				text: _("Please check the <a href='http://www.proftpd.org/docs/directives/linked/by-name.html' target='_blank'>manual page</a> for more details.")
			}]
		},{
			xtype: "textfield",
			name: "comment",
			fieldLabel: _("Comment"),
			allowBlank: true,
			vtype: "comment"
		}];
	}
});

/**
 * @class ESB.module.admin.service.ftp.Shares
 * @derived ESB.workspace.grid.Panel
 */
Ext.define("ESB.module.admin.service.ftp.Shares", {
	extend: "ESB.workspace.grid.Panel",
	requires: [
		"ESB.Rpc",
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc"
	],
	uses: [
		"ESB.module.admin.service.ftp.Share"
	],

	hidePagingToolbar: false,
	stateful: true,
	stateId: "9889057b-b1c0-4c48-a4c1-8c8b4fb54d7b",
	columns: [{
		text: _("Shared folder"),
		sortable: true,
		dataIndex: "sharedfoldername",
		stateId: "sharedfoldername"
	},{
		text: _("Comment"),
		sortable: true,
		dataIndex: "comment",
		stateId: "comment"
	}],

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			store: Ext.create("ESB.data.Store", {
				autoLoad: true,
				model: ESB.data.Model.createImplicit({
					idProperty: "uuid",
					fields: [
						{ name: "uuid", type: "string" },
						{ name: "sharedfoldername", type: "string" },
						{ name: "comment", type: "string" }
					]
				}),
				proxy: {
					type: "rpc",
					rpcData: {
						service: "FTP",
						method: "getShareList"
					}
				},
				remoteSort: true,
				sorters: [{
					direction: "ASC",
					property: "sharedfoldername"
				}]
			})
		});
		me.callParent(arguments);
	},

	onAddButton: function() {
		var me = this;
		Ext.create("ESB.module.admin.service.ftp.Share", {
			title: _("Add share"),
			uuid: ESB.UUID_UNDEFINED,
			listeners: {
				scope: me,
				submit: function() {
					this.doReload();
				}
			}
		}).show();
	},

	onEditButton: function() {
		var me = this;
		var record = me.getSelected();
		Ext.create("ESB.module.admin.service.ftp.Share", {
			title: _("Edit share"),
			uuid: record.get("uuid"),
			listeners: {
				scope: me,
				submit: function() {
					this.doReload();
				}
			}
		}).show();
	},

	doDeletion: function(record) {
		var me = this;
		ESB.Rpc.request({
			scope: me,
			callback: me.onDeletion,
			rpcData: {
				service: "FTP",
				method: "deleteShare",
				params: {
					uuid: record.get("uuid")
				}
			}
		});
	}
});

ESB.WorkspaceManager.registerPanel({
	id: "shares",
	path: "/service/ftp",
	text: _("Shares"),
	position: 40,
	className: "ESB.module.admin.service.ftp.Shares"
});
