#!/bin/bash
docker volume ls | grep -q app_data && exit 0 || exit 1
