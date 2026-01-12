#!/bin/bash
cd /home/aprecords-ssh/htdocs/allianceproductions.ca
export PATH="/usr/bin:$PATH"
npx pm2 start ecosystem.config.js --update-env
