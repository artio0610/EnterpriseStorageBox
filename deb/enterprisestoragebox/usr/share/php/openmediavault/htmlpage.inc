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
require_once("enterprisestoragebox/session.inc");
require_once("enterprisestoragebox/error.inc");
require_once("enterprisestoragebox/product.inc");
require_once("enterprisestoragebox/system.inc");
require_once("enterprisestoragebox/util.inc");

/**
 * Base class for a HTML page.
 * @ingroup api
 */
abstract class ESBHtmlPageAbstract extends ESBObject {
	/**
	 * Includes the given file
	 * @param fileName The name of the file to add
	 * @param incList The list where to add the files to include
	 */
	protected function scanFiles($fileName, &$incList) {
		// Add the given file to the list of files to be included. Note,
		// the file must be inserted at the beginning of the list to respect
		// the prerequisite order.
		array_unshift($incList, $fileName);
		$fh = fopen($fileName, "r");
		if ($fh === FALSE)
			throw new Exception(sprintf("Failed to open file '%s'", $fileName));
		$abort = FALSE;
		$scanList = array();
		$regex = "/^(\/\/\s+require\(\"([^\s]+)\"\)|\/\*+|\*\/|\*.*|\s*)$/";
		while (!feof($fh)) {
			// Read line by line. Strip whitespace or other characters from
			// the beginning and end of the line.
			$content = trim(fgets($fh));
			// Abort scanning this file if we find the first line that does
			// not match the regex. Accepted lines are:
			// - /**
			// - *
			// - * xyz abc
			// - */
			// - // require("xyz")
			// - Blank lines
			if (1 !== preg_match($regex, $content))
				break;
			if (1 !== preg_match("/\/\/\s+require\(\"([^\s]+)\"\)/", $content,
			  $matches))
				continue;
			$scanList[] = $matches[1];
		}
		fclose($fh);
		// Process all files that are included in the given file.
		foreach ($scanList as $fileName)
			$this->scanFiles($fileName, $incList);
	}

	/**
	 * Scan the given directory for Javascript files to be added
	 * @param dirPath The name of the directory to scan
	 * @param incList The list where to add the files to include
	 * @param recursive Scan subdirs
	 */
	protected function scanDir($dirPath, &$incList, $recursive = TRUE) {
		$dir = new DirectoryIterator($dirPath);
		foreach ($dir as $item) {
			if ($item->isDot())
				continue;
			if ($item->isFile()) {
				$pathInfo = pathinfo($item->getFilename());
				if (array_key_exists("extension", $pathInfo) &&
				  (strtolower($pathInfo['extension']) === "js")) {
					$this->scanFiles("{$dirPath}/{$pathInfo['basename']}",
					  $incList);
				}
			}
			if ($item->isDir() && (TRUE === $recursive)) {
				$newIncPath = $dirPath . "/" . $item->getFilename();
				$this->scanDir($item->getPathname(), $incList, $recursive);
				continue;
			}
		}
	}

