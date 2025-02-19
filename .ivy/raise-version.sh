#!/bin/bash
set -e

mvn --batch-mode -f tests/miner-test-project/pom.xml versions:set versions:commit -DnewVersion=${1}

npm version ${1/SNAPSHOT/next} --no-git-tag-version
npm install
