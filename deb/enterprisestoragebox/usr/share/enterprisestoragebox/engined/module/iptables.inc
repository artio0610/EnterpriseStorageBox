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
require_once("enterprisestoragebox/error.inc");

class ESBModuleIptables extends ESBModuleServiceAbstract
  implements ESBINotifyListener {
	/**
	 * Get the module name.
	 */
	public function getName() {
		return "iptables";
	}

	/**
	 * Generate the configuration.
	 * @throw E_EXEC_FAILED
	 */
	public function applyConfig() {
		$cmd = "export LANG=C; esb-mkconf iptables 2>&1";
		if (0 !== $this->exec($cmd, $output)) {
			throw new ESBException(ESBErrorMsg::E_EXEC_FAILED,
			  $cmd, implode("\n", $output));
		}
	}

	/**
	 * Start the managed service.
	 * @throw E_EXEC_FAILED
	 */
	public function startService() {
		$cmd = "export LANG=C; /etc/network/if-pre-up.d/enterprisestoragebox-iptables 2>&1";
		if (0 !== $this->exec($cmd, $output)) {
			throw new ESBException(ESBErrorMsg::E_EXEC_FAILED,
			  $cmd, implode("\n", $output));
		}
	}

	/**
	 * Bind listeners.
	 */
	function bindListeners(ESBNotifyDispatcher $dispatcher) {
		$dispatcher->addListener(
		  ESB_NOTIFY_CREATE | ESB_NOTIFY_MODIFY | ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.system.network.iptables.rule",
		  array($this, "setDirty"));
    }
}

// Register module.
$moduleMgr = &ESBModuleMgr::getInstance();
$moduleMgr->registerModule(new ESBModuleIptables());
