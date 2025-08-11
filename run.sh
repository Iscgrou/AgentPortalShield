#!/bin/bash
cd /home/runner/workspace
export NODE_ENV=development
exec npx tsx server/index.ts