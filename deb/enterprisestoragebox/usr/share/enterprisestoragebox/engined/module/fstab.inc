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
require_once("enterprisestoragebox/system.inc");

class ESBModuleFsTab extends ESBModuleServiceAbstract
  implements ESBINotifyListener {
	/**
	 * Get the module name.
	 */
	public function getName() {
		return "fstab";
	}

	/**
	 * Generate the configuration.
	 * @throw E_EXEC_FAILED
	 */
	public function applyConfig() {
		$cmd = "export LANG=C; esb-mkconf fstab 2>&1";
		if(0 !== $this->exec($cmd, $output)) {
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
	 * Start the managed service.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 * @throw E_MISC_FAILURE
	 */
	public function startService() {
		global $xmlConfig;
		// Make sure all mount points are mounted.
		$xpath = "//system/fstab/mntent";
		$objects = $xmlConfig->getList($xpath);
		if (is_null($objects)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Process all configured mount points and mount them if necessary.
		foreach ($objects as $objectk => $objectv) {
			$me = new ESBMntEnt($objectv['fsname'], $objectv['dir']);
			// Does the directory exist?
			if (FALSE === $me->mkDir()) {
				throw new ESBException(ESBErrorMsg::E_MISC_FAILURE,
				  sprintf("Failed to create the directory '%s'",
				  $me->getMountPoint()));
			}
			// Is it mounted?
			if (FALSE === $me->isMounted()) {
				// If it's no loop or bind mount then skip mounting if the
				// filesystem does not exist.
				if (is_uuid($objectv['fsname']) || is_devicefile(
				  $objectv['fsname'])) {
					$fs = ESBFilesystemFactory::get($objectv['fsname']);
					if (is_null($fs) || !$fs->exists())
						continue;
				}
				// Mount it.
				if (FALSE === $me->mount()) {
					throw new ESBException(ESBErrorMsg::E_MISC_FAILURE,
					  sprintf("Failed to mount '%s': %s", $objectv['fsname'],
					  $me->getLastError()));
				}
			}
		}
	}

	/**
	 * Helper function to add a new task when a fstab entry has been deleted.
	 * @param type The event message type.
	 * @param path The event message path.
	 * @param object The configuration object.
	 * @return None.
	 */
	final public function onDelete($type, $path, $object) {
		$this->addTask("delete", "deleteEntry", $object);
	}

	/**
	 * Helper method to umount a fstab entry and remove it.
	 * @param params The method parameters.
	 * @throw E_MISC_FAILURE
	 */
	final public function deleteEntry($params) {
		$me = new ESBMntEnt($params['fsname'], $params['dir']);
		// Check whether the file system is mounted and unmount it if
		// necessary.
		if (TRUE === $me->isMounted()) {
			if (FALSE === $me->umount(TRUE, TRUE)) {
				throw new ESBException(ESBErrorMsg::E_MISC_FAILURE,
				  sprintf("Failed to unmount '%s': %s", $params['fsname'],
				  $me->getLastError()));
			}
		}
		// Check whether the directory is still a mount point. If this is
		// the case, then throw an error, otherwise unlinking the
		// directory might delete the file systems data. This can happen
		// when the file system is unmounted but busy (e.g. NFS exports).
		if (TRUE === $me->isMountPoint()) {
			throw new ESBException(ESBErrorMsg::E_MISC_FAILURE,
			  sprintf("Removing the directory '%s' has been aborted, ".
			  "the resource is busy", $params['dir']));
		}
		// Unlink the mount point directory.
		if (FALSE === $me->unlinkDir()) {
			throw new ESBException(ESBErrorMsg::E_MISC_FAILURE,
			  sprintf("Failed to unlink the directory '%s': %s",
			  $params['dir'], $me->getLastError()));
		}
	}

	/**
	 * Bind listeners.
	 */
	function bindListeners(ESBNotifyDispatcher $dispatcher) {
		$dispatcher->addListener(
		  ESB_NOTIFY_CREATE | ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.system.fstab.mntent",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.system.fstab.mntent",
		  array($this, "onDelete"));
        $moduleMgr = &ESBModuleMgr::getInstance();
        $dispatcher->addListener(
          ESB_NOTIFY_CREATE | ESB_NOTIFY_DELETE,
          "org.enterprisestoragebox.system.fstab.mntent",
          array($moduleMgr->getModule("monit"), "setDirty"));
	}
}

// Register module.
$moduleMgr = &ESBModuleMgr::getInstance();
$moduleMgr->registerModule(new ESBModuleFsTab());
