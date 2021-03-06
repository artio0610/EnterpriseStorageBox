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
// require("js/esb/workspace/window/Grid.js")
// require("js/esb/workspace/window/Tab.js")
// require("js/esb/workspace/window/TextArea.js")
// require("js/esb/form/Panel.js")
// require("js/esb/form/field/CheckboxGrid.js")
// require("js/esb/form/field/Password.js")
// require("js/esb/grid/PrivilegesByRole.js")
// require("js/esb/grid/column/BooleanText.js")
// require("js/esb/util/Format.js")
// require("js/esb/Rpc.js")
// require("js/esb/data/Store.js")
// require("js/esb/data/Model.js")
// require("js/esb/data/proxy/Rpc.js")
// require("js/esb/data/reader/RpcArray.js")

/**
 * @class ESB.module.admin.privilege.user.user.General
 * @derived ESB.form.Panel
 * @param editMode Set to TRUE if the dialog is in edit mode. Defaults
 *   to FALSE.
 */
Ext.define("ESB.module.admin.privilege.user.user.General", {
	extend: "ESB.form.Panel",
	uses: [
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.data.reader.RpcArray",
		"ESB.form.field.Password"
	],

	editMode: false,

	title: _("General"),
	bodyPadding: "5 5 0",

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			items: [{
				xtype: "textfield",
				name: "name",
				fieldLabel: _("Name"),
				allowBlank: false,
				vtype: "username",
				readOnly: me.editMode
			},{
				xtype: "textfield",
				name: "comment",
				fieldLabel: _("Comment"),
				maxLength: 65,
				vtype: "comment"
			},{
				xtype: "textfield",
				name: "email",
				fieldLabel: _("Email"),
				allowBlank: true,
				vtype: "email"
			},{
				xtype: "passwordfield",
				name: "password",
				fieldLabel: _("Password"),
				allowBlank: me.editMode
			},{
				xtype: "passwordfield",
				name: "passwordconf",
				fieldLabel: _("Confirm password"),
				allowBlank: me.editMode,
				submitValue: false
			},{
				xtype: "combo",
				name: "shell",
				fieldLabel: _("Shell"),
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				store: Ext.create("ESB.data.Store", {
					autoLoad: true,
					fields: [
						{ name: "path", type: "string" }
					],
					proxy: {
						type: "rpc",
						reader: "rpcarray",
						appendSortParams: false,
						rpcData: {
							service: "System",
							method: "getShells"
						}
					},
					sorters: [{
						direction: "ASC",
						property: "path"
					}]
				}),
				emptyText: _("Select a shell ..."),
				valueField: "path",
				displayField: "path",
				value: "/bin/dash"
			},{
				xtype: "checkbox",
				name: "disallowusermod",
				fieldLabel: _("Modify account"),
				checked: false,
				boxLabel: _("Disallow the user to modify his account.")
			}]
		});
		me.callParent(arguments);
	},

	isValid: function() {
		var me = this;
		if (!me.callParent(arguments))
			return false;
		var valid = true;
		var values = me.getValues();
		// Check the password.
		var field = me.findField("passwordconf");
		if (values.password !== field.getValue()) {
			var msg = _("Passwords don't match");
			me.markInvalid([
				{ id: "password", msg: msg },
				{ id: "passwordconf", msg: msg }
			]);
			valid = false;
		}
		return valid;
	}
});

/**
 * @class ESB.module.admin.privilege.user.user.Groups
 * @derived ESB.grid.Panel
 */
