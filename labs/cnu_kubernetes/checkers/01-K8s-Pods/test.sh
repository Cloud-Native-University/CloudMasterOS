#!/bin/bash
# Tarea 1 (Simplificada): ¿Existe el pod web-legacy?
POD=$(kubectl get pod web-legacy -o jsonpath='{.metadata.name}' 2>/dev/null)

if [[ "$POD" == "web-legacy" ]]; then
  # Si el nombre coincide, ¡misión cumplida!
  echo "SUCCESS"
  exit 0
else
  # Si no existe, le recordamos el nombre al estudiante
  echo "FAIL: Crea el pod con el nombre 'web-legacy'"
  exit 1
fi
