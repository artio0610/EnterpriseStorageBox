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
// require("js/esb/Rpc.js")
// require("js/esb/data/Download.js")
// require("js/esb/data/Store.js")
// require("js/esb/data/Model.js")
// require("js/esb/data/proxy/Rpc.js")

/**
 * @class ESB.module.admin.diagnostic.log.Logs
 * @derived ESB.workspace.grid.Panel
 */
Ext.define("ESB.module.admin.diagnostic.log.Logs", {
	extend: "ESB.workspace.grid.Panel",
	requires: [
		"Ext.ClassManager",
		"ESB.Rpc",
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc"
	],

	hideAddButton: true,
	hideEditButton: true,
	hideDeleteButton: true,
	hidePagingToolbar: false,

	logPlugins: [],
	activePlugin: null,

	initComponent: function() {
		var me = this;
		// Get the registered plugins and initialize them.
		var classes = Ext.ClassManager.getNamesByExpression(
		  "esb.plugin.diagnostic.log.*");
		Ext.Array.each(classes, function(name) {
			me.logPlugins.push(Ext.create(name));
		});
		// Display the 'Syslog' per default.
		me.activePlugin = me.getPluginById("syslog");
		// Initialize store.
		Ext.apply(me, {
			stateful: me.activePlugin.stateful,
			stateId: me.activePlugin.stateId,
			columns: me.activePlugin.columns,
			store: me.createStore()
		});
		me.callParent(arguments);
	},

	getTopToolbarItems: function() {
		var me = this;
		return [{
			id: me.getId() + "-type",
			xtype: "combo",
			queryMode: "local",
			store: Ext.create("Ext.data.JsonStore", {
				fields: [ "id", "text" ],
				data: me.logPlugins,
				sorters: [{
					direction: "ASC",
					property: "text"
				}]
			}),
			displayField: "text",
			valueField: "id",
			allowBlank: false,
			editable: false,
			triggerAction: "all",
			value: me.activePlugin.text,
			listeners: {
				scope: me,
				change: function(combo, value) {
					// Update active plugin.
					this.activePlugin = this.getPluginById(value);
					if(!this.activePlugin || !this.activePlugin.isLogPlugin)
						return;
					// Create a new store.
					var store = this.createStore();
					// Reconfigure grid to use new store and colums.
					this.stateful = this.activePlugin.stateful;
					this.stateId = this.activePlugin.stateId;
					this.reconfigure(store, this.activePlugin.columns);
					if(this.stateful)
						this.initState();
					// Bind new store to paging toolbar.
					this.getPagingToolbar().bindStore(this.store);
				}
			}
		},{
			id: me.getId() + "-clear",
			xtype: "button",
			text: _("Clear"),
			icon: "images/trashcan.png",
			iconCls: Ext.baseCSSPrefix + "btn-icon-16x16",
			handler: Ext.Function.bind(me.onClearButton, me, [ me ]),
			scope: me
		},{
			id: me.getId() + "-download",
			xtype: "button",
			text: _("Download"),
			icon: "images/download.png",
			iconCls: Ext.baseCSSPrefix + "btn-icon-16x16",
			handler: Ext.Function.bind(me.onDownloadButton, me, [ me ]),
			scope: me
		}];
	},

	/**
	 * Handler that is called when the 'Clear' button in the top toolbar
	 * is pressed.
	 */
	onClearButton: function() {
		var me = this;
		var msg = _("Do you really want to clear the log file?");
		ESB.MessageBox.show({
			title: _("Confirmation"),
			msg: msg,
			buttons: Ext.Msg.YESNO,
			icon: Ext.Msg.QUESTION,
			scope: me,
			fn: function(answer) {
				if(answer !== "yes")
					return;
				// Execute RPC.
				ESB.Rpc.request({
					scope: me,
					callback: function(id, success, response) {
						this.doReload();
					},
					relayErrors: false,
					rpcData: {
						service: this.activePlugin.rpcService,
						method: this.activePlugin.rpcClearMethod,
						params: this.activePlugin.rpcParams
					}
				});
			}
		});
	},

	/**
	 * Handler that is called when the 'Download' button in the top toolbar
	 * is pressed.
	 */
	onDownloadButton: function() {
		var me = this;
		ESB.Download.request(me.activePlugin.rpcService,
		  me.activePlugin.rpcDownloadMethod, me.activePlugin.rpcParams);
	},

	/**
	 * Helper function to create a store.
	 */
	createStore: function() {
		var me = this;
		return Ext.create("ESB.data.Store", {
			autoLoad: true,
			pageSize: 50,
			remoteSort: me.activePlugin.rpcRemoteSort,
			model: ESB.data.Model.createImplicit({
				idProperty: "rownum",
				fields: me.activePlugin.rpcFields
			}),
			proxy: {
				type: "rpc",
				rpcData: {
					service: me.activePlugin.rpcService,
					method: me.activePlugin.rpcGetMethod
				},
				appendSortParams: true,
				extraParams: me.activePlugin.rpcParams
			},
			sorters: [{
				direction: "DESC",
				property: "rownum"
			}]
		});
	},

	/**
	 * Helper function to get the active log plugin object.
	 * @return The log plugin object.
	 */
	getActivePlugin: function() {
		return this.activePlugin;
	},

	/**
	 * Helper function to get a log plugin by its identifier.
	 * @param id The log plugin identifier.
	 * @return The log plugin object or NULL.
	 */
	getPluginById: function(id) {
		var me = this;
		var plugin = Ext.Array.findBy(me.logPlugins, function(item, index) {
			return item.id == id;
		}, me);
		return plugin;
	}
});

ESB.WorkspaceManager.registerPanel({
	id: "logs",
	path: "/diagnostic/log",
	text: _("Logs"),
	position: 10,
	className: "ESB.module.admin.diagnostic.log.Logs"
});
