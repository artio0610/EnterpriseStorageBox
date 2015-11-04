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
 * @class ESB.form.field.SharedFolderComboBox
 * @derived Ext.form.field.ComboBox
 * Display all existing shared folders in a combobox control.
 * @param allowNone Set to TRUE to display the 'None' list entry.
 *   Defaults to FALSE.
 * @param noneText The text of the 'None' list entry.
 */
Ext.define("ESB.form.field.SharedFolderComboBox", {
	extend: "Ext.form.field.ComboBox",
	alias: "widget.sharedfoldercombo",
	requires: [
		"ESB.data.Store",
		"ESB.data.Model",
		"ESB.data.proxy.Rpc",
		"ESB.data.identifier.Empty"
	],
	uses: [
		"ESB.module.admin.privilege.sharedfolder.SharedFolder",
		"ESB.module.admin.privilege.sharedfolder.Privileges"
	],

	allowNone: false,
	noneText: _("None"),

	emptyText: _("Select a shared folder ..."),
	allowBlank: false,
	editable: false,
	forceSelection: true,
	triggerAction: "all",
	displayField: "description",
	valueField: "uuid",
	triggers: {
		add: {
			cls: Ext.baseCSSPrefix + "form-add-trigger",
			handler: "onTrigger2Click"
		},
		show: {
			cls: Ext.baseCSSPrefix + "form-search-trigger",
			handler: "onTrigger3Click"
		}
	},

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
						{ name: "description", type: "string" },
						{ name: "name", type: "string" },
						{ name: "mntentref", type: "string" }
					]
				}),
				proxy: {
					type: "rpc",
					rpcData: {
						service: "ShareMgmt",
						method: "enumerateSharedFolders"
					}
				},
				sorters: [{
					direction: "ASC",
					property: "name"
				}],
				listeners: {
					scope: me,
					load: function(store, records, options) {
						if(me.allowNone === false)
							return;
						// Append the 'None' entry.
						store.insert(0, {
							uuid: "",
							description: me.noneText
						});
					}
				}
			})
		});
		me.callParent(arguments);
	},

	onRender: function() {
		var me = this;
		me.callParent(arguments);
		// Add tooltip to trigger button.
		var trigger = me.getTrigger("add");
		Ext.tip.QuickTipManager.register({
			target: trigger.getEl(),
			text: _("Add")
		});
		trigger = me.getTrigger("show");
		Ext.tip.QuickTipManager.register({
			target: trigger.getEl(),
			text: _("Show privileges")
		});
	},

	onTrigger1Click: function() {
		var me = this;
		me.onTriggerClick();
	},

	onTrigger2Click: function() {
		var me = this;
		if(me.readOnly || me.disabled)
			return;
		Ext.create("ESB.module.admin.privilege.sharedfolder.SharedFolder", {
			title: _("Add shared folder"),
			uuid: ESB.UUID_UNDEFINED,
			listeners: {
				scope: me,
				submit: function(dlg, data) {
					// Reload the combobox store to display and select the new
					// created shared folder
					var lastOptions = this.store.lastOptions;
					Ext.apply(lastOptions, {
						scope: me,
						callback: function(records, operation, success) {
							if (success) {
								var record;
								Ext.Array.each(records, function(r) {
									// Compare the shared folder name and the
									// UUID of the used file system to identify
									// it explicit
									var name = r.get("name");
									var mntentref = r.get("mntentref");
									if ((name === data.name) && (mntentref ===
									  data.mntentref)) {
										record = r;
										return false;
									}
								});
								if (record) {
									this.setValue(record.get(this.valueField));
								}
							}
						},
						scope: this
					});
					this.store.reload(lastOptions);
				}
			}
		}).show();
	},

	onTrigger3Click: function() {
		var me = this;
		if(me.disabled)
			return;
		var uuid = me.getValue();
		if(Ext.isEmpty(uuid))
			return;
		Ext.create("ESB.module.admin.privilege.sharedfolder.Privileges", {
			uuid: uuid,
			readOnly: me.readOnly
		}).show();
	},

	getErrors: function(value) {
		var me = this, errors = me.callParent(arguments);
		if(me.allowNone === true) {
			if(!me.allowBlank && (value === me.noneText)) {
				errors.push(me.blankText);
			}
		}
		return errors;
	}
});