Ext.define("ESB.module.admin.privilege.user.user.Groups", {
	extend: "ESB.grid.Panel",
	uses: [
		"Ext.XTemplate",
		"Ext.grid.feature.Grouping",
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.grid.column.BooleanText"
	],

	border: false,
	title: _("Groups"),
	selModel: "checkboxmodel",
	stateful: true,
	stateId: "e44f12ea-b1ed-11e2-9a57-00221568ca88",
	features: [{
		ftype: "grouping",
		groupHeaderTpl: Ext.create("Ext.XTemplate",
			"{[this.renderValue(values)]}", {
			renderValue: function(values) {
				var result;
				switch (values.groupField) {
				case "system":
					result = values.groupValue ? _("System accounts") :
					  _("User accounts");
					break;
				default:
					result = Ext.String.format("{0}: {1}", values.columnName,
					  values.name);
					break;
				}
				return result;
			}
		})
	}],
	columns: [{
		text: _("Name"),
		sortable: true,
		dataIndex: "name",
		stateId: "name",
		flex: 2
	},{
		text: _("GID"),
		sortable: true,
		dataIndex: "gid",
		stateId: "gid",
		hidden: true,
		flex: 1
	},{
		xtype: "booleantextcolumn",
		text: _("System"),
		sortable: true,
		groupable: true,
		hidden: true,
		dataIndex: "system",
		stateId: "system",
		align: "center",
		flex: 1
	}],

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			store: Ext.create("ESB.data.Store", {
				autoLoad: true,
				groupField: "system",
				model: ESB.data.Model.createImplicit({
					idProperty: "name",
					fields: [
						{ name: "name", type: "string" },
						{ name: "gid", type: "int" },
						{ name: "system", type: "boolean" }
					]
				}),
				proxy: {
					type: "rpc",
					appendSortParams: false,
					rpcData: {
						service: "UserMgmt",
						method: "enumerateAllGroups"
					}
				},
				sorters: [{
					direction: "ASC",
					property: "name"
				}],
				listeners: {
					scope: me,
					load: function(store, records) {
						// Always select the 'users' group.
						var record = store.findRecord("name", "users");
						if (Ext.isObject(record) && record.isModel)
							me.getSelectionModel().select(record, true, true);
					}
				}
			})
		});
		me.callParent(arguments);
		// Mark the store as dirty whenever the selection has
		// been changed.
		me.on("selectionchange", function(c, selected) {
			me.getStore().markDirty();
		});
	},

	setValues: function(values) {
		var me = this;
		// Ensure the store is loaded to select the given groups.
		if (me.getStore().isLoading() || !me.getStore().isLoaded()) {
			var fn = Ext.Function.bind(me.setValues, me, arguments);
			me.getStore().on({
				single: true,
				load: fn
			});
			return false;
		}
		// Select the given groups.
		var records = [];
		me.getSelectionModel().deselectAll(true);
		Ext.Array.each(values.groups, function(name) {
			var record = me.getStore().findRecord("name", name);
			if (Ext.isObject(record) && record.isModel)
				Ext.Array.push(records, [ record ]);
		});
		me.getSelectionModel().select(records, true, true);
		return values.groups;
	},

	getValues: function() {
		var me = this;
		var groups = [];
		var records = me.getSelection();
		Ext.Array.each(records, function(record) {
			groups.push(record.get("name"));
		});
		return {
			groups: groups
		};
	}
});

/**
 * @class ESB.module.admin.privilege.user.user.sshpubkeys.PubKey
 * @derived ESB.workspace.window.TextArea
 */
Ext.define("ESB.module.admin.privilege.user.user.sshpubkeys.PubKey", {
	extend: "ESB.workspace.window.TextArea",

	width: 500,
	height: 250,
	hideOkButton: false,
	mode: "local",
	readOnly: false,

	initComponent: function() {
		var me = this;
		me.callParent(arguments);
		// Add the tip toolbar at the bottom of the window.
		me.addDocked({
			xtype: "tiptoolbar",
			dock: "bottom",
			ui: "footer",
			text: _("The public key in RFC 4716 SSH public key file format.")
		});
	},

	getTextAreaConfig: function(c) {
		return {
			allowBlank: false,
			vtype: "sshPubKeyRFC4716"
		};
	}
});

/**
 * @class ESB.module.admin.privilege.user.user.SshPubKeys
 * @derived ESB.workspace.grid.Panel
 */
Ext.define("ESB.module.admin.privilege.user.user.SshPubKeys", {
	extend: "ESB.workspace.grid.Panel",
	uses: [
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.reader.RpcArray",
		"ESB.module.admin.privilege.user.user.sshpubkeys.PubKey"
	],

	title: _("Public keys"),
	hideEditButton: true,
	hidePagingToolbar: true,
	mode: "local",
	columns: [{
		text: _("Public key"),
		dataIndex: "sshpubkey",
		sortable: false,
		flex: 1,
		renderer: function(value, metaData) {
			metaData.tdCls += " x-monospaced";
			return value.replace(/\n/g, "<br>");
		}
	}],

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			store: Ext.create("ESB.data.Store", {
				autoLoad: false,
				model: ESB.data.Model.createImplicit({
					idProperty: "sshpubkey",
					fields: [
						{ name: "sshpubkey", type: "string", mapping: 0 }
					]
				}),
				proxy: {
					type: "memory",
					reader: "rpcarray"
				},
				data: []
			})
		});
		me.callParent(arguments);
	},

	onAddButton: function() {
		var me = this;
		Ext.create("ESB.module.admin.privilege.user.user.sshpubkeys.PubKey", {
			title: _("Add public key"),
			listeners: {
				scope: me,
				submit: function(c, value) {
					value = Ext.String.rtrim(value, " \n");
					me.getStore().addRawData([ value ]);
				}
			}
		}).show();
	},

	setValues: function(values) {
		var me = this;
		me.getStore().loadRawData(values.sshpubkeys);
		return values.sshpubkeys;
	},

	getValues: function() {
		var me = this;
		var sshpubkeys = [];
		me.getStore().each(function(record) {
			Ext.Array.push(sshpubkeys, record.get("sshpubkey"));
		});
		return {
			sshpubkeys: sshpubkeys
		};
	}
});

