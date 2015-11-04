# -*- coding: utf-8 -*-
#
# This file is part of EnterpriseStorageBox.
#
# @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
# @author    Artur Osinski-Stachowicz <artio0610@gmail.com>
# @copyright Copyright (c) 2009-2015 Artur Osinski-Stachowicz
#
# EnterpriseStorageBox is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# any later version.
#
# EnterpriseStorageBox is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with EnterpriseStorageBox. If not, see <http://www.gnu.org/licenses/>.

import apt
import re
import subprocess
import xml.etree.ElementTree

################################################################################
# Globals
################################################################################
DEFAULT_FILE = "/etc/default/enterprisestoragebox"
APT_UPGRADE_INDEX_FILE = "/var/lib/enterprisestoragebox/apt/upgradeindex.json"
APT_PLUGINS_INDEX_FILE = "/var/lib/enterprisestoragebox/apt/pluginsindex.json"

# Import global variables from '/etc/default/enterprisestoragebox'.
__etc_default_dict = {}
with open(DEFAULT_FILE) as reader:
	for line in reader.readlines():
		m = re.match(r"^(ESB_([A-Z0-9_]+))=(\")?([^\"]+)(\")?$",
			line.strip())
		if not m:
			continue
		# Append variable, e.g. SCRIPTS_DIR
		__etc_default_dict[m.group(2)] = m.group(4)
		# !!! DEPRECATED !!!
		# Append variable, e.g. ESB_SCRIPTS_DIR (equal to PHP ESB framework)
		__etc_default_dict[m.group(1)] = m.group(4)
		
locals().update(__etc_default_dict)

################################################################################
# Functions
################################################################################
def shell(command, stderr=False):
	"""
	Execute an external program in the default shell and returns a tuple
	with the command return code and output.

	:param stderr: If TRUE, then return the stderr output, too.
	:type  stderr: bool
	"""
	p = subprocess.Popen("LANG=C "+command, shell=True,
		stderr=subprocess.PIPE, stdout=subprocess.PIPE)
	t = p.communicate()
	return (p.returncode, t[0].decode() + (t[1].decode() if stderr else ""))

################################################################################
# Classes
################################################################################
class ProductInfo(object):
	"""
	This class provides a simple interface to get product information.
	"""

	def __init__(self):
		self.__dict = {}
		tree = xml.etree.ElementTree.parse(PRODUCTINFO_FILE)
		for child in tree.iter():
			self.__dict[child.tag] = child.text

	def get_name(self):
		"""
		Get the product name.
		"""
		return self.__dict["name"]

	def get_version(self):
		"""
		Get the product version.
		"""
		cache = apt.cache.Cache()
		package = cache[self.get_package_name()]
		return package.candidate.version

	def get_version_name(self):
		"""
		Get the product version/release name.
		"""
		return self.__dict["versionname"]

	def get_url(self):
		"""
		Get the URL to the product homepage.
		"""
		return self.__dict["url"]

	def get_copyright(self):
		"""
		Get the copyright text.
		"""
		return self.__dict["copyright"]

	def get_package_name(self):
		"""
		Get the Debian package name.
		"""
		return self.__dict["packagename"]

	def get_distribution_name(self):
		"""
		Get the package repository distribution name.
		"""
		return self.__dict["distribution"]
