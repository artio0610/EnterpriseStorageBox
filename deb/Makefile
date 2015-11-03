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

# Update changelog via CLI:
# export DEBEMAIL=artio0610@gmail.com; export DEBFULLNAME="Artur Osinski-Stachowicz"; dch -i -D stable -u low

ESB_SUBDIRS := $(shell find . -maxdepth 1 -name 'enterprisestoragebox*' -type d)

# Targets to process all EnterpriseStorageBox plugin packages.
clean binary esb_pull_po esb_push_pot esb_build_pot:
	for dir in $(ESB_SUBDIRS); do \
		cd $(CURDIR)/$$dir && fakeroot debian/rules $@; \
	done

.PHONY: clean binary esb_pull_po esb_push_pot esb_build_pot
