#!/bin/bash
# Tarea 14: ReplicaSet con 3 réplicas
RS=$(kubectl get rs -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
REPLICAS=$(kubectl get rs "$RS" -o jsonpath='{.spec.replicas}' 2>/dev/null)

if [[ -n "$RS" && "$REPLICAS" -ge 3 ]]; then
  echo "SUCCESS: ReplicaSet '$RS' activo con $REPLICAS réplicas"
  exit 0
else
  echo "FAIL: No se encontró un ReplicaSet con al menos 3 réplicas."
  exit 1
fi
