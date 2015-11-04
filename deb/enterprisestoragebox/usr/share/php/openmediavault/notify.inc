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
require_once("enterprisestoragebox/object.inc");

/**
 * ESBNotifyDispatcher is an configuration notification technology. It provides
 * the possibility to simply monitor various events, e.g. on the configuration.
 * @ingroup api
 */
class ESBNotifyDispatcher extends ESBObject {
	private static $instances = array();
	private $name = null;
	private $listeners = null;

	/**
	 * Constructor
	 * @param name The name of the dispatcher.
	 */
	function __construct($name) {
		$this->name = $name;
	}

	/**
	 * Get the name of the dispatcher.
	 * The name is the unique identifier of a dispatcher.
	 * @return The name of the dispatcher.
	 */
	function getName() {
		return $this->name;
	}

	/**
	 * Returns all listeners.
	 * @return An array of listeners.
	 */
	public function getListeners() {
		if(!isset($this->listeners))
			return array();
		return $this->listeners;
	}

	/**
	 * Returns a dispatcher singleton.
	 * @param name The name of the notification dispatcher.
	 * @return The dispatcher object.
	 */
	public static function &getInstance($name = "default") {
		if(!isset(self::$instances[$name]))
			self::$instances[$name] = new ESBNotifyDispatcher($name);
		return self::$instances[$name];
	}

	/**
	 * Add a listener to a given event message.
	 * @param arg1 The event message type, e.g. ESB_NOTIFY_CREATE,
	 *   ESB_NOTIFY_MODIFY, ESB_NOTIFY_PREDELETE, ESB_NOTIFY_DELETE or
	 *   ESB_NOTIFY_MODIFY|ESB_NOTIFY_DELETE.
	 * @param arg2 The event message path that should be monitored,
	 *   e.g. 'org.enterprisestoragebox.abc.xyz'.
	 * @param arg3 The callback function.
	 * @param arg4 The sequence number of the called function. Default
	 *   is 20. If you want a function to be execute as the first one
	 *   then set it to 1.
	 */
	function addListener($arg1, $arg2 = null, $arg3 = null, $arg4 = 20) {
		if(is_a($arg1, "ESBINotifyListener"))
			return $arg1->bindListeners($this);
		// Add the listerer.
//		$this->debug(sprintf("Add listener (type=%s, message=%s, " .
//		  "callback=%s::%s, seqnum=%s", $arg1, $arg2, get_class($arg3[0]),
//		  $arg3[1], $arg4));
		$this->listeners[] = array(
			"type" => $arg1,
			"path" => $arg2,
			"callback" => $arg3,
			"seqnum" => $arg4
		);
	}

	/**
	 * Notify all registered listeners.
	 * @param type The event message type that should be announced, e.g.
	 *   ESB_NOTIFY_CREATE, ESB_NOTIFY_MODIFY, ESB_NOTIFY_PREDELETE,
	 *   ESB_NOTIFY_DELETE or ESB_NOTIFY_MODIFY|ESB_NOTIFY_DELETE.
	 * @param path The event message path, e.g. 'org.enterprisestoragebox.abc.xyz'.
	 * @param argX The parameters to be passed.
	 */
	function notify($type, $path /* [, $arg1 [, $... ]] */) {
//		$this->debug(var_export(func_get_args(), TRUE));
		// Filter list of registered listeners.
		$listeners = array_filter_ex($this->listeners, "path", $path);
		// Sort list of registered listeners.
		array_sort_key($listeners, "seqnum");
		// Call registered listeners.
		if(!empty($listeners)) {
			foreach($listeners as $listenerk => $listenerv) {
				if($listenerv['type'] & $type) {
//					$this->debug(sprintf("Notify listener (type=%s, " .
//					  "path=%s, callback=%s::%s, seqnum=%s",
//					  $listenerv['type'], $listenerv['path'],
//					  get_class($listenerv['callback'][0]),
//					  $listenerv['callback'][1], $listenerv['seqnum']));
					call_user_func_array($listenerv['callback'],
					  func_get_args());
				}
			}
		}
	}

	/**
	 * Dump all registered listeners sorted by their event message path.
	 * @param path The event message path that should be monitored.
	 */
	function dumpListeners($path = "") {
		$listeners = $this->listeners;
		// Filter list of registered listeners.
		if(!empty($path))
			$listeners = array_filter_ex($listeners, "path", $path);
		// Sort list of registered listeners.
		array_sort_key($listeners, "path");
		// Dump registered listeners.
		$this->debug($listeners);
	}
}

/**
 * Interface that must be implemented to be able to listen for event
 * notifications.
 * @ingroup api
 */
interface ESBINotifyListener {
	/**
	 * Bind listeners.
	 * @param dispatcher The dispatcher object.
	 */
	function bindListeners(ESBNotifyDispatcher $dispatcher);
}
