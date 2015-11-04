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

class ESBModuleMonit extends ESBModuleServiceAbstract
  implements ESBINotifyListener, ESBIModuleNotification {
	/**
	 * Get the module name.
	 */
	public function getName() {
		return "monit";
	}

	/**
	 * Defines the modules that if present should start before the service
	 * provided by this module.
	 * @return An array of modules.
	 */
	public function shouldStart() { return array("email"); }

	/**
	 * Generate the configuration.
	 * @throw E_EXEC_FAILED
	 */
	public function applyConfig() {
		# Build the configuration.
		$cmd = "export LANG=C; esb-mkconf monit 2>&1";
		if (0 !== $this->exec($cmd, $output)) {
			throw new ESBException(ESBErrorMsg::E_EXEC_FAILED,
			  $cmd, implode("\n", $output));
		}
		# Test the new configuration.
		$cmd = "export LANG=C; monit -t 2>&1";
		if (0 !== $this->exec($cmd, $output)) {
			throw new ESBException(ESBErrorMsg::E_EXEC_FAILED,
			  $cmd, implode("\n", $output));
		}
	}

	/**
	 * Start the managed service.
	 */
	public function startService() {
		$initd = new ESBSysVInitScript("monit", TRUE);
		$initd->invoke("reload");
	}

	/**
	 * Get the notification configuration.
	 */
	public function getNotificationConfig() {
		return array(
			  array(
				  "id" => "monitprocevents",
				  "type" => getText("System"),
				  "title" => gettext("Process monitoring")
			  ),
			  array(
				  "id" => "monitloadavg",
				  "type" => getText("System"),
				  "title" => gettext("Load average")
			  ),
			  array(
				  "id" => "monitcpuusage",
				  "type" => getText("System"),
				  "title" => gettext("CPU usage")
			  ),
			  array(
				  "id" => "monitmemoryusage",
				  "type" => getText("System"),
				  "title" => gettext("Memory usage")
			  ),
			  array(
				  "id" => "monitfilesystems",
				  "type" => getText("Storage"),
				  "title" => gettext("Filesystems")
			  )
		  );
	}

	/**
	 * Bind listeners.
	 */
	function bindListeners(ESBNotifyDispatcher $dispatcher) {
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.email",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.notification.notifications",
		  array($this, "setDirty"));
    }
}

// Register module.
$moduleMgr = &ESBModuleMgr::getInstance();
$moduleMgr->registerModule(new ESBModuleMonit());
