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
require_once("php-json-schema/JsonSchema.php");

/**
 * Sort an array by values using a user-defined key.
 * @ingroup api
 * @param array The array to sort
 * @param key The key used as sort criteria
 * @return Returns TRUE on success or FALSE on failure.
 */
function array_sort_key(array &$array, $key) {
	return uasort($array, create_function('$a, $b',
	  "return strnatcmp(strval(\$a['$key']), strval(\$b['$key']));"));
}

/**
 * Filter an array by key and values.
 * @ingroup api
 * @param array The array to sort
 * @param key The key used as filter criteria
 * @param value The value used as filter criteria
 * @return Returns the filtered array.
 */
function array_filter_ex($array, $key, $value) {
	$result = array();
	if(is_array($array) && count($array) > 0) {
		foreach(array_keys($array) as $keyv){
			$temp[$keyv] = $array[$keyv][$key];
			if($temp[$keyv] == $value){
				$result[$keyv] = $array[$keyv];
			}
		}
	}
	return $result;
}

/**
 * Checks if the given keys or index exists in the array.
 * @ingroup api
 * @param keys An array containing the keys to check
 * @param search An array with keys to check
 * @param missing Contains the missing keys if function fails
 * @return Returns TRUE on success or FALSE on failure.
 */
function array_keys_exists($keys, $search, &$missing = NULL) {
	$missing = array_values(array_diff($keys, array_keys($search)));
	return !(count($missing) > 0);
}

/**
 * Convert an object to an array.
 * @ingroup api
 * @param object The object instance.
 * @return Returns an associative array of defined object accessible
 * non-static properties for the specified object  in scope.
 */
function toArray($object) {
	if(is_object($object)) {
	  $object = get_object_vars($object);
	}
	return is_array($object) ? array_map(__FUNCTION__, $object) : $object;
}

/**
 * Get an array value.
 * @param array The array.
 * @param key The key of the element.
 * @param sefault The default value.
 * @return The value of the given key or the default value if the key
 *   does not exist.
 */
function array_value($array, $key, $default = NULL) {
	return isset($array[$key]) ? $array[$key] : $default;
}

/**
 * Pick one or more random entries out of an array.
 * @param array The input array.
 * @param num Specifies how many entries should be picked.
 * @return When picking only one entry, the function returns the value
 *   for a random entry. Otherwise, an array of values for the random
 *   entries is returned. Trying to pick more elements than there are
 *   in the array NULL will be returned.
 */
function array_rand_value($array, $num = 1) {
	$keys = array_rand($array, $num);
	if (is_null($keys))
		return NULL;
	if (!is_array($keys))
		return $array[$keys];
	$result = array();
	foreach ($keys as $keyk => $keyv) {
		$result[] = $array[$keyv];
	}
	return $result;
/*
	// Alternative implementation.
	$count = count($array);
	if ($num > $count)
		return NULL;
	$result = (1 == $num) ? "" : array();
	for ($i = 0; $i < $num; $i++) {
		$index = mt_rand(0, $count - 1);
		if (1 == $num)
			$result = $array[$index];
		else
			$result[] = $array[$index];
	}
	return $result;
*/
}

/**
 * Get boolean value of an array element.
 * @ingroup api
 * @param array An array with keys.
 * @param key The key of the element.
 * Returns the boolean value of the given key.
 */
function array_boolval($array, $key) {
	if (!isset($array[$key]))
		return false;
	return boolvalEx($array[$key]);
}

/**
 * Get the boolean value of a variable.
 * @ingroup api
 * @deprecated
 * @param var The scalar value being converted to a boolean.
 * Returns the boolean value of the given value.
 */
if (!function_exists("boolval")) {
	function boolval($var) {
		return boolvalEx($var);
	}
}

/**
 * Get the boolean value of a variable. A boolean TRUE will be returned for
 * the values 1, '1', 'on', 'yes', 'y' and 'true'.
 * @ingroup api
 * @param var The scalar value being converted to a boolean.
 * Returns the boolean value of the given value.
 */
function boolvalEx($var) {
	$result = false;
	// Boolean 'true' => '1'
	switch (strtolower(strval($var))) {
		case "1":
		case "on":
		case "yes":
		case "y":
		case "true":
			$result = true;
			break;
		default:
			break;
	}
	return $result;
}

/**
 * Finds out whether a variable is an UUID v4.
 * @ingroup api
 * @param var The variable being evaluated.
 * @return TRUE if the variable is an UUID, otherwise FALSE.
 */
