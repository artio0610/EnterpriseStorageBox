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
	require_once("enterprisestoragebox/env.inc");
	require_once("enterprisestoragebox/config.inc"); // Must be included here
	require_once("enterprisestoragebox/session.inc");
	require_once("enterprisestoragebox/rpcproxy.inc");

	$session = &ESBSession::getInstance();
	$session->start();

	$server = new ESBJsonRpcProxy();
	$server->handle();
	$server->cleanup();
} catch(Exception $e) {
	if (isset($server))
		$server->cleanup();
	header("Content-Type: application/json");
	print json_encode_safe(array(
		"response" => null,
		"error" => array(
			"code" => $e->getCode(),
			"message" => $e->getMessage(),
			"trace" => $e->__toString()
		)
	));
}
?>
