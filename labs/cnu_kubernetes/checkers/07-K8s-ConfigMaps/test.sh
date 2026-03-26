#!/bin/bash
# Tarea 7: ConfigMap con al menos una clave de datos
CM=$(kubectl get configmap -o jsonpath='{range .items[?(@.metadata.name!="kube-root-ca.crt")]}{.metadata.name}{"\n"}{end}' 2>/dev/null)

if [[ -n "$CM" ]]; then
  echo "SUCCESS: ConfigMap encontrado: $CM"
  exit 0
else
  echo "FAIL: No se encontró ningún ConfigMap personalizado. Verifica con: kubectl get configmap"
  exit 1
fi
