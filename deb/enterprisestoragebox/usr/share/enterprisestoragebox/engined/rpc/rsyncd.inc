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

class ESBRpcServiceRsyncd extends ESBRpcServiceAbstract {
	/**
	 * Get the RPC service name.
	 */
	public function getName() {
		return "Rsyncd";
	}

	/**
	 * Initialize the RPC service.
	 */
	public function initialize() {
		$this->registerMethod("getSettings");
		$this->registerMethod("setSettings");
		$this->registerMethod("getModuleList");
		$this->registerMethod("getModule");
		$this->registerMethod("setModule");
		$this->registerMethod("deleteModule");
	}

	/**
	 * Get settings.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return The stored configuration object.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 */
	function getSettings($params, $context) {
		global $xmlConfig;
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		// Get the configuration object.
		$xpath = "//services/rsync/server";
		$object = $xmlConfig->get($xpath);
		if(is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Remove useless attributes.
		unset($object['modules']);
		return $object;
	}

	/**
	 * Set settings.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return The stored configuration object.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 * @throw E_CONFIG_SET_OBJECT_FAILED
	 */
	function setSettings($params, $context) {
		global $xmlConfig;
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, '{
			  "type":"object",
			  "properties":{
				  "enable":{"type":"boolean"},
				  "port":{"type":"integer","minimum":1,"maximum":65535},
				  "extraoptions":{"type":"string"}
			  }
		  }');
		// Get the existing configuration object.
		$xpath = "//services/rsync/server";
		$object = $xmlConfig->get($xpath);
		if(is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Update the configuration object.
		$object = array_merge($object, array(
			  "enable" => array_boolval($params, 'enable'),
			  "port" => $params['port'],
			  "extraoptions" => $params['extraoptions']
		  ));
		if(FALSE === $xmlConfig->replace($xpath, $object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}
		// Notify configuration changes.
		$dispatcher = &ESBNotifyDispatcher::getInstance();
		$dispatcher->notify(ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.services.rsync.server", $object);
		// Return the configuration object.
		return $object;
	}

	/**
	 * Get list of module configuration objects.
	 * @param params An array containing the following fields:
	 *   \em start The index where to start.
	 *   \em limit The number of objects to process.
	 *   \em sortfield The name of the column used to sort.
	 *   \em sortdir The sort direction, ASC or DESC.
	 * @param context The context of the caller.
	 * @return An array containing the requested objects. The field \em total
	 *   contains the total number of objects, \em data contains the object
	 *   array. An exception will be thrown in case of an error.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 */
	public function getModuleList($params, $context) {
		global $xmlConfig;
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		// Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, '{
			  "type":"object",
			  "properties":{
				  "start":{"type":"integer"},
				  "limit":{'.$GLOBALS['ESB_JSONSCHEMA_COUNTFIELD'].'},
				  "sortfield":{'.$GLOBALS['ESB_JSONSCHEMA_SORTFIELD'].'},
				  "sortdir":{'.$GLOBALS['ESB_JSONSCHEMA_SORTDIR'].'}
			  }
		  }');
		// Get the configuration object.
		$xpath = "//services/rsync/server/modules/module";
		$objects = $xmlConfig->getList($xpath);
		if(is_null($objects)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Add additional share informations.
		foreach($objects as $objectk => &$objectv) {
			$objectv['sharedfoldername'] = gettext("n/a");
			// Modify result data.
			$objectv['enable'] = boolvalEx($objectv['enable']);
			$objectv['readonly'] = boolvalEx($objectv['readonly']);
			$objectv['writeonly'] = boolvalEx($objectv['writeonly']);
			$objectv['list'] = boolvalEx($objectv['list']);
			$objectv['authusers'] = boolvalEx($objectv['authusers']);
			$objectv['usechroot'] = boolvalEx($objectv['usechroot']);
			$objectv['users'] = !is_array($objectv['users']) ?
			  array() : $objectv['users']['user'];
			// Get the shared folder configuration object.
			$sfobject = $xmlConfig->get("//system/shares/sharedfolder[".
			  "uuid='{$objectv['sharedfolderref']}']");
			if(!is_null($sfobject) && !empty($sfobject)) {
				$objectv['sharedfoldername'] = $sfobject['name'];
			}
		}
		// Filter result.
		return $this->applyFilter($objects, $params['start'],
		  $params['limit'], $params['sortfield'], $params['sortdir']);
	}

	/**
	 * Get a module configuration object.
	 * @param params An array containing the following fields:
	 *   \em uuid The UUID of the configuration object.
	 * @param context The context of the caller.
	 * @return The requested configuration object.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 */
	public function getModule($params, $context) {
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
		$xpath = sprintf("//services/rsync/server/modules/module[uuid='%s']",
		  $params['uuid']);
		$object = $xmlConfig->get($xpath);
		if(is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Modify result data.
		$object['enable'] = boolvalEx($object['enable']);
		$object['readonly'] = boolvalEx($object['readonly']);
		$object['writeonly'] = boolvalEx($object['writeonly']);
		$object['list'] = boolvalEx($object['list']);
		$object['authusers'] = boolvalEx($object['authusers']);
		$object['usechroot'] = boolvalEx($object['usechroot']);
		$object['users'] = !is_array($object['users']) ?
		  array() : $object['users']['user'];
		return $object;
	}

	/**
	 * Set a module configuration object.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return The stored configuration object.
	 * @throw E_CONFIG_SET_OBJECT_FAILED
	 */
	public function setModule($params, $context) {
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
				  "enable":{"type":"boolean"},
				  "sharedfolderref":{'.$GLOBALS['ESB_JSONSCHEMA_UUID'].'},
				  "name":{'.$GLOBALS['ESB_JSONSCHEMA_SHARENAME'].'},
				  "comment":{"type":"string"},
				  "uid":{"type":"string"},
				  "gid":{"type":"string"},
				  "readonly":{"type":"boolean"},
				  "writeonly":{"type":"boolean"},
				  "maxconnections":{"type":"integer","minimum":0},
				  "list":{"type":"boolean"},
				  "hostsallow":{"type":"string"},
				  "hostsdeny":{"type":"string"},
				  "authusers":{"type":"boolean"},
				  "usechroot":{"type":"boolean"},
				  "users":{
					  "type":"array",
					  "items":{
						  "type":"object",
						  "properties":{
							  "name":{"type":"string"},
							  "password":{"type":"string"}
						  }
					  }
				  },
				  "extraoptions":{"type":"string"}
			  }
		  }');
		// Prepare the configuration object.
		$object = array(
			  "uuid" => ($params['uuid'] == $GLOBALS['ESB_UUID_UNDEFINED']) ?
				ESBUtil::uuid() : $params['uuid'],
			  "enable" => array_boolval($params, 'enable'),
			  "sharedfolderref" => $params['sharedfolderref'],
			  "name" => $params['name'],
			  "uid" => $params['uid'],
			  "gid" => $params['gid'],
			  "comment" => $params['comment'],
			  "readonly" => array_boolval($params, 'readonly'),
			  "writeonly" => array_boolval($params, 'writeonly'),
			  "maxconnections" => $params['maxconnections'],
			  "list" => array_boolval($params, 'list'),
			  "hostsallow" => $params['hostsallow'],
			  "hostsdeny" => $params['hostsdeny'],
			  "authusers" => array_boolval($params, 'authusers'),
			  "usechroot" => array_boolval($params, 'usechroot'),
			  "users" => !empty($params['users']) ?
				array("user" => $params['users']) : array(),
			  "extraoptions" => $params['extraoptions']
		  );
		// Set the configuration object.
		$success = FALSE;
		if($params['uuid'] == $GLOBALS['ESB_UUID_UNDEFINED']) {
			// Check uniqueness:
			// - Module name
			$xpath = sprintf("//services/rsync/server/modules/module".
			  "[name='%s']", $params['name']);
			if (TRUE === $xmlConfig->exists($xpath)) {
				throw new ESBException(ESBErrorMsg::E_CONFIG_OBJECT_UNIQUENESS,
				  sprintf(gettext("A module with the name '%s' already exists"),
				  $params['name']));
			}
			// Append object to configuration.
			$success = $xmlConfig->set("//services/rsync/server/modules",
			  array("module" => $object));
		} else {
			// Update existing configuration object.
			$success = $xmlConfig->replace("//services/rsync/server/modules/".
			  "module[uuid='{$params['uuid']}']", $object);
		}
		if(FALSE === $success) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}
		// Notify configuration changes.
		$dispatcher = &ESBNotifyDispatcher::getInstance();
		$dispatcher->notify(($params['uuid'] == $GLOBALS['ESB_UUID_UNDEFINED']) ?
		  ESB_NOTIFY_CREATE : ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.services.rsync.server.modules.module", $object);
		// Return the configuration object.
		return $object;
	}

	/**
	 * Delete a module configuration object.
	 * @param params An array containing the following fields:
	 *   \em uuid The UUID of the configuration object.
	 * @param context The context of the caller.
	 * @return The deleted configuration object.
	 */
	public function deleteModule($params, $context) {
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
		$xpath = sprintf("//services/rsync/server/modules/module[uuid='%s']",
		  $params['uuid']);
		return $this->deleteConfigObjectByPath($xpath,
		  "org.enterprisestoragebox.services.rsync.server.modules.module");
	}
}

// Register the RPC service.
$rpcServiceMgr = &ESBRpcServiceMgr::getInstance();
$rpcServiceMgr->registerService(new ESBRpcServiceRsyncd());
