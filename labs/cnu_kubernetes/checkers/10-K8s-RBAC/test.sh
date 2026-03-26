#!/bin/bash
# Tarea 10: ServiceAccount personalizado (no default)
SA=$(kubectl get sa -o jsonpath='{range .items[?(@.metadata.name!="default")]}{.metadata.name}{"\n"}{end}' 2>/dev/null)

if [[ -n "$SA" ]]; then
  echo "SUCCESS: ServiceAccount encontrado: $SA"
  exit 0
else
  echo "FAIL: No se encontró ningún ServiceAccount personalizado. Crea uno con: kubectl create sa <nombre>"
  exit 1
fi
