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
require_once("enterprisestoragebox/module.inc");
require_once("enterprisestoragebox/config.inc");
require_once("enterprisestoragebox/error.inc");
require_once("enterprisestoragebox/initscript.inc");
require_once("enterprisestoragebox/log.inc");

class ESBModuleProftpd extends ESBModuleServiceAbstract
  implements ESBINotifyListener, ESBIModuleServiceStatus, ESBIModuleZeroconf {
	/**
	 * Get the module name.
	 */
	public function getName() {
		return "ftp";
	}

	/**
	 * Defines the modules that if present should build their configuration
	 * before the service provided by this module.
	 * @return An array of modules.
	 */
	public function shouldApply() { return array("certificatemgmt"); }

	/**
	 * Generate the configuration.
	 * @throw E_EXEC_FAILED
	 */
	public function applyConfig() {
		$cmd = "export LANG=C; esb-mkconf proftpd 2>&1";
		if (0 !== $this->exec($cmd, $output)) {
			throw new ESBException(ESBErrorMsg::E_EXEC_FAILED,
			  $cmd, implode("\n", $output));
		}
	}

	/**
	 * Stop the managed service.
	 */
	public function stopService() {
		$initd = new ESBSysVInitScript("proftpd", FALSE);
		$initd->exec();
	}

	/**
	 * Start the managed service.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 */
	public function startService() {
		global $xmlConfig;
		$xpath = "//services/ftp";
		$object = $xmlConfig->get($xpath);
		if (is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		if (FALSE === boolvalEx($object['enable']))
			return;
		$initd = new ESBSysVInitScript("proftpd", TRUE);
		$initd->exec();
	}

	/**
	 * Get the status of the managed service.
	 * @throw E_CONFIG_GET_OBJECT_FAILED
	 */
	public function getStatus() {
		global $xmlConfig;
		$xpath = "//services/ftp";
		$object = $xmlConfig->get($xpath);
		if (is_null($object)) {
			throw new ESBException(ESBErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		$initd = new ESBSysVInitScript("proftpd");
		return array(
			"name" => $this->getName(),
			"title" => gettext("FTP"),
			"enabled" => boolvalEx($object['enable']),
			"running" => ($initd->status() == 0)
		);
	}

	/**
	 * Get the Zeroconf service configuration.
	 */
	public function getZeroconfConfig() {
		return array(
			  "id" => "ftp",
			  "title" => gettext("FTP")
		  );
	}

	/**
	 * Helper function to find out whether the given shared folder
	 * configuration object is used. If it is used, then mark the
	 * module as dirty.
	 * @param type The event message type.
	 * @param path The event message path.
	 * @param object The configuration object.
	 */
	final public function onSharedFolder($type, $path, $object) {
		global $xmlConfig;
		$xpath = sprintf("//services/ftp/shares/share[sharedfolderref='%s']",
		  $object['uuid']);
		if (TRUE === $xmlConfig->exists($xpath))
			$this->setDirty();
	}

	/**
	 * Bind listeners.
	 */
	function bindListeners(ESBNotifyDispatcher $dispatcher) {
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.services.ftp",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_CREATE | ESB_NOTIFY_MODIFY | ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.services.ftp.shares.share",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_CREATE | ESB_NOTIFY_MODIFY | ESB_NOTIFY_DELETE,
		  "org.enterprisestoragebox.services.ftp.modules.mod_ban.rule",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.services.ftp.modules.mod_tls",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.network.hostname",
		  array($this, "setDirty"));
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.shares.sharedfolder",
		  array($this, "onSharedFolder"));
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.system.shares.sharedfolder.privileges",
		  array($this, "onSharedFolder"));
		$moduleMgr = &ESBModuleMgr::getInstance();
		$dispatcher->addListener(
		  ESB_NOTIFY_MODIFY,
		  "org.enterprisestoragebox.services.ftp",
		  array($moduleMgr->getModule("zeroconf"), "setDirty"));
    }
}

// Register module.
$moduleMgr = &ESBModuleMgr::getInstance();
$moduleMgr->registerModule(new ESBModuleProftpd());

// Register new logfile type.
// Format:
// Oct 17 18:19:00 vmesb5 proftpd[17127]: 192.167.178.101 (::ffff:192.168.178.254[::ffff:192.168.178.254]) - USER test: Login successful.
// Oct 17 18:20:00 vmesb5 proftpd: pam_unix(proftpd:session): session closed for user test
ESBLogFile::registerType("proftpd", array(
  "filename" => "proftpd.log",
  "filepath" => "/var/log/proftpd/proftpd.log",
  "regex" => "/^(\S+\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(\S+)\sproftpd\[\d+\]:\s+(.*)$/",
  "columns" => array(
	  "ts" => array(
		  "index" => 1,
		  "func" => create_function('$v', 'return strpdate($v,"M j G:i:s");')
	  ),
	  "date" => array(
		  "index" => 1,
		  "func" => create_function('$v',
			'return strftime("%c", strpdate($v,"M j G:i:s"));')
	  ),
	  "hostname" => 2,
	  "message" => 3
  )));

// Format:
// <currenttime> <transfertime> <remotehost> <filesize> <filename> <transfertype> <specialactionflag> <direction> <accessmode> <username> <servicename> <authenticationmethod> <authenticateduserid> <completionstatus>
// Thu Oct 17 18:19:00 2013 0 ::ffff:192.168.178.254 56374 /home/ftp/test/testfile b _ i r test ftp 0 * c
ESBLogFile::registerType("proftpd_xferlog", array(
  "filename" => "xferlog",
  "filepath" => "/var/log/proftpd/xferlog",
  "regex" => "/^(\S+\s+\S+\s+\d+\s+\d{2}:\d{2}:\d{2}\s+\d+)\s+(\d+)\s+(\S+)\s+(\d+)\s+(\S+)\s+(a|b)\s+(C|U|T|_)\s+(o|i)\s+(a|g|r)\s+(\S+)\s+(\S+)\s+(0|1)\s+(\d+|\*)\s+(c|i)$/",
  "columns" => array(
	  "ts" => array(
		  "index" => 1,
		  "func" => create_function('$v', 'return strpdate($v,"D M d H:i:s Y");')
	  ),
	  "date" => array(
		  "index" => 1,
		  "func" => create_function('$v',
			'return strftime("%c", strpdate($v,"D M d H:i:s Y"));')
	  ),
	  "transfertime" => 2,
	  "remotehost" => 3,
	  "filesize" => 4,
	  "filename" => 5,
	  "transfertype" => 6,
	  "specialactionflag" => 7,
	  "direction" => 8,
	  "accessmode" => 9,
	  "username" => 10,
	  "servicename" => 11,
	  "authenticationmethod" => 12,
	  "authenticateduserid" => 13,
	  "completionstatus" => 14
  )));
