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
// require("js/esb/workspace/dashboard/View.js")
// require("js/esb/data/Store.js")
// require("js/esb/data/Model.js")
// require("js/esb/data/proxy/Rpc.js")
// require("js/esb/workspace/grid/Panel.js")
// require("js/esb/util/Format.js")

/**
 * @class ESB.module.admin.dashboard.view.NetworkInterfaces
 * @derived ESB.workspace.dashboard.View
 */
Ext.define("ESB.module.admin.dashboard.view.NetworkInterfaces", {
	extend: "ESB.workspace.dashboard.View",
	alias: "widget.module.admin.dashboard.view.networkinterfaces",
	requires: [
		"ESB.workspace.grid.Panel",
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.util.Format"
	],

	height: 200,
	refreshInterval: 10000,

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			items: [ me.gp = Ext.create("ESB.workspace.grid.Panel", {
				disableLoadMaskOnLoad: true,
				hideTopToolbar: true,
				hidePagingToolbar: true,
				disableSelection: true,
				stateful: true,
				stateId: "85bc79a2-f7f5-11e4-a5ad-0002b3a176b4",
				columns: [{
					text: _("Name"),
					sortable: true,
					dataIndex: "devicename",
					stateId: "devicename",
					width: 45
				},{
					text: _("Address"),
					sortable: true,
					stateId: "address",
					renderer: function(value, metaData, record) {
						var tpl = Ext.create("Ext.XTemplate",
						  _("IPv4"),': {[Ext.util.Format.defaultValue(values.address, "-")]}<br/>',
						  _("IPv6"),': {[Ext.util.Format.defaultValue(values.address6, "-")]}');
						return tpl.apply(record.data);
					},
					flex: 1
				},{
					text: _("Netmask"),
					sortable: true,
					stateId: "netmask",
					renderer: function(value, metaData, record) {
						var tpl = Ext.create("Ext.XTemplate",
						  _("IPv4"),': {[Ext.util.Format.defaultValue(values.netmask, "-")]}<br/>',
						  _("IPv6"),': {[Ext.util.Format.defaultValue((values.netmask6 < 0) ? "" : values.netmask6, "-")]}');
						return tpl.apply(record.data);
					},
					flex: 1
				},{
					text: _("Gateway"),
					sortable: true,
					stateId: "gateway",
					renderer: function(value, metaData, record) {
						var tpl = Ext.create("Ext.XTemplate",
						  _("IPv4"),': {[Ext.util.Format.defaultValue(values.gateway, "-")]}<br/>',
						  _("IPv6"),': {[Ext.util.Format.defaultValue(values.gateway6, "-")]}');
						return tpl.apply(record.data);
					},
					flex: 1
				},{
					xtype: "emptycolumn",
					text: _("MTU"),
					sortable: true,
					dataIndex: "mtu",
					stateId: "mtu",
					width: 45
				},{
					text: _("Speed"),
					sortable: true,
					dataIndex: "speed",
					stateId: "speed",
					renderer: function(value) {
						if (-1 == value)
							return "-";
						return Ext.String.format("{0} Mbits/sec", value);
					},
					flex: 1
				},{
					xtype: "booleaniconcolumn",
					text: _("Link"),
					sortable: true,
					dataIndex: "link",
					stateId: "link",
					align: "center",
					width: 80,
					resizable: false,
					iconCls:  Ext.baseCSSPrefix + "grid-cell-booleaniconcolumn-rj45"
				}],
				viewConfig: {
					trackOver: false
				},
				store: Ext.create("ESB.data.Store", {
					autoLoad: true,
					model: ESB.data.Model.createImplicit({
						idProperty: "devicename",
						fields: [
							{ name: "devicename", type: "string" },
							{ name: "address", type: "string" },
							{ name: "netmask", type: "string" },
							{ name: "gateway", type: "string" },
							{ name: "method6", type: "string" },
							{ name: "address6", type: "string" },
							{ name: "netmask6", type: "int" },
							{ name: "gateway6", type: "string" },
							{ name: "mtu", type: "string" },
							{ name: "link", type: "boolean" },
							{ name: "speed", type: "int" }
						]
					}),
					proxy: {
						type: "rpc",
						rpcData: {
							service: "Network",
							method: "enumerateDevicesList",
							options: {
								updatelastaccess: false
							}
						}
					},
					sorters: [{
						direction: "ASC",
						property: "devicename"
					}]
				})
			}) ]
		});
		me.callParent(arguments);
	},

	doRefresh: function() {
		var me = this;
		me.gp.doReload();
	}
});
