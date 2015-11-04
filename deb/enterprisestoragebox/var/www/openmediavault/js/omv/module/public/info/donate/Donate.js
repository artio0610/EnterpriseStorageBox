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
// require("js/esb/workspace/panel/Panel.js")

/**
 * @class ESB.module.public.info.donate.Donate
 * @derived ESB.workspace.panel.Panel
 */
Ext.define("ESB.module.public.info.donate.Donate", {
	extend: "ESB.workspace.panel.Panel",

	initComponent: function() {
		var me = this;
		me.html = me.createBox("EnterpriSestorageBox is free, but costs money and time to produce, support and distribute. This gift to the developer would demonstrate your appreciation of this software and help its future development." +
		  "<br/>" + 
		  "To help EnterpriSestorageBox in a monetary way, you can show your appreciation with a donation via PayPal." +
		  "<br/><br/>" +
		  "<form action='https://www.paypal.com/cgi-bin/webscr' method='post' target='_blank'>" +
		  "<input type='hidden' name='cmd' value='_s-xclick'>" +
		  "<input type='hidden' name='hosted_button_id' value='95MF5UQ66PW2E'>" +
		  "<div class='x-text-center'>" +
		  "<input type='image' src='images/donate-btn.gif' border='0' name='submit' alt='PayPal - The safer, easier way to pay online!'>" +
		  "</div>" +
		  "</form>");
		me.callParent(arguments);
	},

	createBox: function(msg) {
		return [ '<div class="x-box-aboutbox">', msg, '</div>' ].join('');
	}
});

ESB.WorkspaceManager.registerNode({
	id: "donate",
	path: "/info",
	text: _("Donate"),
	icon16: "images/donate.png",
	iconSvg: "images/donate.svg",
	position: 10
});

ESB.WorkspaceManager.registerPanel({
	id: "donate",
	path: "/info/donate",
	text: _("Donate"),
	position: 10,
	className: "ESB.module.public.info.donate.Donate"
});
