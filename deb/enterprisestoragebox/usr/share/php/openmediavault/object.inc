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
require_once("enterprisestoragebox/globals.inc");
require_once("enterprisestoragebox/functions.inc");

/**
 * @ingroup api
 */
abstract class ESBObject {
	private $lastError = "";

	/**
	 * Constructor
	 */
	public function __construct() {
	}

	/**
	 * Set the last error.
	 * @param error The error description. This may be a string
	 *   or an array.
	 * @return Returns the previous error.
	 */
	final protected function setLastError($error) {
		$result = $this->lastError;
		$this->lastError = $error;
		return $result;
	}

	/**
	 * Get the last error.
	 * @return The error description of the last error if set.
	 *   If the last error was an array of strings, then they
	 *   are merged into one string.
	 */
	final public function getLastError() {
		return (is_array($this->lastError)) ? implode("\n",
		  $this->lastError) : $this->lastError;
	}

	/**
	 * Print debug message to stdout and file if debugging is enabled.
	 */
	final protected function debug() {
		if (boolvalEx($GLOBALS['ESB_DEBUG_PHP']) === FALSE)
			return;

		$args = func_get_args();
		$fmt = array_shift($args);

		// Get the backtrace.
		$bt = debug_backtrace();
		$bt0 = $bt[0];
		$bt1 = $bt[1];

		// Prepare debug message.
		$msg = sprintf("%s File: %s Line: %d", date(DATE_RFC822),
		  basename($bt0['file']), $bt0['line']);
		if(isset($bt1['class'])) {
			$msg .= sprintf(" Method: %s::%s()", $bt1['class'],
			  $bt1['function']);
		} else if(isset($bt1['function'])) {
			$msg .= sprintf(" Function: %s()", $entry['function']);
		}
		$msg .= sprintf(" Message: %s\n", vsprintf($fmt, $args));

		// Output message to stdout.
		//fwrite(STDOUT, $msg);
		file_put_contents("php://stdout", $msg);
		// Append message to debug log file.
		file_put_contents($GLOBALS['ESB_DEBUG_PHP_LOGFILE'], $msg,
		  FILE_APPEND);
	}
}