/**
 * @class ESB.module.admin.privilege.user.User
 * @derived ESB.workspace.window.Tab
 */
Ext.define("ESB.module.admin.privilege.user.User", {
	extend: "ESB.workspace.window.Tab",
	uses: [
		"ESB.module.admin.privilege.user.user.General",
		"ESB.module.admin.privilege.user.user.Groups",
		"ESB.module.admin.privilege.user.user.SshPubKeys"
	],

	rpcService: "UserMgmt",
	rpcSetMethod: "setUser",

	width: 420,
	height: 300,

	getTabItems: function() {
		var me = this;
		return [
			Ext.create("ESB.module.admin.privilege.user.user.General", {
				editMode: Ext.isDefined(me.rpcGetMethod)
			}),
			Ext.create("ESB.module.admin.privilege.user.user.Groups"),
			Ext.create("ESB.module.admin.privilege.user.user.SshPubKeys")
		];
	}
});

/**
 * @class ESB.module.admin.privilege.user.Import
 * @derived ESB.workspace.window.TextArea
 */
Ext.define("ESB.module.admin.privilege.user.Import", {
	extend: "ESB.workspace.window.TextArea",

	title: _("Import users"),
	width: 580,
	height: 350,

	rpcService: "UserMgmt",
	rpcSetMethod: "importUsers",
	rpcSetPollStatus: true,
	autoLoadData: false,
	submitMsg: _("Importing users ..."),
	hideOkButton: false,
	okButtonText: _("Import"),
	readOnly: false,

	initComponent: function() {
		var me = this;
		me.callParent(arguments);
		// Add the tip toolbar at the bottom of the window.
		me.addDocked({
			xtype: "tiptoolbar",
			dock: "bottom",
			ui: "footer",
			text: _("Each line represents one user. Note, the password must be entered in plain text.")
		});
	},

	getTextAreaConfig: function() {
		return {
			allowBlank: false,
			value: "# <name>;<uid>;<comment>;<email>;<password>;<group,group,...>;<disallowusermod>"
		};
	},

	getValues: function() {
		var me = this;
		var values = me.callParent(arguments);
		return {
			csv: values
		};
	},

	setValues: function(values) {
		var me = this;
		return me.setValues(values.cvs);
	}
});

/**
 * @class ESB.module.admin.privilege.user.SharedFolderPrivileges
 * @derived ESB.workspace.window.Grid
 * Display all shared folder privileges from the given user.
 */
Ext.define("ESB.module.admin.privilege.user.SharedFolderPrivileges", {
	extend: "ESB.workspace.window.Grid",
	requires: [
		"ESB.grid.PrivilegesByRole"
	],

	rpcService: "ShareMgmt",
	rpcSetMethod: "setPrivilegesByRole",

	title: _("Shared folder privileges"),
	width: 500,
	height: 300,
	hideResetButton: true,
	gridClassName: "ESB.grid.PrivilegesByRole",

	/**
	 * The class constructor.
	 * @fn constructor
	 * @param roleName The name of the user. Required.
	 */

	initComponent: function() {
		var me = this;
		me.callParent(arguments);
		// Add the tip toolbar at the bottom of the window.
		me.addDocked({
			xtype: "tiptoolbar",
			dock: "bottom",
			ui: "footer",
			text: _("These settings are used by the services to configure the user access rights. Please note that these settings have no effect on file system permissions.")
		});
	},

	getGridConfig: function() {
		var me = this;
		return {
			border: false,
			stateful: true,
			stateId: "41e79486-1192-11e4-baab-0002b3a176b4",
			roleType: "user",
			roleName: me.roleName
		};
	},

	getRpcSetParams: function() {
		var me = this;
		var privileges = [];
		var items = me.getValues();
		Ext.Array.each(items, function(item) {
			// Set default values.
			var privilege = {
				uuid: item.uuid,
				perms: -1
			};
			if ((true === item.deny) || (true === item.readonly) ||
			  (true === item.writeable)) {
				privilege.perms = 0; // No access
				if (true === item.readonly)
					privilege.perms = 5;
				else if (true === item.writeable)
					privilege.perms = 7;
			}
			Ext.Array.push(privileges, privilege);
		});
		return {
			role: "user",
			name: me.roleName,
			privileges: privileges
		};
	}
});

/**
 * @class ESB.module.admin.privilege.user.Users
 * @derived ESB.workspace.grid.Panel
 */
