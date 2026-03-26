#!/bin/bash
# Tarea 5: PersistentVolumeClaim de al menos 1Gi
PVC=$(kubectl get pvc -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.resources.requests.storage}{"\n"}{end}' 2>/dev/null)

if echo "$PVC" | grep -qE "1Gi|2Gi|5Gi|10Gi"; then
  echo "SUCCESS: PersistentVolumeClaim con almacenamiento >= 1Gi encontrado"
  exit 0
else
  echo "FAIL: No se encontró un PVC con almacenamiento de 1Gi. Verifica con: kubectl get pvc"
  exit 1
fi
