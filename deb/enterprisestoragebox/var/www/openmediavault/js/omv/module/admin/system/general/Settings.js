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
// require("js/esb/form/field/SslCertificateComboBox.js")

/**
 * @class ESB.module.admin.system.general.Settings
 * @derived ESB.workspace.form.Panel
 */
Ext.define("ESB.module.admin.system.general.Settings", {
	extend: "ESB.workspace.form.Panel",
	requires: [
		"ESB.form.field.SslCertificateComboBox"
	],

	rpcService: "WebGui",
	rpcGetMethod: "getSettings",
	rpcSetMethod: "setSettings",
	plugins: [{
		ptype: "linkedfields",
		correlations: [{
			name: [
				"sslport",
				"forcesslonly",
				"sslcertificateref"
			],
			conditions: [
				{ name: "enablessl", value: true }
			],
			properties: [
				"!allowBlank",
				"!readOnly"
			]
		}]
	}],

	getFormItems: function() {
		var me = this;
		return [{
			xtype: "fieldset",
			title: _("General settings"),
			fieldDefaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "numberfield",
				name: "port",
				fieldLabel: _("Port"),
				vtype: "port",
				minValue: 1,
				maxValue: 65535,
				allowDecimals: false,
				allowBlank: false,
				value: 80
			},{
				xtype: "numberfield",
				name: "timeout",
				fieldLabel: _("Session timeout"),
				minValue: 0,
				maxValue: 30,
				allowDecimals: false,
				allowBlank: false,
				value: 5,
				plugins: [{
					ptype: "fieldinfo",
					text: _("The session timeout time in minutes. Set to 0 to disable automatic logout.")
				}]
			}]
		},{
			xtype: "fieldset",
			title: _("Secure connection"),
			fieldDefaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "checkbox",
				name: "enablessl",
				fieldLabel: _("Enable SSL/TLS"),
				checked: false,
				boxLabel: _("Enable secure connection.")
			},{
				xtype: "sslcertificatecombo",
				name: "sslcertificateref",
				fieldLabel: _("Certificate"),
				allowNone: true,
				allowBlank: true,
				readOnly: true,
				plugins: [{
					ptype: "fieldinfo",
					text: _("The SSL certificate.")
				}]
			},{
				xtype: "numberfield",
				name: "sslport",
				fieldLabel: _("Port"),
				vtype: "port",
				minValue: 1,
				maxValue: 65535,
				allowDecimals: false,
				allowBlank: false,
				readOnly: true,
				value: 443
			},{
				xtype: "checkbox",
				name: "forcesslonly",
				fieldLabel: _("Force SSL/TLS"),
				checked: false,
				readOnly: true,
				boxLabel: _("Force secure connection only.")
			}]
		}];
	}
});

ESB.WorkspaceManager.registerPanel({
	id: "settings",
	path: "/system/general",
	text: _("Web Administration"),
	position: 10,
	className: "ESB.module.admin.system.general.Settings"
});
