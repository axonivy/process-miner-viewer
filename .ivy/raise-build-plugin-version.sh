#!/bin/bash

mvn --batch-mode versions:set-property versions:commit -f tests/miner-test-project/pom.xml -Dproperty=project.build.plugin.version -DnewVersion=${2} -DallowSnapshots=true
