#!/bin/bash
# Tarea 20: ResourceQuota en marketing-dept
QUOTA=$(kubectl get quota -n marketing-dept -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [[ -n "$QUOTA" ]]; then
  echo "SUCCESS: ResourceQuota '$QUOTA' encontrado en el namespace marketing-dept"
  exit 0
else
  echo "FAIL: No se encontró un ResourceQuota en el namespace 'marketing-dept'. Crea el namespace y la cuota primero."
  exit 1
fi
