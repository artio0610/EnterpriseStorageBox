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
require_once("enterprisestoragebox/error.inc");
require_once("enterprisestoragebox/rpcservice.inc");
require_once("enterprisestoragebox/notify.inc");

class ESBRpcServiceTftp extends ESBRpcServiceAbstract {
	/**
	 * Get the RPC service name.
	 */
	public function getName() {
		return "TFTP";
	}

	/**
	 * Initialize the RPC service.
	 */
	public function initialize() {
		$this->registerMethod("get");
		$this->registerMethod("set");
	}

	/**
	 * Get the configuration object.
	 * @param params The method parameters.
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
		// Get the configuration object.
		$xpath = "//services/tftp";
		$object = $xmlConfig->get($xpath);
		if(is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Modify the result data.
		$object['enable'] = boolvalEx($object['enable']);
		$object['port'] = intval($object['port']);
		$object['blocksize'] = intval($object['blocksize']);
		$object['retransmit'] = intval($object['retransmit']);
		$object['allownewfiles'] = boolvalEx($object['allownewfiles']);
		return $object;
	}

	/**
	 * Set the configuration object.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return The stored configuration object.
	 * @throw E_CONFIG_SET_OBJECT_FAILED
	 */
	function set($params, $context) {
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
				  "retransmit":{"type":"integer","minimum":0},
				  "blocksize":{"type":"integer","minimum":512,"maximum":65464},
				  "allownewfiles":{"type":"boolean"},
				  "sharedfolderref":{'.
					$GLOBALS['ESB_JSONSCHEMA_UUID_NONE'].'},
				  "extraoptions":{"type":"string"}
			  }
		  }');
		// Prepare the configuration data.
		$object = array(
			"enable" => array_boolval($params, 'enable'),
			"port" => $params['port'],
			"retransmit" => $params['retransmit'],
			"blocksize" => $params['blocksize'],
			"allownewfiles" => array_boolval($params, 'allownewfiles'),
			"sharedfolderref" => $params['sharedfolderref'],
			"extraoptions" => $params['extraoptions']
		);
		// Set the configuration object.
		$xpath = "//services/tftp";
		if(FALSE === $xmlConfig->replace($xpath, $object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}
		// Notify configuration changes.
		$dispatcher = &ESBNotifyDispatcher::getInstance();
		$dispatcher->notify(ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.services.tftp", $object);
		// Return the configuration object.
		return $object;
	}
}

// Register the RPC service.
$rpcServiceMgr = &ESBRpcServiceMgr::getInstance();
$rpcServiceMgr->registerService(new ESBRpcServiceTftp());
