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
// require("js/esb/workspace/panel/RrdGraph.js")

/**
 * @class ESB.module.admin.diagnostic.system.plugin.Cpu
 * @derived ESB.workspace.panel.RrdGraph
 */
Ext.define("ESB.module.admin.diagnostic.system.plugin.Cpu", {
	extend: "ESB.workspace.panel.RrdGraph",
	alias: "esb.plugin.diagnostic.system.cpu",

	title: _("CPU usage"),
	rrdGraphName: "cpu-0"
});
