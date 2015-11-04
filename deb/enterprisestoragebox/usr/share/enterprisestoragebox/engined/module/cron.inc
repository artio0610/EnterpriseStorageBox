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
require_once("enterprisestoragebox/initscript.inc");

class ESBModuleCron extends ESBModuleServiceAbstract
  implements ESBINotifyListener {
	/**
	 * Get the module name.
	 */
	public function getName() {
		return "cron";
	}

	/**
	 * Defines the modules that if present should start before the service
	 * provided by this module.
	 * @return An array of modules.
	 */
	public function shouldStart() { return array("email"); }

	/**
	 * Defines the modules that if present should be stopped after the
	 * service provided by this module.
	 * @return An array of modules.
	 */
	function shouldStop() { return array("email"); }

	/**
	 * Generate the configuration.
	 * @throw E_EXEC_FAILED
	 */
	public function applyConfig() {
		$cmd = "export LANG=C; esb-mkconf cron 2>&1";
		if(0 !== $this->exec($cmd, $output)) {
			throw new ESBException(ESBErrorMsg::E_EXEC_FAILED,
			  $cmd, implode("\n", $output));
		}
	}

	/**
	 * Start the managed service.
	 */
	public function startService() {
        // Changes to the cron files will be auto-detected by the cron
        // daemon via inotify by default, but in some situations it is
        // necessary to force a reload. According to the cron man-page,
        // it is only refreshed once an hour.
        // It is necessary to restart the service if the system time or
        // timezone has been changed, so a simple 'reload' can't be
        // used here.
		$initd = new ESBSysVInitScript("cron");
		$initd->restart();
	}

	/**
	 * Bind listeners.
	 */
	function bindListeners(ESBNotifyDispatcher $dispatcher) {
		$dispatcher->addListener(
		  ESB_NOTIFY_CREATE | ESB_NOTIFY_MODIFY | ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.system.crontab.job",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.time",
		  array($this, "setDirty"));
    }
}

// Register module.
$moduleMgr = &ESBModuleMgr::getInstance();
$moduleMgr->registerModule(new ESBModuleCron());