function is_uuid($var) {
	if (!is_string($var))
		return FALSE;
	return preg_match('/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-'.
	  '[a-f0-9]{12}$/i', $var) ? TRUE : FALSE;
}

/**
 * Finds out whether a variable is a filesystem UUID, e.g. <ul>
 * \li 78b669c1-9183-4ca3-a32c-80a4e2c61e2d (EXT2/3/4, JFS, XFS)
 * \li 7A48-BA97 (FAT)
 * \li 2ED43920D438EC29 (NTFS)
 * \li 2015-01-13-21-48-46-00 (ISO9660)
 * </ul>
 * @see http://wiki.ubuntuusers.de/UUID
 * @ingroup api
 * @param var The variable being evaluated.
 * @return TRUE if the variable is a filesystem UUID, otherwise FALSE.
 */
function is_fs_uuid($var) {
	// Check if it is an UUID v4.
	if (is_uuid($var))
		return TRUE;
	// Check if it is a NTFS, FAT or ISO9660 filesystem identifier.
	$regex = '/^([a-f0-9]{4}-[a-f0-9]{4}|[a-f0-9]{16}|[0-9]{4}-[0-9]{2}-'.
	  '[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2})$/i';
	if (1 == preg_match($regex, $var))
		return TRUE;
	return FALSE;
}

/**
 * Finds out whether a variable describes a devicefile, e.g. /dev/sda1.
 * @ingroup api
 * @param var The variable being evaluated.
 * @return TRUE if the variable describes a devicefile, otherwise FALSE.
 */
function is_devicefile($var) {
	return preg_match('/^\/dev\/.+$/i', $var) ? TRUE : FALSE;
}

/**
 * Tells whether the given file is a block device.
 * @ingroup api
 * @param filename Path to the file.
 * @return Returns TRUE if the file is a block device, FALSE otherwise.
 */
function is_block($filename) {
	if(FALSE === file_exists($filename))
		return FALSE;
	if(FALSE === ($stat = stat($filename)))
		return FALSE;
	// See http://www.kernel.org/doc/man-pages/online/pages/man2/stat.2.html
	return $stat['mode'] & 060000;
}

/**
 * Finds out whether a variable is JSON.
 * @ingroup api
 * @param var The variable being evaluated.
 * @return TRUE if the variable is JSON, otherwise FALSE.
 */
function is_json($var) {
	return (is_string($var) && !is_null(json_decode_safe($var))) ?
	  TRUE : FALSE;
}

/**
 * Finds out whether a variable is an IP address.
 * @ingroup api
 * @param var The variable being evaluated.
 * @return TRUE if the variable is an IP address, otherwise FALSE.
 */
function is_ipaddr($var) {
	if(!is_string($var))
		return FALSE;
	return filter_var($var, FILTER_VALIDATE_IP);
}

/**
 * Finds out whether a variable is an IPv4 address.
 * @ingroup api
 * @param var The variable being evaluated.
 * @return TRUE if the variable is an IPv4 address, otherwise FALSE.
 */
function is_ipaddr4($var) {
	if(!is_string($var))
		return FALSE;
	return filter_var($var, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4);
}

/**
 * Finds out whether a variable is an IPv6 address.
 * @ingroup api
 * @param var The variable being evaluated.
 * @return TRUE if the variable is an IPv6 address, otherwise FALSE.
 */
function is_ipaddr6($var) {
	if(!is_string($var))
		return FALSE;
	return filter_var($var, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6);
}

/**
 * Finds out whether a variable is a multidimensional array.
 * @ingroup api
 * @param var The variable being evaluated.
 * @return TRUE if the variable is a multidimensional array, otherwise FALSE.
 */
function is_multiarray($var) {
	if (count($var, COUNT_RECURSIVE) !== count($var))
		return TRUE;
	return FALSE;
}

/**
 * Check if the platform is 64bit.
 * @return TRUE if 64bit, otherwise FALSE.
 */
function is_64bits() {
	return (PHP_INT_SIZE == 8);
}

/**
 * Validate JSON data via JSON schema.
 * @ingroup api
 * @param json The JSON string to validate.
 * @param schema The JSON schema to use for validation.
 * @param errors Optional parameter which will contain the error messages
 *   if validation fails.
 * @return TRUE if successful, otherwise FALSE.
 */
