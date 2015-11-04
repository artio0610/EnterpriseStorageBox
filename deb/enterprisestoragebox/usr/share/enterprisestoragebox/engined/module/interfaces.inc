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

class ESBModuleInterfaces extends ESBModuleServiceAbstract
  implements ESBINotifyListener {
	/**
	 * Get the module name.
	 */
	public function getName() {
		return "interfaces";
	}

	/**
	 * Defines the modules that if present should stop before the service
	 * provided by this module.
	 * @return An array of modules. Returns an empty array if no
	 *   dependencies exist.
	 */
	function stopAfter() { return array("networking"); }

	/**
	 * Generate the configuration.
	 * @throw E_EXEC_FAILED
	 */
	public function applyConfig() {
		$cmd = "export LANG=C; esb-mkconf interfaces 2>&1";
		if (0 !== $this->exec($cmd, $output)) {
			throw new ESBException(ESBErrorMsg::E_EXEC_FAILED,
			  $cmd, implode("\n", $output));
		}
	}

	/**
	 * Stop the managed service.
	 */
	public function stopService() {
		$this->execTasks("delete");
	}

	/**
	 * Helper function to add a new task when an interface is deleted.
	 * @param type The event message type.
	 * @param path The event message path.
	 * @param object The configuration object.
	 * @return None.
	 */
	final public function onDeleteInterface($type, $path, $object) {
		if ("bond" == $object['type'])
			$this->addTask("delete", "deleteBondInterface", $object);
	}

	/**
	 * Helper method to remove a bond interface.
	 * @param params The method parameters.
	 */
	final public function deleteBondInterface($params) {
		// Note, this may not be necessary in Debian Jessie.
		// See http://backdrift.org/manage-linux-bonding-without-ifenslave-using-sysfs
		$cmd = sprintf("echo '-%s' > /sys/class/net/bonding_masters",
		  $params['devicename']);
		$this->exec($cmd);
	}

	/**
	 * Bind listeners.
	 */
	function bindListeners(ESBNotifyDispatcher $dispatcher) {
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.network.hostname",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_CREATE | ESB_NOTIFY_MODIFY | ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.system.network.interfaces.interface",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.system.network.interfaces.interface",
		  array($this, "onDeleteInterface"));
		$moduleMgr = &ESBModuleMgr::getInstance();
		$dispatcher->addListener(
		  ESB_NOTIFY_CREATE | ESB_NOTIFY_MODIFY | ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.system.network.interfaces.interface",
		  array($moduleMgr->getModule("networking"), "setDirty"));
    }
}

// Register module.
$moduleMgr = &ESBModuleMgr::getInstance();
$moduleMgr->registerModule(new ESBModuleInterfaces());