	/**
	 * Renders the HTML page
	 */
	public function render() {
		$title = $this->getTitle();

		echo <<<EOF
<!DOCTYPE html>
<html>
	<head>
		<title>{$title}</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
		<meta name="ROBOTS" content="NOINDEX, NOFOLLOW"/>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
		<link rel="shortcut icon" type="image/x-icon" href="favicon.ico"/>

EOF;

		// Set core CSS files.
		$cssList = array(
			"/extjs/packages/ext-theme-gray/resources/ext-theme-gray-all.css",
			"css/esb.css"
		);
		// Add additional CSS files.
		$cssList = array_merge($cssList, array_values(array_unique(
		  $this->getCssIncludes())));
		$fileName = "css/esb-custom.css";
		if (file_exists($fileName))
			$cssList[] = $fileName;
		foreach ($cssList as $cssListv) {
			print "<link rel='stylesheet' type='text/css' href='{$cssListv}'/>\n";
		}

		// Add core javascript files.
		$jsList = array(
			"js/esb/util/i18n.js",
			"js/esb/util/i18nDict.js",
			"js/ext-overrides.js",
			"js/js-overrides.js",
			"js/esb/globals.js"
		);
		if (TRUE === boolvalEx($GLOBALS['ESB_DEBUG_EXTJS'])) {
			$jsList = array_merge(array(
				"/extjs/ext-all-debug.js",
				"/extjs/packages/ext-theme-gray/ext-theme-gray-debug.js"
			), $jsList);
		} else {
			$jsList = array_merge(array(
				"/extjs/ext-all.js",
				"/extjs/packages/ext-theme-gray/ext-theme-gray.js"
			), $jsList);
		}
		foreach ($jsList as $jsListv) {
			print "<script type='application/javascript' src='{$jsListv}'></script>\n";
		}

		// Get additional Javascript files. To improve loading speed the
		// list of include files will be cached.
		$jsList = array();
		$parts = array();
		$parts[] = strtolower(get_class($this));
		$parts[] = $this->getCacheFileId();
		$parts[] = "js";
		$jsonFile = new ESBJsonFile(sprintf("%s/cache.%s.json",
		  $GLOBALS['ESB_CACHE_DIR'], implode("_", array_filter($parts))));
		if ($jsonFile->exists() && !(boolvalEx($GLOBALS['ESB_DEBUG_PHP']) ||
		  boolvalEx($GLOBALS['ESB_DEBUG_EXTJS']))) {
			$jsonFile->open("r");
			$jsList = $jsonFile->read();
		} else {
			$jsList = array_values(array_unique(
			  $this->getJavascriptIncludes()));
			$jsonFile->open("w+");
			$jsonFile->write($jsList);
		}
		$jsonFile->close();
		// Append the additional Javascript files.
		if (is_array($jsList)) {
			foreach ($jsList as $jsListv) {
				print "<script type='application/javascript' src='{$jsListv}'></script>\n";
			}
		}

		// Get the body code to be rendered
		$bodyId = $this->getBodyId();
		$bodyContent = $this->getBodyContent();

		echo <<<EOF
	</head>
	<body id='{$bodyId}'>
{$bodyContent}
	</body>
</html>
EOF;
	}

	/**
	 * Get the title of the HTML page.
	 * @return The page title string.
	 */
	protected function getTitle() {
		$prd = new ESBProduct();
		return sprintf("%s %s - %s", $prd->getName(),
		  gettext("web administration interface"),
		  ESBNetwork::getHostname("--fqdn"));
	}

	/**
	 * Get the identifier to make the cache file unique, e.g. "xyz".
	 * Defaults to empty.
	 * @return The cache file identifier.
	 */
	protected function getCacheFileId() {
		return "";
	}

	/**
	 * Get the body ID.
	 */
	abstract protected function getBodyId();

	/**
	 * Get the HTML body code
	 */
	abstract protected function getBodyContent();

	/**
	 * Get an list of javascript files to be included.
	 * @return An array of files to be included.
	 */
	public function getJavascriptIncludes() {
		return array();
	}

	/**
	 * Get an list of CSS files to be included.
	 * @return An array of files to be included.
	 */
	public function getCssIncludes() {
		return array();
	}
}

/**
 * @ingroup api
 */
class ESBControlPanel extends ESBHtmlPageAbstract {
	const MODE_ADMINISTRATOR = "admin";
	const MODE_USER = "user";

	protected $mode = null;

	/**
	 * Constructor
	 * @param mode The mode of the WebGUI, e.g. MODE_ADMINISTRATOR or
	 *   MODE_USER.
	 */
	public function __construct($mode = ESBControlPanel::MODE_USER) {
		$this->setMode($mode);
	}

	/**
	 * Set the control panel mode.
	 * @param mode The mode of the WebGUI, e.g. MODE_ADMINISTRATOR or
	 *   MODE_USER.
	 */
	public function setMode($mode) {
		$this->mode = $mode;
	}

	public function getJavascriptIncludes() {
		$incList = array();
		$this->scanFiles("js/esb/SessionManager.js", $incList);
		$this->scanFiles("js/esb/workspace/Workspace.js", $incList);
		$this->scanDir("js/esb/module/public", $incList, TRUE);
		$this->scanDir("js/esb/module/{$this->mode}", $incList, TRUE);
		return $incList;
	}

	protected function getCacheFileId() {
		return $this->mode;
	}

