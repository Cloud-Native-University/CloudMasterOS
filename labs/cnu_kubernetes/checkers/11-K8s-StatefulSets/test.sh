#!/bin/bash
# Tarea 11: StatefulSet con 3 réplicas
STS=$(kubectl get statefulset -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
REPLICAS=$(kubectl get statefulset "$STS" -o jsonpath='{.spec.replicas}' 2>/dev/null)

if [[ -n "$STS" && "$REPLICAS" -ge 3 ]]; then
  echo "SUCCESS: StatefulSet '$STS' detectado con $REPLICAS réplicas"
  exit 0
else
  echo "FAIL: No se encontró un StatefulSet con al menos 3 réplicas. Revisa tu configuración."
  exit 1
fi
