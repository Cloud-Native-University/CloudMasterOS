#!/bin/bash
docker network ls | grep -q cnu_net && exit 0 || exit 1
