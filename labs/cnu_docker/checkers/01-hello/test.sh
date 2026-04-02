#!/bin/bash
docker images | grep -q hello-world && echo "Completado" || exit 1
