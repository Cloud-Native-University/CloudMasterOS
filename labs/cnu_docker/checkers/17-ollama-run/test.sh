#!/bin/bash
docker ps | grep -q ollama/ollama && exit 0 || exit 1