function json_validate($json, $schema, &$errors = NULL) {
	$jsonSchema = new JsonSchema($json);
	if(false === ($result = $jsonSchema->validate($schema)))
		$errors = $jsonSchema->getErrors();
	return $result;
}

/**
 * Returns the JSON representation of a value. All strings will be encoded
 * to UTF-8 before, thus json_encode should not throw an exception like
 * 'Invalid UTF-8 sequence in argument' (Mantis 0000355).
 * @ingroup api
 * @param value The value being encoded.
 * @param options Bitmask, see PHP json_encode manual pages.
 * @return Returns a string containing the JSON representation of \em value.
 */
function json_encode_safe($value, $options = 0) {
	if (is_array($value)) {
		array_walk_recursive($value, create_function('&$item, $key',
		  'if (is_string($item) && !mb_check_encoding($item, "UTF-8")) '.
		  '{ $item = mb_convert_encoding($item, "UTF-8", '.
		  'mb_detect_encoding($item)); }'));
	} else if (is_string($value) && !mb_check_encoding($value, "UTF-8")) {
		$value = mb_convert_encoding($value, "UTF-8",
		  mb_detect_encoding($value));
	}
	return json_encode($value, $options);
}

/**
* Decodes a JSON string. The JSON string being decoded will be encoded
* to UTF-8 before.
* @ingroup api
* @param json The JSON string being decoded.
* @param assoc When TRUE, returned objects will be converted into
*   associative arrays.
* @param depth User specified recursion depth.
* @param options Bitmask of JSON decode options.
* @return Returns the \em value encoded in json in appropriate PHP type.
*/
function json_decode_safe($json, $assoc = false, $depth = 512, $options = 0) {
	if (is_array($json)) {
		array_walk_recursive($json, create_function('&$item, $key',
		  'if (is_string($item) && !mb_check_encoding($item, "UTF-8")) '.
		  '{ $item = utf8_encode($item); }'));
	} else if (is_string($json)) {
		$json = utf8_encode($json);
	}
	return json_decode($json, $assoc, $depth, $options);
}

/**
 * Returns the error string of the last JSON API call.
 * @return Returns the error message on success or NULL with wrong parameters.
 */
if (!function_exists('json_last_error_msg')) {
    function json_last_error_msg() {
        static $errorMsg = array(
            JSON_ERROR_NONE	=> null,
			JSON_ERROR_DEPTH =>	"The maximum stack depth has been exceeded",
			JSON_ERROR_STATE_MISMATCH => "Invalid or malformed JSON",
			JSON_ERROR_CTRL_CHAR => "Control character error, possibly incorrectly encoded",
			JSON_ERROR_SYNTAX => "Syntax error",
			JSON_ERROR_UTF8 => "Malformed UTF-8 characters, possibly incorrectly encoded"
        );
        $errno = json_last_error();
        return array_key_exists($errno, $errorMsg) ? $errorMsg[$errno] :
          sprintf("Unknown error (%d)", $errno);
    }
}

/**
 * Convert a number into the highest possible binary unit.
 * @ingroup api
 * @param value The number to convert (per default this is in Bytes).
 * @param options An array of additional options.
 * @return The converted string value including the unit or an indexed
 * array with the fields \em value and \em unit.
 */
function binary_format($number, $options = NULL) {
	$prefixes = array("B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB",
	  "ZiB", "YiB");
	$exp = 0;
	$maxExp = count($prefixes);
	$decimalPlaces = 2;
	$indexed = FALSE;

	// Process additional function options.
	if(is_array($options)) {
		if(isset($options['decimalPlaces']))
			$decimalPlaces = $options['decimalPlaces'];
		if(isset($options['indexed']))
			$indexed = $options['indexed'];
		if(isset($options['fromPrefix']))
			$exp = array_search($options['fromPrefix'], $prefixes);
		if(isset($options['maxPrefix']))
			$maxExp = array_search($options['maxPrefix'], $prefixes);
	}

	$number = strval($number);
	while((-1 != bccomp($number, "1024")) && ($exp < $maxExp)) {
		$exp++;
		$number = bcdiv($number, "1024", $decimalPlaces);
	}

	$result = array(
		"value" => floatval($number),
		"unit" => $prefixes[$exp]
	);
	if(FALSE === $indexed) {
		$result = sprintf("%s %s", $number, $prefixes[$exp]);
	}

	return $result;
}

