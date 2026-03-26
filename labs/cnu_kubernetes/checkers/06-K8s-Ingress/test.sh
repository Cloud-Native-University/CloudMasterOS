#!/bin/bash
# Tarea 6: Recurso Ingress con al menos una regla de host
INGRESS=$(kubectl get ingress -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.rules[0].host}{"\n"}{end}' 2>/dev/null)

if [[ -n "$INGRESS" ]]; then
  echo "SUCCESS: Ingress detectado: $INGRESS"
  exit 0
else
  echo "FAIL: No se encontró ningún recurso Ingress. Verifica con: kubectl get ingress"
  exit 1
fi
