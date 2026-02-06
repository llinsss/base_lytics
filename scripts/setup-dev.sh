#!/bin/bash
# Setup daily development automation
# Add to crontab: 0 0 * * * /Users/user/Documents/baselytics/scripts/setup-dev.sh

cd /Users/user/Documents/baselytics
/usr/bin/python3 scripts/dev-automation.py >> scripts/.dev.log 2>&1
