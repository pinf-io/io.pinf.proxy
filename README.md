io.pinf.proxy
=============

This project contains two implementations that are being merged.

1. `org.pinf.genesis.lib` based and used in ZeroSystem
------------------------------------------------------

Test/Dev:

`PINF_PROGRAM_PATH=program.json node server.js`

Run:

`bin/install-and-start`


2. `ccjson` based and used in Niko.Cloud
----------------------------------------

Test/Dev:

`bin/start.sh`

Run:

Uses `mon` via `bash.origin.process` to create a daemonized process.

`bin/start.sh <ccJSON_ConfigFile>`
