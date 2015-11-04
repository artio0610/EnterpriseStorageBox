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
// require("js/esb/data/identifier/Empty.js")

/**
 * @ingroup webgui
 * @class ESB.form.SshCertificateComboBox
 * @derived Ext.form.field.ComboBox
 * Display all existing SSH certificates in a combobox control.
 * @param allowNone Set to TRUE to display the 'None' list entry.
 *   Defaults to FALSE.
 * @param noneText The text of the 'None' list entry.
 */
Ext.define("ESB.form.field.SshCertificateComboBox", {
	extend: "Ext.form.field.ComboBox",
	alias: [ "widget.sshcertificatecombo" ],
	requires: [
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.data.identifier.Empty"
	],

	allowNone: false,
	noneText: _("None"),

	emptyText: _("Select a SSH certificate ..."),
	editable: false,
	displayField: "comment",
	valueField: "uuid",
	forceSelection: true,

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			store: Ext.create("ESB.data.Store", {
				autoLoad: true,
				model: ESB.data.Model.createImplicit({
					identifier: "empty",
					idProperty: "uuid",
					fields: [
						{ name: "uuid", type: "string" },
						{ name: "comment", type: "string" }
					]
				}),
				proxy: {
					type: "rpc",
					rpcData: {
						service: "CertificateMgmt",
						method: "getSshList"
					}
				},
				listeners: {
					scope: me,
					load: function(store, records, options) {
						if (me.allowNone === false)
							return;
						// Push the 'None' entry to the beginning of
						// dropdown the list.
						store.insert(0, {
							uuid: "",
							comment: me.noneText
						});
					}
				}
			})
		});
		me.callParent(arguments);
	},

	getErrors: function(value) {
		var me = this, errors = me.callParent(arguments);
		if (me.allowNone === true) {
			if (!me.allowBlank && (value === me.noneText)) {
				errors.push(me.blankText);
			}
		}
		return errors;
	}
});
