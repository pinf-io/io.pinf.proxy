#!/bin/bash -e
# Source https://github.com/bash-origin/bash.origin
if [ -z "${BO_LOADED}" ]; then
    . "${HOME}/.bash.origin"
fi
function init {
    eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
    BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
    local __BO_DIR__="${___TMP___}"

    function Start {
        BO_format "${VERBOSE}" "HEADER" "Start"


        # TODO: Use bash.origin.process to daemonize process.


        BO_run_node "${__BO_DIR__}/start.js"


        BO_format "${VERBOSE}" "FOOTER"
    }

    Start $@
}
init $@