	protected function getBodyId() {
		return "workspace-page";
	}

	protected function getBodyContent() {
		$prd = new ESBProduct();
		$session = &ESBSession::getInstance();
		// Define global constants.
		$globalDefs = sprintf(
		  "ESB.UUID_UNDEFINED = '%s'; ".
		  "ESB.ROLE_ADMINISTRATOR = %d; ".
		  "ESB.HTTPREQUEST_TIMEOUT = %s; ".
		  "ESB.PRODUCT_NAME = '%s'; ".
		  "ESB.PRODUCT_URL = '%s'; ".
		  "ESB.PRODUCT_COPYRIGHT = '%s'; ".
		  "ESB.PRODUCT_PACKAGENAME = '%s';",
		  $GLOBALS['ESB_UUID_UNDEFINED'], ESB_ROLE_ADMINISTRATOR,
		  $GLOBALS['ESB_HTTPREQUEST_TIMEOUT'], $prd->getName(),
		  $prd->getURL(), $prd->getCopyright(), $prd->getPackageName());
		$errorCodes = sprintf(
		  "ESB.E_SESSION_NOT_AUTHENTICATED = %d; ".
		  "ESB.E_SESSION_TIMEOUT = %d;".
		  "ESB.E_ENGINED_CONNECT_SOCKET = %d",
		  ESBErrorMsg::E_SESSION_NOT_AUTHENTICATED,
		  ESBErrorMsg::E_SESSION_TIMEOUT,
		  ESBErrorMsg::E_ENGINED_CONNECT_SOCKET);
		return <<<EOF
		<script type="application/javascript">
			// Global defines
			{$globalDefs}
			// RPC error codes
			{$errorCodes}
			// Request user confirmation before leaving page.
			ESB.confirmPageUnload = true;
			window.onbeforeunload = function() {
				if(true === ESB.confirmPageUnload) {
					ESB.confirmPageUnload = false;
					return _("Do you really want to leave the page?");
				}
			};
			// Initialize default session data.
			Ext.apply(ESB.SessionManager, {
				username: "{$session->getUsername()}",
				role: "{$session->getRole()}"
			});
			// Use LocalStorage API if available, otherwise use
			// cookies to store the state of the UI components.
			var provider;
			if (Ext.util.LocalStorage.supported) {
				provider = Ext.create("Ext.state.LocalStorageProvider");
			} else {
				provider = Ext.create("Ext.state.CookieProvider", {
					expires: new Date(new Date().getTime() +
					  (1000*60*60*24*365))
				});
			}
			Ext.state.Manager.setProvider(provider);
			// Create the viewport if the page is ready.
			Ext.onReady(function() {
				Ext.tip.QuickTipManager.init(true, {
					dismissDelay: 0
				});
				ESB.viewport = Ext.create("ESB.workspace.Workspace");
			});
		</script>
EOF;
	}
}

/**
 * @ingroup api
 */
class ESBLoginPage extends ESBHtmlPageAbstract {
	public function getJavascriptIncludes() {
		$incList = array();
		$this->scanFiles("js/esb/window/Login.js", $incList);
		return $incList;
	}

	protected function getBodyId() {
		return "login-page";
	}

	protected function getBodyContent() {
		$prd = new ESBProduct();
		return <<<EOF
		<a title='{$prd->getName()}' href='{$prd->getURL()}' target='_blank'><div id="projectlogo"></div></a>
		<script type="application/javascript">
			Ext.onReady(function() {
				Ext.tip.QuickTipManager.init(true, {
					dismissDelay: 0
				});
				Ext.create("ESB.window.Login", {
					listeners: {
						login: function(wnd, response) {
							if(response.authenticated === true) {
								// Close the window now.
								wnd.close();
								// Display loading progress dialog. This will
								// be displayed until the web administration
								// interface is loaded and rendered.
								Ext.getBody().mask(
								  _("Loading, please wait ..."));
								// Reload page to render the web
								// administration interface.
								document.location.reload(true);
							} else {
								ESB.MessageBox.guru({
									msg: _("Incorrect username or password.")
								});
							}
						}
					}
				}).show();
			});
		</script>
EOF;
	}
}