Ext.define("ESB.module.admin.privilege.user.Users", {
	extend: "ESB.workspace.grid.Panel",
	requires: [
		"ESB.Rpc",
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.util.Format"
	],
	uses: [
		"ESB.module.admin.privilege.user.User",
		"ESB.module.admin.privilege.user.Import",
		"ESB.module.admin.privilege.user.SharedFolderPrivileges"
	],

	hidePagingToolbar: false,
	stateful: true,
	stateId: "98d6fe31-8e12-407b-82f2-7e0acf4006c1",
	columns: [{
		text: _("Name"),
		sortable: true,
		dataIndex: "name",
		stateId: "name"
	},{
		text: _("Email"),
		sortable: true,
		dataIndex: "email",
		stateId: "email"
	},{
		text: _("Comment"),
		sortable: true,
		dataIndex: "comment",
		stateId: "comment"
	},{
		text: _("Groups"),
		dataIndex: "groups",
		stateId: "groups",
		renderer: function(value) {
			if(Ext.isArray(value))
				value = value.join(", ");
			return ESB.util.Format.whitespace(value);
		}
	}],

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			store: Ext.create("ESB.data.Store", {
				autoLoad: true,
				model: ESB.data.Model.createImplicit({
					idProperty: "name",
					fields: [
						{ name: "name", type: "string" },
						{ name: "email", type: "string" },
						{ name: "groups", type: "object" },
						{ name: "comment", type: "string" },
						{ name: "system", type: "boolean" },
						{ name: "_used", type: "boolean" }
					]
				}),
				proxy: {
					type: "rpc",
					rpcData: {
						service: "UserMgmt",
						method: "getUserList"
					}
				},
				remoteSort: true,
				sorters: [{
					direction: "ASC",
					property: "name"
				}]
			})
		});
		me.callParent(arguments);
	},

	getTopToolbarItems: function() {
		var me = this;
		var items = me.callParent(arguments);
		// Replace the default 'Add' button.
		Ext.Array.erase(items, 0, 1);
		Ext.Array.insert(items, 0, [{
			id: me.getId() + "-add",
			xtype: "splitbutton",
			text: _("Add"),
			icon: "images/add.png",
			iconCls: Ext.baseCSSPrefix + "btn-icon-16x16",
			handler: function() {
				this.showMenu();
			},
			menu: Ext.create("Ext.menu.Menu", {
				items: [
					{ text: _("Add"), value: "add" },
					{ text: _("Import"), value: "import" }
				],
				listeners: {
					scope: me,
					click: function(menu, item, e, eOpts) {
						this.onAddButton(item.value);
					}
				}
			})
		}]);
		// Add the 'Privileges' button.
		Ext.Array.insert(items, 2, [{
			id: me.getId() + "-privileges",
			xtype: "button",
			text: _("Privileges"),
			icon: "images/share.png",
			iconCls: Ext.baseCSSPrefix + "btn-icon-16x16",
			handler: me.onPrivilegesButton,
			scope: me,
			disabled: true,
			selectionConfig: {
				minSelections: 1,
				maxSelections: 1
			}
		}]);
		return items;
	},

	onAddButton: function(action) {
		var me = this;
		switch(action) {
		case "add":
			Ext.create("ESB.module.admin.privilege.user.User", {
				title: _("Add user"),
				listeners: {
					scope: me,
					submit: function() {
						this.doReload();
					}
				}
			}).show();
			break;
		case "import":
			Ext.create("ESB.module.admin.privilege.user.Import", {
				type: "user",
				listeners: {
					scope: me,
					finish: function() {
						this.doReload();
					}
				}
			}).show();
			break;
		}
	},

	onEditButton: function() {
		var me = this;
		var record = me.getSelected();
		Ext.create("ESB.module.admin.privilege.user.User", {
			title: _("Edit user"),
			rpcGetMethod: "getUser",
			rpcGetParams: {
				name: record.get("name")
			},
			listeners: {
				scope: me,
				submit: function() {
					this.doReload();
				}
			}
		}).show();
	},

	onPrivilegesButton: function() {
		var me = this;
		var record = me.getSelected();
		Ext.create("ESB.module.admin.privilege.user.SharedFolderPrivileges", {
			roleName: record.get("name")
		}).show();
	},

	doDeletion: function(record) {
		var me = this;
		ESB.Rpc.request({
			scope: me,
			callback: me.onDeletion,
			rpcData: {
				service: "UserMgmt",
				method: "deleteUser",
				params: {
					name: record.get("name")
				}
			}
		});
	}
});

ESB.WorkspaceManager.registerNode({
	id: "user",
	path: "/privilege",
	text: _("User"),
	icon16: "images/user.png",
	iconSvg: "images/user.svg",
	position: 10
});

ESB.WorkspaceManager.registerPanel({
	id: "users",
	path: "/privilege/user",
	text: _("Users"),
	position: 10,
	className: "ESB.module.admin.privilege.user.Users"
});
