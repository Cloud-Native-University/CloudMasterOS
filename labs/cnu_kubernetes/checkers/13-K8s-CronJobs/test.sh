#!/bin/bash
# Tarea 13: CronJob de conciliación
CJ=$(kubectl get cronjob -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [[ -n "$CJ" ]]; then
  echo "SUCCESS: CronJob '$CJ' programado correctamente"
  exit 0
else
  echo "FAIL: No se encontró ningún CronJob. Verifica con: kubectl get cronjobs"
  exit 1
fi
