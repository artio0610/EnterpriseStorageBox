<?php
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
require_once("enterprisestoragebox/module.inc");
require_once("enterprisestoragebox/initscript.inc");

class ESBModuleNetworking extends ESBModuleServiceAbstract
  implements ESBINotifyListener {
	/**
	 * Get the module name.
	 */
	public function getName() {
		return "networking";
	}

	/**
	 * Stop the managed service.
	 */
	public function stopService() {
		$initd = new ESBSysVInitScript("networking");
		$initd->stop();
	}

	/**
	 * Start the managed service.
	 */
	public function startService() {
		$initd = new ESBSysVInitScript("networking");
		$initd->start();
	}

	/**
	 * Bind listeners.
	 */
	function bindListeners(ESBNotifyDispatcher $dispatcher) {
		// Bind listeners from within your modules. Check the 'interfaces'
		// module for example.
	}
}

// Register module.
$moduleMgr = &ESBModuleMgr::getInstance();
$moduleMgr->registerModule(new ESBModuleNetworking());
