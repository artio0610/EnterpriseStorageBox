/**
 * @ingroup webgui
 * @class ESB.selection.TapTreeModel
 * @derived Ext.selection.TreeModel
 * Automatically deselects the selected tree node after it has been clicked.
 */
Ext.define("ESB.selection.TapTreeModel", {
	extend: "Ext.selection.TreeModel",
	alias: "selection.taptreemodel",

	mode: "SINGLE",

	doSingleSelect: function(record, suppressEvent) {
		var me = this;
		me.callParent(arguments);
		me.deselectAll(true);
	}
});