/**
 * Convert a number to bytes using binary multiples.
 * @ingroup api
 * @param number The number to convert.
 * @param fromPrefix The binary prefix name \em number is in, e.g. 'KiB'.
 * @param toPrefix The binary prefix name to convert \em number to, e.g.
 * 'TiB'.
 * @param decimalPlaces The number of decimal places. Defaults to 0.
 * @return The converted number as string or FALSE on failure.
 */
function binary_convert($number, $fromPrefix, $toPrefix, $decimalPlaces = 0) {
	$prefixes = array("B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB",
	  "ZiB", "YiB");
	$fromIndex = array_search($fromPrefix, $prefixes);
	$toIndex = array_search($toPrefix, $prefixes);

	if((FALSE === $fromIndex) || (FALSE === $toIndex))
		return FALSE;

	// Convert number to string and ensure the correct number of decimal
	// numbers is set (workaround for strange bcmul behaviour).
	$number = bcadd(strval($number), "0", $decimalPlaces);
	// Convert the given number into the requested binary unit.
	$steps = ($toIndex > $fromIndex) ? $toIndex - $fromIndex :
	  $fromIndex - $toIndex;
	for($i = 0; $i < $steps; $i++) {
		if($fromIndex < $toIndex) {
			$number = bcdiv($number, "1024", $decimalPlaces);
		} else {
			$number = bcmul($number, "1024", $decimalPlaces);
		}
	}

	return $number;
}

/**
 * Convert any time/date into a Unix timestamp according to the specified
 * format.
 * @ingroup api
 * @param date A date/time string to parse.
 * @param format The format used in date.
 * @return Returns a Unix timestamp on success, FALSE otherwise.
 */
function strpdate($date, $format) {
	if(FALSE === ($dt = DateTime::createFromFormat($format, $date)))
		return FALSE;
	return $dt->getTimestamp();
}

/**
 * Creates a path from a series of parts using separator as the separator
 * between parts. At the boundary between two parts, any trailing occurrences
 * of separator in the first part, or leading occurrences of separator in the
 * second part are removed and exactly one copy of the separator is inserted.
 * @param parts Array containing the parts to be joined.
 * @param separator The directory seperator
 * @return A string path built from the given parts.
 */
function build_path($parts, $separator = DIRECTORY_SEPARATOR) {
	foreach ($parts as $partk => &$partv) {
		if (0 == $partk) // First element
			$partv = rtrim($partv, $separator);
		else // Others
			$partv = trim($partv, $separator);
	}
	return implode($separator, $parts);
}

/**
 * Create a directory with unique file name.
 * @ingroup api
 * @param prefix The prefix of the generated temporary directory.
 * @param mode The mode of the temporary directory. Defaults to 0700.
 * @return Returns the full path of the created directory, or FALSE on failure.
 */
function mkdtemp($prefix = "", $mode = 0700) {
	$pathname = build_path(array(sys_get_temp_dir(), uniqid($prefix)));
	if (is_dir($pathname))
		return FALSE;
	if (FALSE === mkdir($pathname, $mode))
		return FALSE;
	return $pathname;
}

/**
 * Build a netmask based on the given number of bits.
 * @ingroup api
 * @param bits The number of bits to be set in the desired netmask.
 * @param forceipv6 Set to TRUE to force an IPv6 netmask, even if bits <= 32.
 *   Defaults to FALSE which auto-detects the address family.
 * @return The netmask as string.
 */
function inet_getnetmask($bits, $forceipv6 = FALSE) {
	$af = (32 < $bits) ? AF_INET6 : (TRUE === $forceipv6) ? AF_INET6 : AF_INET;
	$binNetmask = str_pad(str_repeat("1", $bits), ($af == AF_INET6) ?
	  128 : 32, "0", STR_PAD_RIGHT);
	$inaddr = pack("H*", base_convert($binNetmask, 2, 16));
	return inet_ntop($inaddr);
}

/**
 * Check if the given integer value is in the range min <= var <= max.
 * @param var The value to check.
 * @param min The minimum value of the sequence.
 * @param max The maximum value of the sequence.
 * @return TRUE if the value is within the range, otherwise FALSE.
 */
function in_range($var, $min, $max) {
	// See http://php.net/manual/en/filter.filters.validate.php.
	return (FALSE !== filter_var($var, FILTER_VALIDATE_INT, array(
	  'options' => array(
		  'min_range' => $min,
		  'max_range' => $max
	  ))));
}
