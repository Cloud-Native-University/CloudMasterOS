#!/bin/bash
docker info | grep -qi "Swarm: active" && exit 0 || exit 1
