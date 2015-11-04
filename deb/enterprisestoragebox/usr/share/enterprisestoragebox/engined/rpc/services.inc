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
require_once("enterprisestoragebox/module.inc");
require_once("enterprisestoragebox/rpcservice.inc");

class ESBRpcServiceServices extends ESBRpcServiceAbstract {
	/**
	 * Get the RPC service name.
	 */
	public function getName() {
		return "Services";
	}

	/**
	 * Initialize the RPC service.
	 */
	public function initialize() {
		$this->registerMethod("getStatus");
	}

	/**
	 * Get the status of the modules that implement the
	 * ESBIModuleServiceStatus interface.
	 * @param params The method parameters.
	 * @param context The context of the caller.
	 * @return An array containing the module statistics.
	 * @throw E_EXEC_FAILED
	 */
	function getStatus($params, $context) {
		// Validate the RPC caller context.
		$this->validateMethodContext($context, array(
			  "role" => ESB_ROLE_ADMINISTRATOR
		  ));
		$status = array();
		// Get the list of registered modules.
		$moduleMgr = &ESBModuleMgr::getInstance();
		$modules = $moduleMgr->getModules();
		foreach($modules as $modulev) {
			// Check if the module implements the ESBIModuleServiceStatus
			// interface.
			if($modulev instanceof ESBIModuleServiceStatus) {
				$status[] = $modulev->getStatus();
			}
		}
		return array(
			"total" => count($status),
			"data" => $status
		);
	}
}

// Register the RPC service.
$rpcServiceMgr = &ESBRpcServiceMgr::getInstance();
$rpcServiceMgr->registerService(new ESBRpcServiceServices());
