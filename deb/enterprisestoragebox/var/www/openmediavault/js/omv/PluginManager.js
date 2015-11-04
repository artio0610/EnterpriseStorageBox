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
 * @class ESB.PluginManager
 * @deprecated
 * Provides a registry of available plugin classes indexed by a mnemonic
 * code known as the plugin's ptype.
 */
Ext.define("ESB.PluginManager", {
	singleton: true,
	alternateClassName: "ESB.PluginMgr",

	/**
	 * Register a plugin.
	 * @param config The plugin configuration.An object which may contain
	 *   the following properties:
	 *   \em ptype The mnemonic string by which the plugin may be looked up.
	 *   \em id The id of the item.
	 *   \em className The class name.
	 *   \em text The text to be displayed.
	 * @return None
	 * @deprecated
	 */
	register: function(config) {
		var parts = config.className.split(".");
		var alias = Ext.String.format("esb.plugin.{0}.{1}.{2}", config.ptype,
		  config.id, parts.pop().toLowerCase());
		var classObject = Ext.ClassManager.get(config.className);
		if (Ext.isDefined(config.position))
			classObject.position = config.position;
		if (Ext.isDefined(config.text))
			classObject.title = config.text;
		Ext.ClassManager.setAlias(config.className, alias);
		// Raise an error.
		Ext.Error.raise(Ext.String.format("Please set an alias for the " +
		  "class '{0}', e.g. '{1}'. The alias format must look like: " +
		  "esb.plugin.<ptype>.<id>.<xxx>", config.className, alias));
	}
});
