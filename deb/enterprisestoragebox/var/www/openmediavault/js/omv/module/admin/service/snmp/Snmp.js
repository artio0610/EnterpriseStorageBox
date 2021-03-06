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
// require("js/esb/workspace/form/Panel.js")
// require("js/esb/form/field/Password.js")

/**
 * @class ESB.module.admin.service.snmp.Settings
 * @derived ESB.workspace.form.Panel
 */
Ext.define("ESB.module.admin.service.snmp.Settings", {
	extend: "ESB.workspace.form.Panel",

	rpcService: "SNMP",
	plugins: [{
		ptype: "linkedfields",
		correlations: [{
			name: [
				"trapcommunity",
				"traphost",
				"trapport"
			],
			conditions: [
				{ name: "trapenable", value: true }
			],
			properties: [
				"!allowBlank",
				"!readOnly"
			]
		},{
			name: "community",
			conditions: [
				{ name: "version", value: "2c" }
			],
			properties: [
				"!allowBlank",
				"visible"
			]
		},{
			name: [
				"securitylevel",
				"username"
			],
			conditions: [
				{ name: "version", value: "3" }
			],
			properties: [
				"!allowBlank",
				"show"
			]
		},{
			name: [
				"authtype",
				"authpassphrase"
			],
			conditions: [
				{ name: "version", value: "3" },
				{ name: "securitylevel", value: "noauth", op: "!==" }
			],
			properties: [
				"!allowBlank",
				"show"
			]
		},{
			name: [
				"privtype",
				"privpassphrase"
			],
			conditions: [
				{ name: "version", value: "3" },
				{ name: "securitylevel", value: "priv" }
			],
			properties: [
				"!allowBlank",
				"show"
			]
		}]
	}],

	getFormItems: function() {
		return [{
			xtype: "fieldset",
			title: _("General settings"),
			fieldDefaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "checkbox",
				name: "enable",
				fieldLabel: _("Enable"),
				checked: false
			},{
				xtype: "textfield",
				name: "syslocation",
				fieldLabel: _("Location"),
				allowBlank: false,
				plugins: [{
					ptype: "fieldinfo",
					text: _("Location information, e.g. physical location of this system.")
				}]
			},{
				xtype: "textfield",
				name: "syscontact",
				fieldLabel: _("Contact"),
				allowBlank: false,
				plugins: [{
					ptype: "fieldinfo",
					text: _("Contact information, e.g. name or email address of the person responsible for this system.")
				}]
			},{
				xtype: "combo",
				name: "version",
				fieldLabel: _("Version"),
				queryMode: "local",
				store: [
					[ "2c", _("SNMP version 1/2c") ],
					[ "3", _("SNMP version 3") ]
				],
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				value: "2c"
			},{
				xtype: "textfield",
				name: "community",
				fieldLabel: _("Community"),
				allowBlank: false,
				value: "public"
			},{
				xtype: "textfield",
				name: "username",
				fieldLabel: _("Username"),
				hidden: true,
				allowBlank: true
			},{
				xtype: "combo",
				name: "securitylevel",
				fieldLabel: _("Security level"),
				queryMode: "local",
				store: [
					[ "noauth", _("No authentication and no privacy") ],
					[ "auth", _("Authentication and no privacy") ],
					[ "priv", _("Authentication and privacy") ]
				],
				hidden: true,
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				value: "noauth"
			},{
				xtype: "combo",
				name: "authtype",
				fieldLabel: _("Authentication type"),
				queryMode: "local",
				store: [
					[ "MD5", "MD5" ],
					[ "SHA", "SHA" ]
				],
				hidden: true,
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				value: "MD5"
			},{
				xtype: "passwordfield",
				name: "authpassphrase",
				fieldLabel: _("Authentication passphrase"),
				hidden: true,
				allowBlank: true,
				minLength: 8
			},{
				xtype: "combo",
				name: "privtype",
				fieldLabel: _("Privacy type"),
				queryMode: "local",
				store: [
					[ "DES", "DES" ],
					[ "AES", "AES" ]
				],
				hidden: true,
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				value: "DES"
			},{
				xtype: "passwordfield",
				name: "privpassphrase",
				fieldLabel: _("Privacy passphrase"),
				hidden: true,
				allowBlank: true,
				minLength: 8
			},{
				xtype: "textarea",
				name: "extraoptions",
				fieldLabel: _("Extra options"),
				allowBlank: true
			}]
		},{
			xtype: "fieldset",
			title: _("Traps"),
			fieldDefaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "checkbox",
				name: "trapenable",
				fieldLabel: _("Enable"),
				checked: false
			},{
				xtype: "textfield",
				name: "trapcommunity",
				fieldLabel: _("Community"),
				allowBlank: true
			},{
				xtype: "textfield",
				name: "traphost",
				fieldLabel: _("Host"),
				allowBlank: true
			},{
				xtype: "numberfield",
				name: "trapport",
				fieldLabel: _("Port"),
				allowBlank: true,
				allowDecimals: false,
				minValue: 1,
				maxValue: 65535,
				vtype: "port"
			}]
		}];
	}
});

ESB.WorkspaceManager.registerNode({
	id: "snmp",
	path: "/service",
	text: _("SNMP"),
	icon16: "images/snmp.png",
	iconSvg: "images/snmp.svg"
});

ESB.WorkspaceManager.registerPanel({
	id: "settings",
	path: "/service/snmp",
	text: _("Settings"),
	position: 10,
	className: "ESB.module.admin.service.snmp.Settings"
});
