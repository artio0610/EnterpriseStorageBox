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
require_once("enterprisestoragebox/initscript.inc");

class ESBModuleNfs extends ESBModuleServiceAbstract
  implements ESBINotifyListener, ESBIModuleServiceStatus, ESBIModuleZeroconf {
	/**
	 * Get the module name.
	 */
	public function getName() {
		return "nfs";
	}

	/**
	 * Defines the modules that if present should start before the service
	 * provided by this module.
	 * @return An array of modules.
	 */
	public function shouldStart() { return array("fstab"); }

	/**
	 * Defines the modules that if present should be stopped after the
	 * service provided by this module.
	 * @return An array of modules.
	 */
	function shouldStop() { return array("fstab"); }

	/**
	 * Generate the configuration.
	 * @throws E_EXEC_FAILED
	 */
	public function applyConfig() {
		$cmd = "export LANG=C; esb-mkconf nfsd 2>&1";
		if(0 !== $this->exec($cmd, $output)) {
			throw new ESBException(ESBErrorMsg::E_EXEC_FAILED,
			  $cmd, implode("\n", $output));
		}
	}

	/**
	 * Stop the managed service.
	 */
	public function stopService() {
		$initd = new ESBSysVInitScript("nfs-kernel-server", FALSE);
		$initd->exec();
	}

	/**
	 * Start the managed service.
	 */
	public function startService() {
		global $xmlConfig;
		$xpath = "//services/nfs";
		$object = $xmlConfig->get($xpath);
		if(is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		if (FALSE === boolvalEx($object['enable']))
			return;
		$initd = new ESBSysVInitScript("nfs-kernel-server", TRUE);
		$initd->exec();
	}

	/**
	 * Get the status of the managed service.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 */
	public function getStatus() {
		global $xmlConfig;
		$xpath = "//services/nfs";
		$object = $xmlConfig->get($xpath);
		if(is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		$initd = new ESBSysVInitScript("nfs-kernel-server");
		return array(
			"name" => $this->getName(),
			"title" => gettext("NFS"),
			"enabled" => boolvalEx($object['enable']),
			"running" => ($initd->status() == 0)
		);
	}

	/**
	 * Get the Zeroconf service configuration.
	 */
	public function getZeroconfConfig() {
		return array(
			  "id" => "nfs",
			  "title" => gettext("NFS")
		  );
	}

	/**
	 * Helper function to find out whether the given shared folder
	 * configuration object is used. If it is used, then mark the
	 * module as dirty.
	 * @param type The event message type.
	 * @param path The event message path.
	 * @param object The configuration object.
	 */
	final public function onSharedFolder($type, $path, $object) {
		global $xmlConfig;
		$xpath = sprintf("//services/nfs/shares/share[sharedfolderref='%s']",
		  $object['uuid']);
		if(TRUE === $xmlConfig->exists($xpath)) {
			$this->setDirty();
			$this->setDirtyByName("fstab");
		}
	}

	/**
	 * Bind listeners.
	 */
	function bindListeners(ESBNotifyDispatcher $dispatcher) {
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.services.nfs",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_CREATE | ESB_NOTIFY_MODIFY | ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.services.nfs.shares.share",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.shares.sharedfolder",
		  array($this, "onSharedFolder"));
		$moduleMgr = &ESBModuleMgr::getInstance();
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.services.nfs",
		  array($moduleMgr->getModule("zeroconf"), "setDirty"));
    }
}

// Register module.
$moduleMgr = &ESBModuleMgr::getInstance();
$moduleMgr->registerModule(new ESBModuleNfs());
