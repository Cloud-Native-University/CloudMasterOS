#!/bin/bash
# Tarea 3: Pod logger-system con sidecar (2 contenedores)
CONTAINERS=$(kubectl get pod logger-system -o jsonpath='{.spec.containers[*].name}' 2>/dev/null | wc -w)
STATUS=$(kubectl get pod logger-system -o jsonpath='{.status.phase}' 2>/dev/null)

if [[ "$CONTAINERS" -ge 2 && "$STATUS" == "Running" ]]; then
  echo "SUCCESS: Pod logger-system con $CONTAINERS contenedores en estado Running"
  exit 0
else
  echo "FAIL: El pod 'logger-system' debe existir con al menos 2 contenedores (app + sidecar) en estado Running. Contenedores detectados: $CONTAINERS, Estado: $STATUS"
  exit 1
fi
