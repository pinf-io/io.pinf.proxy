#!/bin/bash -e
# Source https://github.com/bash-origin/bash.origin
if [ -z "${BO_LOADED}" ]; then
    . "${HOME}/.bash.origin"
fi
function init {
    eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
    BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
    local __BO_DIR__="${___TMP___}"

    function Test {
        BO_format "${VERBOSE}" "HEADER" "Test"


        export _BO_PROCESS_DAEMONIZED=1
        BO_sourcePrototype "${__BO_DIR__}/../bin/start.sh" "${__BO_DIR__}/config/config.cc.json"


        BO_format "${VERBOSE}" "FOOTER"
    }

    Test "$@"
}
init "$@"
