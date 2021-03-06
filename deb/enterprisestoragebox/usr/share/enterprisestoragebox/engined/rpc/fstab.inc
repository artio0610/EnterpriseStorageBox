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
require_once("enterprisestoragebox/object.inc");
require_once("enterprisestoragebox/config.inc");
require_once("enterprisestoragebox/error.inc");
require_once("enterprisestoragebox/functions.inc");
require_once("enterprisestoragebox/rpcservice.inc");
require_once("enterprisestoragebox/notify.inc");

class ESBRpcServiceFsTab extends ESBRpcServiceAbstract {
	/**
	 * Get the RPC service name.
	 */
	public function getName() {
		return "FsTab";
	}

	/**
	 * Initialize the RPC service.
	 */
	public function initialize() {
		$this->registerMethod("enumerateEntries");
		$this->registerMethod("get");
		$this->registerMethod("set");
		$this->registerMethod("delete");
		$this->registerMethod("getByFsName");
		$this->registerMethod("getByDir");
	}

	/**
	 * Enumerate all fstab mount point entries.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return An array of objects. Each object represents a mount point
	 *   entry.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 */
	public function enumerateEntries($params, $context) {
		global $xmlConfig;
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		// Get the configuration object.
		$xpath = "//system/fstab/mntent";
		$objects = $xmlConfig->getList($xpath);
		if (is_null($objects)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		return $objects;
	}

	/**
	 * Get a mount point configuration object.
	 * @param params An array containing the following fields:
	 *   \em uuid The UUID of the configuration object.
	 * @param context The context of the caller.
	 * @return The requested configuration object.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 */
	function get($params, $context) {
		global $xmlConfig;
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, '{
			  "type":"object",
			  "properties":{
				  "uuid":{'.$GLOBALS['ESB_JSONSCHEMA_UUID'].'}
			  }
		  }');
		// Get the configuration object.
		$xpath = sprintf("//system/fstab/mntent[uuid='%s']", $params['uuid']);
		$object = $xmlConfig->get($xpath);
		if(is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Modify result object.
		$object['freq'] = intval($object['freq']);
		$object['passno'] = intval($object['passno']);
		$object['hidden'] = intval($object['hidden']);
		return $object;
	}

	/**
	 * Set a mount point configuration object. The given mount point in the
	 * filesystem will be created.
	 * @param params An array containing the following fields:
	 *   \em uuid The UUID of the configuration object.
	 *   \em fsname The block special device or filesystem UUID to be mounted.
	 *   \em dir The mount point for the filesystem.
	 *   \em type The type of the filesystem.
	 *   \em opts The mount options associated with the filesystem.
	 *   \em freq This option is used for these filesystems by the dump(8)
	 *   command to determine which filesystems need to be dumped.
	 *   \em passno This field is used by the fsck(8) program to determine
	 *   the order in which filesystem checks are done at reboot time.
	 *   \em hidden Set to 0 to write the mount point entry to /etc/fstab.
	 * @param context The context of the caller.
	 * @return The stored configuration object.
	 * @throw E_EXEC_FAILED
	 * @throw E_CONFIG_SET_OBJECT_FAILED
	 * @throw E_MISC_FAILURE
	 */
	public function set($params, $context) {
		global $xmlConfig;
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, '{
			  "type":"object",
			  "properties":{
				  "uuid":{'.$GLOBALS['ESB_JSONSCHEMA_UUID_UNDEFINED'].'},
				  "fsname":{"type":"string"},
				  "dir":{"type":"string"},
				  "type":{"type":"string"},
				  "opts":{"type":"string"},
				  "freq":{"type":"integer"},
				  "passno":{"type":"integer","enum":[0,1,2]}
			  }
		  }');
		// Get the filesystem backend.
		$fsb = ESBFilesystems::getBackendByType($params['type']);
		if (is_null($fsb)) {
			throw new ESBException(ESBErrorMsg::E_MISC_FAILURE, sprintf(
			  "No filesystem backend exists for type '%s'",
			  $params['type']));
		}
		// Prepare the configuration object.
		$object = array(
			  "uuid" => ($params['uuid'] == $GLOBALS['ESB_UUID_UNDEFINED']) ?
				ESBUtil::uuid() : $params['uuid'],
			  "fsname" => $params['fsname'],
			  "dir" => $params['dir'],
			  "type" => $params['type'],
			  "opts" => $params['opts'],
			  "freq" => $params['freq'],
			  "passno" => $params['passno'],
			  "hidden" => $fsb->hasFstabSupport() ? 0 : 1
		  );
		// Set the configuration object.
		$success = FALSE;
		if ($params['uuid'] == $GLOBALS['ESB_UUID_UNDEFINED']) {
			// Append object to configuration.
			$success = $xmlConfig->set("//system/fstab",
			  array("mntent" => $object));
		} else {
			// Update existing configuration object.
			$success = $xmlConfig->replace("//system/fstab/mntent" .
			  "[uuid='{$params['uuid']}']", $object);
		}
		if (FALSE === $success) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}
		// Notify configuration changes.
		$dispatcher = &ESBNotifyDispatcher::getInstance();
		$dispatcher->notify(($params['uuid'] == $GLOBALS['ESB_UUID_UNDEFINED']) ?
		  ESB_NOTIFY_CREATE : ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.fstab.mntent", $object);
		// Return the configuration object.
		return $object;
	}

