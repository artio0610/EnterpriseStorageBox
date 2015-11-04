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
 * @class ESB.module.public.info.support.Support
 * @derived ESB.workspace.panel.Panel
 */
Ext.define("ESB.module.public.info.support.Support", {
	extend: "ESB.workspace.panel.Panel",

	initComponent: function() {
		var me = this;
		me.html = "<form style='overflow: auto; height: 100%;'>";
		me.html += me.createBox(
		  "<b>Project homepage</b><br/><a href='http://www.enterprisestoragebox.org' target='_blank'>http://www.enterprisestoragebox.org</a><br/><br/>" +
		  "<b>Wiki</b><br/><a href='http://wiki.enterprisestoragebox.org' target='_blank'>http://wiki.enterprisestoragebox.org</a><br/><br/>" +
		  "<b>Forums</b><br/><a href='http://forums.enterprisestoragebox.org' target='_blank'>http://forums.enterprisestoragebox.org</a><br/><br/>" +
		  "<b>Documentation</b><br/><a href='http://docs.enterprisestoragebox.org' target='_blank'>http://docs.enterprisestoragebox.org</a><br/><br/>" +
		  "<b>Bugtracker</b><br/><a href='http://bugtracker.enterprisestoragebox.org' target='_blank'>http://bugtracker.enterprisestoragebox.org</a><br/><br/>" +
		  "<b>Contributors</b><br/><a href='http://wiki.enterprisestoragebox.org/index.php?title=Contributors' target='_blank'>http://wiki.enterprisestoragebox.org/index.php?title=Contributors</a><br/>");
		me.html += "</form>";
		me.callParent(arguments);
	},

	createBox: function(msg) {
		return [ '<div class="x-box-aboutbox">', msg, '</div>' ].join('');
	}
});

ESB.WorkspaceManager.registerNode({
	id: "support",
	path: "/info",
	text: _("Support"),
	icon16: "images/help.png",
	iconSvg: "images/help.svg",
	position: 20
});

ESB.WorkspaceManager.registerPanel({
	id: "support",
	path: "/info/support",
	text: _("Support"),
	position: 10,
	className: "ESB.module.public.info.support.Support"
});
