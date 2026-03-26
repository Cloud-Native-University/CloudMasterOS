#!/bin/bash
# Tarea 8: Secret personalizado (Opaque)
SECRET=$(kubectl get secret -o jsonpath='{range .items[?(@.type=="Opaque")]}{.metadata.name}{"\n"}{end}' 2>/dev/null)

if [[ -n "$SECRET" ]]; then
  echo "SUCCESS: Secret Opaque encontrado: $SECRET"
  exit 0
else
  echo "FAIL: No se encontró ningún Secret de tipo Opaque. Verifica con: kubectl get secret"
  exit 1
fi
