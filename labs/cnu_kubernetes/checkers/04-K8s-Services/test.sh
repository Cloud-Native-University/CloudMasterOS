#!/bin/bash
# Tarea 4: Pod con Liveness Probe HTTP en puerto 80
PROBE=$(kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.containers[0].livenessProbe.httpGet.port}{"\n"}{end}' 2>/dev/null | grep "80")

if [[ -n "$PROBE" ]]; then
  echo "SUCCESS: Liveness Probe HTTP en puerto 80 detectado"
  exit 0
else
  echo "FAIL: Ningún pod tiene configurado un Liveness Probe HTTP en el puerto 80. Revisa tu livenessProbe.httpGet.port"
  exit 1
fi
