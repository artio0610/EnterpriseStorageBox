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
require_once("enterprisestoragebox/config.inc");
require_once("enterprisestoragebox/error.inc");
require_once("enterprisestoragebox/monit.inc");
require_once("enterprisestoragebox/initscript.inc");

class ESBModuleCollectd extends ESBModuleServiceAbstract
  implements ESBINotifyListener {
	/**
	 * Get the module name.
	 */
	public function getName() {
		return "collectd";
	}

	/**
	 * Defines the modules that if present should start before the service
	 * provided by this module.
	 * @return An array of modules.
	 */
	public function shouldStart() { return array("monit"); }

	/**
	 * Defines the modules that if present should be stopped after the
	 * service provided by this module.
	 * @return An array of modules.
	 */
	function shouldStop() { return array("monit"); }

	/**
	 * Generate the configuration.
	 * @throw E_EXEC_FAILED
	 */
	public function applyConfig() {
		$cmd = "export LANG=C; esb-mkconf collectd 2>&1";
		if (0 !== $this->exec($cmd, $output)) {
			throw new ESBException(ESBErrorMsg::E_EXEC_FAILED,
			  $cmd, implode("\n", $output));
		}
	}

	/**
	 * Stop the managed service.
	 */
	public function stopService() {
		// Disable monitoring of this service.
		$monit = new ESBMonit();
		$monit->unmonitor("collectd", TRUE);
		// Stop this service and unregister System-V style init script.
		$initd = new ESBSysVInitScript("collectd", FALSE);
		$initd->exec();
	}

	/**
	 * Start the managed service.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 */
	public function startService() {
		global $xmlConfig;
		$xpath = "//system/monitoring/perfstats";
		$object = $xmlConfig->get($xpath);
		if (is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		if (FALSE === boolvalEx($object['enable']))
			return;
		// Start this service and register System-V style init script.
		$initd = new ESBSysVInitScript("collectd", TRUE);
		$initd->exec();
		// Enable monitoring of this service.
		$monit = new ESBMonit();
		$monit->monitor("collectd");
		// Generate RRD graph images based on the latest configuration as a
		// background job (rendering may take some time).
		$cmd = "export LANG=C; esb-mkgraph 2>&1 &";
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
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.monitoring.perfstats",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_CREATE | ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.system.fstab.mntent",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_CREATE | ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.system.network.interfaces.interface",
		  array($this, "setDirty"));
		$moduleMgr = &ESBModuleMgr::getInstance();
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.monitoring.perfstats",
		  array($moduleMgr->getModule("monit"), "setDirty"));
	}
}

// Register module.
$moduleMgr = &ESBModuleMgr::getInstance();
$moduleMgr->registerModule(new ESBModuleCollectd());
