#!/bin/bash
# Tarea 2: Logs y describe del pod web-legacy
POD=$(kubectl get pod web-legacy -o jsonpath='{.metadata.name}' 2>/dev/null)
if [[ "$POD" == "web-legacy" ]]; then
  echo "SUCCESS: Pod web-legacy encontrado y accesible para diagnóstico"
  exit 0
else
  echo "FAIL: El pod 'web-legacy' no existe. Completa la Tarea 1 primero."
  exit 1
fi
