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


        # TODO: Use something like 'BO_PLUGIN_LOOKUP_PATHS' in 'bash.origin' to abstract this.
        local pluginUri="${__BO_DIR__}/../../github.com~bash-origin~bash.origin.process/bash.origin.process.sh"
        if [ ! -e "${pluginUri}" ]; then
            pluginUri="bash.origin.process@master"
        fi


        if BO_callPlugin "${pluginUri}" BO_Process_IsDaemonized; then

            if [ ! -z "$1" ]; then
                export _EXTRA_CONFIG_PATH="$1"
            fi

            BO_log "$VERBOSE" "_EXTRA_CONFIG_PATH: $_EXTRA_CONFIG_PATH"

            BO_run_node "${__BO_DIR__}/start.js"
        else
            BO_callPlugin "${pluginUri}" BO_Process_Daemonize "${__BO_DIR__}/start.sh"
        fi


        BO_format "${VERBOSE}" "FOOTER"
    }

    Start "$@"
}
init "$@"
