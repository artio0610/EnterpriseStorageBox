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
require_once("enterprisestoragebox/util.inc");
require_once("enterprisestoragebox/rpcservice.inc");
require_once("enterprisestoragebox/notify.inc");

class ESBRpcServiceNotification extends ESBRpcServiceAbstract {
	/**
	 * Get the RPC service name.
	 */
	public function getName() {
		return "Notification";
	}

	/**
	 * Initialize the RPC service.
	 */
	public function initialize() {
		$this->registerMethod("get");
		$this->registerMethod("set");
		$this->registerMethod("isEnabled");
	}

	/**
	 * Get the notification configuration.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return An array containing the notification configuration.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 */
	function get($params, $context) {
		global $xmlConfig;
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		$result = array();
		// Get the configuration object.
		$xpath = "//system/notification/notifications";
		$object = $xmlConfig->get($xpath);
		if(is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Get the list of registered modules.
		$moduleMgr = &ESBModuleMgr::getInstance();
		$modules = $moduleMgr->getModules();
		foreach($modules as $modulev) {
			// Check if the module implements the ESBIModuleNotification
			// interface.
			if($modulev instanceof ESBIModuleNotification) {
				$config = $modulev->getNotificationConfig();
				foreach($config as $configk => $configv) {
					$enable = FALSE; // Default value.
					if(array_key_exists($configv['id'], $object)) {
						$enable = boolvalEx($object[$configv['id']]);
					}
					$result[] = array(
						  "id" => $configv['id'],
						  "type" => $configv['type'],
						  "title" => $configv['title'],
						  "enable" => $enable
					  );
				}
			}
		}
		return $result;
	}

	/**
	 * Set the notification configuration.
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
			  "type":"array",
			  "items":{
				  "type":"object",
				  "properties":{
					  "id":{"type":"string"},
					  "enable":{"type":"boolean"}
				  }
			  }
		  }');
		// Prepare the configuration object.
		$object = array();
		// Get the list of registered modules.
		$moduleMgr = &ESBModuleMgr::getInstance();
		$modules = $moduleMgr->getModules();
		foreach($modules as $modulev) {
			// Check if the module implements the ESBIModuleNotification
			// interface.
			if($modulev instanceof ESBIModuleNotification) {
				$config = $modulev->getNotificationConfig();
				foreach($config as $configk => $configv) {
					$enable = FALSE; // Default value.
					foreach($params as $paramk => $paramv) {
						if($paramv['id'] === $configv['id']) {
							$enable = array_boolval($paramv, 'enable');
							break;
						}
					}
					$object[$configv['id']] = $enable;
				}
			}
		}
		// Set the configuration object.
		$xpath = "//system/notification/notifications";
		if(FALSE === $xmlConfig->replace($xpath, $object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}
		// Notify the configuration changes.
		$dispatcher = &ESBNotifyDispatcher::getInstance();
		$dispatcher->notify(ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.notification.notifications", $object);
		// Return the configuration object.
		return $object;
	}

	/**
	 * Checks whether a notification is enabled.
	 * @param params An array containing the following fields:
	 *   \em id The notification identifier.
	 * @param context The context of the caller.
	 * @return TRUE if the serice is enabled, otherwise FALSE.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 */
	function isEnabled($params, $context) {
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
		// Get the configuration object.
		$xpath = sprintf("//system/notification/notifications/%s",
		  $params['id']);
		$object = $xmlConfig->get($xpath);
		if (is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		$result = boolvalEx($object);
		return $result;
	}
}

class ESBRpcServiceEmailNotification extends ESBRpcServiceAbstract {
	/**
	 * Get the RPC service name.
	 */
	public function getName() {
		return "EmailNotification";
	}

	/**
	 * Initialize the RPC service.
	 */
	public function initialize() {
		$this->registerMethod("get");
		$this->registerMethod("set");
		$this->registerMethod("sendTestEmail");
	}

	/**
	 * Get configuration object.
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
		$xpath = "//system/email";
		$object = $xmlConfig->get($xpath);
		if(is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Modify the result object.
		return array(
			"enable" => boolvalEx($object['enable']),
			"server" => $object['server'],
			"port" => intval($object['port']),
			"tls" => boolvalEx($object['tls']),
			"sender" => $object['sender'],
			"authenable" => boolvalEx($object['authentication']['enable']),
			"username" => $object['authentication']['username'],
			"password" => $object['authentication']['password'],
			"primaryemail" => $object['primaryemail'],
			"secondaryemail" => $object['secondaryemail']
		);
	}

	/**
	 * Set configuration object.
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
				  "server":{"type":"string"},
				  "port":{"type":"integer","minimum":1,"maximum":65535},
				  "tls":{"type":"boolean"},
				  "sender":{'.$GLOBALS['ESB_JSONSCHEMA_EMAIL'].'},
				  "authenable":{"type":"boolean"},
				  "username":{"type":"string"},
				  "password":{"type":"string"},
				  "primaryemail":{'.$GLOBALS['ESB_JSONSCHEMA_EMAIL'].'},
				  "secondaryemail":{'.$GLOBALS['ESB_JSONSCHEMA_EMAIL'].'}
			  }
		  }');
		// Prepare the configuration data.
		$object = array(
			"enable" => array_boolval($params, 'enable'),
			"server" => $params['server'],
			"port" => $params['port'],
			"tls" => array_boolval($params, 'tls'),
			"sender" => $params['sender'],
			"authentication" => array(
				"enable" => array_boolval($params, 'authenable'),
				"username" => $params['username'],
				"password" => $params['password']
			),
			"primaryemail" => $params['primaryemail'],
			"secondaryemail" => $params['secondaryemail']
		);
		// Set the configuration object.
		$xpath = "//system/email";
		if(FALSE === $xmlConfig->replace($xpath, $object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}
		// Notify the configuration changes.
		$dispatcher = &ESBNotifyDispatcher::getInstance();
		$dispatcher->notify(ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.email", $object);
		// Return the configuration object.
		return $object;
	}

	/**
	 * Send a test email. The email notification service must already be
	 * configured.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return None.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 * @throw E_MISC_FAILURE
	 * @throw E_CONFIG_DIRTY
	 */
	function sendTestEmail($params, $context) {
		global $xmlConfig;
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		// Check whether the module is marked dirty. In this case the
		// current configuration is not applied and sending an email might
		// fail.
		if($this->isModuleDirty("email")) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_DIRTY);
		}
		// Get the configuration object.
		$xpath = "//system/email";
		$object = $xmlConfig->get($xpath);
		if(is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Do some generic tests to find out if email notification is
		// already configured.
		if (!boolvalEx($object['enable'])) {
			throw new ESBException(ESBErrorMsg::E_MISC_FAILURE,
			  "Email notification service is disabled.");
		}
		foreach(array("server", "port", "sender", "primaryemail") as
		  $keyk => $keyv) {
			if(empty($object[$keyv])) {
				throw new ESBException(ESBErrorMsg::E_MISC_FAILURE,
				  "Email notification service is not configured.");
			}
		}
		// Send a test email.
		$hostname = php_uname('n');
		$to = $object['primaryemail'];
		if(!empty($object['secondaryemail'])) {
			$to .= sprintf(",%s", $object['secondaryemail']);
		}
		$subject = sprintf("Test message from %s", $hostname);
		$message = sprintf("This is an automatically generated mail message ".
		  "from the system notification service running on %s.", $hostname);
		if(!ESBUtil::mail($object['sender'], $to, $subject, $message)) {
			throw new ESBException(ESBErrorMsg::E_MISC_FAILURE,
			  "Failed to send email. Please check the logs.");
		}
	}
}

// Register the RPC service.
$rpcServiceMgr = &ESBRpcServiceMgr::getInstance();
$rpcServiceMgr->registerService(new ESBRpcServiceNotification());
$rpcServiceMgr->registerService(new ESBRpcServiceEmailNotification());
