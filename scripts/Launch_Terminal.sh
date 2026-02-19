#!/bin/bash
# Launch Script for Approval Terminal on RG40XX V (Knulli/muOS)

# 1. Kill any existing instances to avoid duplicates
pkill -f rg40xx-client.py

# 2. Get the directory where this script is located
DIR="$(cd "$(dirname "$0")" && pwd)"

# 3. Launch the python script
# Using standard python3 binary available on Knulli/muOS
# If python3 is not in PATH, try strictly defined paths like /usr/bin/python3
python3 "$DIR/rg40xx-client.py" > "$DIR/rg40xx_log.txt" 2>&1
