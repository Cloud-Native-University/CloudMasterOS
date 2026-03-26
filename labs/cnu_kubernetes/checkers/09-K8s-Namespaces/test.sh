#!/bin/bash
# Tarea 9: Namespace marketing-dept
NS=$(kubectl get namespace marketing-dept -o jsonpath='{.metadata.name}' 2>/dev/null)

if [[ "$NS" == "marketing-dept" ]]; then
  echo "SUCCESS: Namespace 'marketing-dept' creado correctamente"
  exit 0
else
  echo "FAIL: El namespace 'marketing-dept' no existe. Ejecuta: kubectl create ns marketing-dept"
  exit 1
fi
