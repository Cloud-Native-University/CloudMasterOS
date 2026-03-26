if kubectl top nodes >/dev/null 2>&1; then echo "SUCCESS"; exit 0; else echo "FAIL"; exit 1; fi
