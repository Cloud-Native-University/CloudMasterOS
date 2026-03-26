#!/bin/bash
REPLICAS=$(kubectl get deployment portal-bancario -o jsonpath='{.spec.replicas}' 2>/dev/null)
DB_USER=$(kubectl get secret db-credentials -o jsonpath='{.data.db-user}' 2>/dev/null | base64 -d)
if [ "$REPLICAS" == "3" ] && [ "$DB_USER" == "admin" ]; then echo "SUCCESS: MASTER ARCHITECT!"; exit 0; else echo "FAIL"; exit 1; fi
