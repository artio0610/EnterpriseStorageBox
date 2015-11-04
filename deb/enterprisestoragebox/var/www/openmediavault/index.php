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
	require_once("enterprisestoragebox/session.inc");
	require_once("enterprisestoragebox/htmlpage.inc");

	$session = &ESBSession::getInstance();
	$session->start();

	if($session->isAuthenticated() && !$session->isTimeout()) {
		$session->validate();
		$session->updateLastAccess();

		$page = new ESBControlPanel(($session->getRole() === ESB_ROLE_USER) ?
		  ESBControlPanel::MODE_USER : ESBControlPanel::MODE_ADMINISTRATOR);
		$page->render();
	} else {
		$session->destroy();

		$page = new ESBLoginPage();
		$page->render();
	}
} catch(Exception $e) {
	// Send an error message to the web server's error log.
	error_log($e->getMessage());
	// Print the error message.
	header("Content-Type: text/html");
	printf("Error #".$e->getCode().":<br/>%s", str_replace("\n", "<br/>",
	  $e->__toString()));
}
?>
