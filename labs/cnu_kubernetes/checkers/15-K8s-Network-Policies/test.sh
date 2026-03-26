#!/bin/bash
# Tarea 15: Deployment con RollingUpdate
STRATEGY=$(kubectl get deploy -o jsonpath='{.items[0].spec.strategy.type}' 2>/dev/null)
if [[ "$STRATEGY" == "RollingUpdate" ]]; then
  echo "SUCCESS: Deployment con estrategia RollingUpdate detectado"
  exit 0
else
  echo "FAIL: El deployment no usa la estrategia RollingUpdate. Revisa spec.strategy.type"
  exit 1
fi