	/**
	 * Delete a mount point configuration object. The mount point in the
	 * filesystem will be deleted.
	 * @param params An array containing the following fields:
	 *   \em uuid The UUID of the configuration object.
	 * @param context The context of the caller.
	 * @return The deleted configuration object.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 * @throw E_MISC_FAILURE
	 * @throw E_EXEC_FAILED
	 */
	public function delete($params, $context) {
		global $xmlConfig;
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, '{
			  "type":"object",
			  "properties":{
				  "uuid":{'.$GLOBALS['ESB_JSONSCHEMA_UUID'].'}
			  }
		  }');
		// Delete the configuration object.
		$xpath = sprintf("//system/fstab/mntent[uuid='%s']", $params['uuid']);
		return $this->deleteConfigObjectByPath($xpath,
		  "org.enterprisestoragebox.system.fstab.mntent");
	}

	/**
	 * Get a mount point configuration object by the given file system name,
	 * which may be a UUID or block special device.
	 * @param params An array containing the following fields:
	 *   \em id The file system identifier, e.g. the UUID or block special
	 *   device file like <ul>
	 *   \li /dev/sda1
	 *   \li 02532317-cc35-421e-b750-c6a484fb109a
	 *   \li /dev/disk/by-uuid/02532317-cc35-421e-b750-c6a484fb109a
	 *   \li 4B04EA317E4AA567
	 *   \li /dev/disk/by-uuid/4B04EA317E4AA567
	 *   </ul>
	 * @param context The context of the caller.
	 * @return The mount point configuration object if exists, otherwise FALSE.
	 */
	public function getByFsName($params, $context) {
		global $xmlConfig;
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, '{
			  "type":"object",
			  "properties":{
				  "id":{"type":"string"}
			  }
		  }');
		// Get the list of mount point configuration objects.
		$objects = $this->callMethod("enumerateEntries", NULL, $context);
		// Add function parameter to search argument list.
		$args = array();
		$args[] = $params['id'];
		// If the function parameter is a device file, then try to get the
		// file system UUID and add it to the search argument list. This is
		// done to increase the probability to find the fstab config object.
		if (is_devicefile($params['id'])) {
			$fs = ESBFilesystemFactory::get($params['id']);
			if (!is_null($fs) && $fs->exists() && $fs->hasUuid())
				$args[] = $fs->getUuid();
		}
		// Try to find the configuration object matching the given search
		// arguments. Note, the field 'fsname' may contain a device file
		// or a file system UUID.
		$result = FALSE;
		foreach ($objects as $objectk => $objectv) {
			foreach ($args as $argk => $argv) {
				// Device files must be handled seperate because the device
				// may contain partitions.
				if (is_devicefile($argv)) {
					// Check the name of the device special file, e.g.
					// - /dev/sdd1
					// - /dev/disk/by-uuid/4B04EA317E4AA567
					if (FALSE !== strpos($objectv['fsname'], $argv)) {
						$result = $objectv;
						break;
					}
				} else {
					if ($argv === $objectv['fsname']) {
						$result = $objectv;
						break;
					}
				}
			}
			if (FALSE !== $result)
				break;
		}
		return $result;
	}

	/**
	 * Get a mount point configuration object by the given mount point.
	 * @param params An array containing the following fields:
	 *   \em dir The mount point.
	 * @param context The context of the caller.
	 * @return The mount point configuration object if exists, otherwise FALSE.
	 */
	public function getByDir($params, $context) {
		global $xmlConfig;
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, '{
			  "type":"object",
			  "properties":{
				  "dir":{"type":"string"}
			  }
		  }');
		// Get the list of mount point configuration objects.
		$objects = $this->callMethod("enumerateEntries", NULL, $context);
		// Try to find the configuration object matching the given search
		// arguments.
		$result = FALSE;
		foreach($objects as $objectk => $objectv) {
			if($params['dir'] === $objectv['dir']) {
				$result = $objectv;
				break;
			}
		}
		return $result;
	}
}

// Register the RPC service.
$rpcServiceMgr = &ESBRpcServiceMgr::getInstance();
$rpcServiceMgr->registerService(new ESBRpcServiceFsTab());
