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
// require("js/esb/Rpc.js")

/**
 * @ingroup webgui
 * @class ESB.SessionManager
 */
Ext.define("ESB.SessionManager", {
	requires: [
		"ESB.Rpc"
	],
	singleton: true,

	config: {
		username: "",
		role: 0
	},

	constructor: function(config) {
		var me = this;
		me.initConfig(config);
	},

	/**
	 * Check whether the user has administrator privileges.
	 * Note, this is only used to show/hide elements in the WebGUI that
	 * should be visible to the administrator. Hacking the variable does
	 * not give users administrator permissions, this is validated in the
	 * backend and does not interact with the frontend.
	 * @return TRUE if the user has administrator privileges, otherwise
	 *   FALSE.
	 */
	isAdministrator: function() {
		return this.role & ESB.ROLE_ADMINISTRATOR;
	},

	logout: function() {
		var me = this;
		// Mask the whole document body.
		var bodyEl = Ext.getBody();
		if (bodyEl && bodyEl.isElement)
			bodyEl.mask("Logging out, please wait ...");
		// Notify backend.
		ESB.Rpc.request({
			scope: me,
			callback: function(id, success, response) {
				if (success) {
					// Force a page reload if the RPC returns successful.
					// Do not unmask the document.

					// Reset the session data.
					this.username = null;
					// Disable confirm dialog and reload the whole page.
					ESB.confirmPageUnload = false;
					document.location.reload(true);
				} else {
					// Unnask the document body and display the error.
					if (bodyEl && bodyEl.isElement)
						bodyEl.unmask();
					ESB.MessageBox.error(null, error);
				}
			},
			rpcData: {
				service: "Session",
				method: "logout"
			}
		});
	}
});