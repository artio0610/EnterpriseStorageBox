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

/**
 * @ingroup webgui
 * @class ESB.data.Download
 */
Ext.define("ESB.data.Download", {
	/**
	 * Initialize the hidden IFrame used to handle download
	 * requests.
	 * @param url The URL of the download script.
	 */
	init: function(url) {
		var me = this;
		me.iframe = Ext.getBody().createChild({
			tag: "iframe",
			src: url
		});
		me.iframe.setStyle("visibility", "hidden");
		me.iframe.setStyle("display", "none");
	},

	/**
	 * Sends a download request to a remote server.
	 * @param service The name/class of the service to be executed.
	 * @param method The method name to be executed.
	 * @param params The parameters of the method to be executed as object.
	 * @return None.
	 */
	request: function(service, method, params) {
		var me = this;
		var form = Ext.DomQuery.selectNode("form",
		  me.iframe.dom.contentDocument);
		form.service.setAttribute("value", service);
		form.method.setAttribute("value", method);
		// Additional parameters must be encoded as string because they are
		// submitted as POST parameters. They will be decoded by the RPC
		// implementation automatically.
		var value = Ext.JSON.encode(params).htmlspecialchars();
		form.params.setAttribute("value", value);
		// Submit form to send download request.
		form.submit();
	}
});

Ext.onReady(function() {
	ESB.Download = Ext.create("ESB.data.Download");
	ESB.Download.init("download.php");
});
