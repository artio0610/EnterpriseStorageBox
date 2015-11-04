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
try {
	function exception_error_handler($errno, $errstr, $errfile, $errline) {
		switch ($errno) {
		case E_STRICT:
			break;
		default:
			throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
			break;
		}
	}
	set_error_handler("exception_error_handler");

	require_once("enterprisestoragebox/env.inc");
	require_once("enterprisestoragebox/config.inc"); // Must be included here
	require_once("enterprisestoragebox/session.inc");
	require_once("enterprisestoragebox/rpcproxy.inc");

	$session = &ESBSession::getInstance();
	$session->start();

	if($session->isAuthenticated()) {
		$session->validate();
		// Do not update last access time
		//$session->updateLastAccess();
	} else {
		throw new ESBException(ESBErrorMsg::E_SESSION_NOT_AUTHENTICATED);
	}

	$server = new ESBUploadRpcProxy();
	$server->handle();
	$server->cleanup();
} catch(Exception $e) {
	if (isset($server))
		$server->cleanup();
	header("Content-Type: text/html");
	print json_encode_safe(array(
		"success" => false, // required by ExtJS
		"responseText" => $e->getMessage(), // required by ExtJS
		"errors" => null, // required by ExtJS
		"code" => $e->getCode(),
		"message" => $e->getMessage(),
		"trace" => $e->__toString()
	));
}
?>
