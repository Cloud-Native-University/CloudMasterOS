#!/bin/bash
# Tarea 3: Validar que el alumno capturó el contenido exacto de flag1.txt
# El alumno debe crear un archivo 'captured_flag.txt' en su project/ folder

FLAG_REAL="CNU{P4th_Tr4v3rsal_Succe3s_2026}"

if [ ! -f /opt/cloudmaster/project/captured_flag.txt ]; then
  echo "FAIL: No has capturado la flag todavía. Crea el archivo 'captured_flag.txt' con el contenido robado."
  exit 1
fi

CONTENIDO=$(cat /opt/cloudmaster/project/captured_flag.txt)

if [[ "$CONTENIDO" == "$FLAG_REAL" ]]; then
  echo "SUCCESS: ¡Flag Capturada! 🚩 Has explotado la vulnerabilidad correctamente."
  exit 0
else
  echo "FAIL: El contenido del archivo no coincide con la flag real. Sigue buscando."
  exit 1
fi
