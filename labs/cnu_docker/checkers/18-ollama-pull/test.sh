#!/bin/bash
docker exec ollama ollama list | grep -q qwen && exit 0 || exit 1
