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

class ESBModuleQuota extends ESBModuleServiceAbstract
  implements ESBINotifyListener {
	/**
	 * Get the module name.
	 */
	public function getName() {
		return "quota";
	}

	/**
	 * Generate the configuration.
	 * @throw E_EXEC_FAILED
	 */
	public function applyConfig() {
		$cmd = "export LANG=C; esb-mkconf quota 2>&1";
		if(0 !== $this->exec($cmd, $output)) {
			throw new ESBException(ESBErrorMsg::E_EXEC_FAILED,
			  $cmd, implode("\n", $output));
		}
	}

	/**
	 * Delete the associated quota configuration after a filesystem has
	 * been deleted.
	 * @param type The event message type.
	 * @param path The event message path.
	 * @param object The modified configuration object.
	 */
	public function onDeleteFilesystem($type, $path, $object) {
		global $xmlConfig;
		// Does a quota configuration exists for the deleted filesystem?
		$xpath = sprintf("//system/storage/filesystem/quota[fsuuid='%s']",
		  $object['uuid']);
		$qObject = $xmlConfig->get($xpath);
		if(!is_null($qObject)) {
			// Execute RPC to delete the configuration object.
			ESBRpc::exec("Quota", "delete", array("uuid" => $qObject['uuid']),
			  $this->getAdminContext());
		}
	}

	/**
	 * Bind listeners.
	 */
	function bindListeners(ESBNotifyDispatcher $dispatcher) {
		$dispatcher->addListener(
		  ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.system.storage.filesystem",
		  array($this, "onDeleteFilesystem"));
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.storage.filesystem.quota",
		  array($this, "setDirty"));
	}
}

// Register module.
$moduleMgr = &ESBModuleMgr::getInstance();
$moduleMgr->registerModule(new ESBModuleQuota());
