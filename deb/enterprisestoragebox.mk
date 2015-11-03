# -*- mode: makefile; coding: utf-8 -*-
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

ESB_PACKAGE := $(shell pwd | sed 's|.*/||')
ESB_POT_DIR := $(CURDIR)/usr/share/enterprisestoragebox/locale
ESB_POT_FILE := $(ESB_PACKAGE).pot
ESB_TRANSIFEX_PROJECT_SLUG := enterprisestoragebox

esb_pull_po:
	tx --root="$(CURDIR)/../" pull --all \
	  --resource=$(ESB_TRANSIFEX_PROJECT_SLUG).$(ESB_PACKAGE)

esb_push_pot:
	tx --root="$(CURDIR)/../" push --source \
	  --resource=$(ESB_TRANSIFEX_PROJECT_SLUG).$(ESB_PACKAGE)

esb_build_pot:
	dh_testdir
	dh_clean
	echo "Building PO template file ..." >&2
	mkdir -p $(ESB_POT_DIR)
	find $(CURDIR) \( -iname *.js -o -iname *.php -o -iname *.inc \) \
	  -type f -print0 | xargs -0r xgettext --keyword=_ \
	  --output-dir=$(ESB_POT_DIR) --output=$(ESB_POT_FILE) \
	  --force-po --no-location --no-wrap --sort-output \
	  --package-name=$(ESB_PACKAGE) --from-code=UTF-8 -
	# Remove '#, c-format' comments, otherwise manuall upload of translation
	# files confuses Transifex.
	sed --in-place '/^#, c-format/d' $(ESB_POT_DIR)/$(ESB_POT_FILE)

esb_clean_scm:
	dh_testdir
	echo "Removing SCM files ..." >&2
	find $(CURDIR)/debian/$(ESB_PACKAGE) \( -name .svn -o -name .git \) \
	  -type d -print0 -prune | xargs -0r rm -rf

esb_build_doc: debian/doxygen.conf
	mkdir -p debian/doxygen
	doxygen $<

source: clean
	dpkg-buildpackage -S -us -uc

.PHONY: esb_pull_po esb_push_pot esb_build_pot esb_clean_scm esb_build_doc
.PHONY: source
