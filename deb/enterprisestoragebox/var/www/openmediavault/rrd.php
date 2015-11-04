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
	require_once("enterprisestoragebox/globals.inc");
	require_once("enterprisestoragebox/config.inc"); // Must be included here
	require_once("enterprisestoragebox/session.inc");
	require_once("enterprisestoragebox/functions.inc");

	$session = &ESBSession::getInstance();
	$session->start();

	if($session->isAuthenticated()) {
		$session->validate();
		// Do not update last access time
		//$session->updateLastAccess();
	} else {
		throw new ESBException(ESBErrorMsg::E_SESSION_NOT_AUTHENTICATED);
	}

	// The parameter 'name' may not contain the characters '..'. This is
	// because of security reasons: the given canonicalized absolute
	// path MUST be below the given image directory.
	if(1 == preg_match("/\.\./", $_GET['name'])) {
		throw new ESBException(ESBErrorMsg::E_RPC_INVALID_PARAMS,
		  sprintf(gettext("The parameter '%s' contains forbidden two-dot symbols"),
		  "name"));
	}
	// Build the image filename. If it does not exist, then display an error
	// image by default.
	$filename = build_path(array($GLOBALS['ESB_RRDGRAPH_DIR'], $_GET['name']));
	if(!file_exists($filename))
		$filename = $GLOBALS['ESB_RRDGRAPH_ERROR_IMAGE'];
	$fd = fopen($filename, "r");
	header("Content-type: image/png");
	fpassthru($fd);
} catch(Exception $e) {
	header("Content-Type: text/html");
	printf("Error #".$e->getCode().":<br/>%s", str_replace("\n", "<br/>",
	  $e->__toString()));
}
?>
