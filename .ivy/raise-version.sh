#!/bin/bash
set -e

mvn --batch-mode -f tests/miner-test-project/pom.xml versions:set versions:commit -DnewVersion=${1}

npm install
yarn lerna version ${1/SNAPSHOT/next} --no-git-tag-version --no-push --ignore-scripts --exact --yes
npm install
