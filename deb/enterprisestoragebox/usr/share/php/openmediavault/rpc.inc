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
require_once("enterprisestoragebox/functions.inc");
require_once("enterprisestoragebox/rpcservice.inc");

/**
 * This class provides methods regarding remote procedure calls.
 * @ingroup api
 */
class ESBRpc extends ESBObject {
	/**
	 * Execute the given RPC.
	 * @param service The name of the service.
	 * @param method The name of the method.
	 * @param params The parameters hash object to be passed to the method
	 *   of the given service.
	 * @param context The context hash object of the caller containing the
	 *   fields \em username and \em role.
	 * @param mode The mode how to execute this RPC. The following modes
	 *   are available:<ul>
	 *   \li ESB_RPC_MODE_LOCAL
	 *   \li ESB_RPC_MODE_REMOTE
	 *   </ul>
	 *   Defaults to ESB_RPC_MODE_LOCAL.
	 * @param restoreSrvEnv Restore various web server and execution
	 *   environment information. This might be helpful in some cases if
	 *   these information are required in the engine backend. Note, this
	 *   only takes action when mode is ESB_RPC_MODE_REMOTE. Defauts to FALSE.
	 * @return The RPC response.
	 * @throw E_RPC_SERVICE_NOT_FOUND
	 * @throw E_RPC_SERVICE_METHOD_NOT_EXISTS
	 * @throw E_MISC_FAILURE
	 * @throw E_ENGINED_CREATE_SOCKET
	 * @throw E_ENGINED_CONNECT_SOCKET
	 * @throw E_ENGINED_WRITE_SOCKET
	 * @throw E_ENGINED_READ_SOCKET
	 */
	public static function exec($service, $method, $params, $context,
	  $mode = ESB_RPC_MODE_LOCAL, $restoreSrvEnv = FALSE) {
//		$this->debug(var_export(func_get_args(), TRUE));
		///////////////////////////////////////////////////////////////////////
		// Try to execute local RPC first.
		///////////////////////////////////////////////////////////////////////
		if($mode & ESB_RPC_MODE_LOCAL) {
			$rpcServiceMgr = &ESBRpcServiceMgr::getInstance();
			if(FALSE !== ($rpcService = $rpcServiceMgr->getService(
			  $service))) {
				if(TRUE === $rpcService->hasMethod($method)) {
					// Restore server and execution environment information
					// if exists.
					if (array_key_exists("_SERVER", $context)) {
						foreach ($context['_SERVER'] as $key => $value) {
							$_SERVER[$key] = $value;
						}
						unset($context['_SERVER']);
					}
					// Execute the RPC service method.
					return $rpcService->callMethod($method, $params, $context);
				} else {
					// Throw an exception if the RPC service method has not
					// been found and redirection to esb-engined is disabled.
					if(~$mode & ESB_RPC_MODE_REMOTE) {
						throw new ESBException(
						  ESBErrorMsg::E_RPC_SERVICE_METHOD_NOT_EXISTS,
						  $method, $service);
					}
				}
			} else {
				// Throw an exception if the RPC service has not been found
				// and redirection to esb-engined is disabled.
				if(~$mode & ESB_RPC_MODE_REMOTE) {
					throw new ESBException(
					  ESBErrorMsg::E_RPC_SERVICE_NOT_FOUND,
					  $service);
				}
			}
		}

		///////////////////////////////////////////////////////////////////////
		// Redirect RPC to esb-engined daemon to execute it remote.
		///////////////////////////////////////////////////////////////////////
		if($mode & ESB_RPC_MODE_REMOTE) {
			// Store the web server and execution environment information?
			// The information is stored in the given context.
			if (TRUE === $restoreSrvEnv) {
				$variables = array("SERVER_PROTOCOL", "GATEWAY_INTERFACE",
				  "SERVER_SOFTWARE", "REMOTE_ADDR", "REMOTE_PORT",
				  "SERVER_ADDR", "SERVER_PORT", "SERVER_NAME", "HTTPS",
				  "REDIRECT_STATUS", "HTTP_HOST", "HTTP_ORIGIN",
				  "HTTP_USER_AGENT", "HTTP_CONTENT_TYPE", "HTTP_REFERER");
				$context['_SERVER'] = array();
				foreach ($variables as $key => $value) {
					if (!array_key_exists($value, $_SERVER))
						continue;
					$context['_SERVER'][$value] = $_SERVER[$value];
				}
			}
			// Create and connect to the socket.
			if(FALSE === ($socket = @socket_create(AF_UNIX, SOCK_STREAM, 0))) {
				throw new ESBException(
				  ESBErrorMsg::E_ENGINED_CREATE_SOCKET,
				  socket_strerror(socket_last_error()));
			}
			// Try to connect to the socket. If the connection fails, then try
			// to establish the connection the given number of attempts.
			$attempt = 0;
			$success = FALSE;
			while (($GLOBALS['ESB_ENGINED_SO_CONNECT_MAX_ATTEMPT'] >
			  $attempt++) && (FALSE === ($success = @socket_connect($socket,
			  $GLOBALS['ESB_ENGINED_SO_ADDRESS'])))) {
				sleep($attempt);
			}
			if (FALSE === $success) {
				throw new ESBException(
				  ESBErrorMsg::E_ENGINED_CONNECT_SOCKET,
				  socket_strerror(socket_last_error()));
			}
			// Set send and receive timeouts.
			socket_set_option($socket, SOL_SOCKET, SO_SNDTIMEO, array(
			  "sec" => $GLOBALS['ESB_ENGINED_SO_SNDTIMEO'], "usec" => 0));
			socket_set_option($socket, SOL_SOCKET, SO_RCVTIMEO, array(
			  "sec" => $GLOBALS['ESB_ENGINED_SO_RCVTIMEO'], "usec" => 0));
			// Create the request.
			$request = json_encode_safe(array(
				"service" => $service,
				"method" => $method,
				"params" => $params,
				"context" => $context
			));
			// Build the header.
			$header = pack("NH*", strlen($request), hash("crc32", $request));
			// Build the buffer to be written to the socket.
			$request = $header . $request;
			// Write to socket.
			if(FALSE === @socket_write($socket, $request, strlen($request))) {
				throw new ESBException(
				  ESBErrorMsg::E_ENGINED_WRITE_SOCKET,
				  socket_strerror(socket_last_error()));
			}
			// Read the RPC response header.
			$header = "";
			$headerLen = $GLOBALS['ESB_ENGINED_SO_RPC_HEADER_LENGTH'];
			while(($read = strlen($header)) < $headerLen) {
				$data = @socket_read($socket, $headerLen - $read,
				  PHP_BINARY_READ);
				if(FALSE === $data) {
					throw new ESBException(
					  ESBErrorMsg::E_ENGINED_READ_SOCKET,
					  socket_strerror(socket_last_error()));
				}
				$header .= $data;
			}
			// Unpack header.
			$header = unpack("Nlength/H*crc32", $header);
			// Read the RPC response data.
			$response = "";
			while(($read = strlen($response)) < $header['length']) {
				$data = @socket_read($socket, $header['length'] - $read,
				  PHP_BINARY_READ);
				if(FALSE === $data) {
					throw new ESBException(
					  ESBErrorMsg::E_ENGINED_READ_SOCKET,
					  socket_strerror(socket_last_error()));
				}
				$response .= $data;
			}
			// Check RPC response data.
			$crc32 = hash("crc32", $response);
			if($header['crc32'] != $crc32) {
				throw new ESBException(ESBErrorMsg::E_MISC_FAILURE,
				  sprintf("Invalid checksum (required=0x%s, calculated=0x%s) ".
				  "of RPC response.", $header['crc32'], $crc32));
			}
			// Close the socket.
			@socket_close($socket);
			// Decode JSON string to PHP array.
			$response = json_decode($response, TRUE);
			// Trigger an exception if the RPC has been failed. Inject the
			// stack trace coming with the remote RPC response.
			if(array_key_exists("error", $response) && !is_null(
			  $response['error'])) {
				$error = $response['error'];
				throw new ESBException2($error['code'], $error['message'],
				  $error['trace']);
			}
			return $response['response'];
		}
	}
}
