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
// require("js/esb/workspace/panel/Panel.js")
// require("js/esb/Rpc.js")
// require("js/esb/window/MessageBox.js")

/**
 * @ingroup webgui
 * @class ESB.workspace.panel.RrdGraph
 * @derived ESB.workspace.panel.Panel
 * Panel that is displaying RRD graphs.
 * @param rrdGraphName (required) The name of the RRD graph file. Such a
 *   file looks like xxxxx-(hour|day|week|month|year).png.
 */
Ext.define("ESB.workspace.panel.RrdGraph", {
	extend: "ESB.workspace.panel.Panel",
	requires: [
		"ESB.Rpc",
		"ESB.window.MessageBox"
	],
	uses: [
		"Ext.XTemplate"
	],

	hideTopToolbar: false,
	autoLoadData: false,

	initComponent: function() {
		var me = this;
		var tpl = me.getTemplate();
		Ext.apply(me, {
			html: tpl.apply({
				name: me.rrdGraphName,
				time: Ext.Date.now()
			})
		});
		me.callParent(arguments);
	},

	getTemplate: function() {
		return Ext.create("Ext.XTemplate",
		  '<div class="x-panel-rrdgraph">',
		  '  <img src="rrd.php?name={name}-hour.png&time={time}" alt="RRD graph - by hour"/><br/>',
		  '  <img src="rrd.php?name={name}-day.png&time={time}" alt="RRD graph - by day"/><br/>',
		  '  <img src="rrd.php?name={name}-week.png&time={time}" alt="RRD graph - by week"/><br/>',
		  '  <img src="rrd.php?name={name}-month.png&time={time}" alt="RRD graph - by month"/><br/>',
		  '  <img src="rrd.php?name={name}-year.png&time={time}" alt="RRD graph - by year"/>',
		  '</div>');
	},

	doLoad: function() {
		var me = this;
		ESB.RpcObserver.request({
			msg: _("Generating graphs ..."),
			rpcDelay: 1000,
			rpcData: {
				service: "Rrd",
				method: "generate"
			},
			scope: me,
			finish: function() {
				var tpl = this.getTemplate();
				this.update(tpl.apply({
					name: this.rrdGraphName,
					time: Ext.Date.now()
				}));
			}
		});
	}
});
