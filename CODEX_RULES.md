# Reglas para Codex

- Trabajamos sin Docker; configura y ejecuta servicios directamente en la máquina local.
- Usa Turbopack (`next dev --turbopack`) como modo por defecto para el frontend.
- Mantén los cambios enfocados y haz un commit conciso después de cada ajuste relevante.
- Prioriza documentación breve: solo `README.md` y este archivo deben vivir en la raíz.
- Antes de ejecutar comandos que escriban en disco או necesiten privilegios, valida que sean necesarios y anota el propósito.
- Prefiere comandos que no requieran interacción (por ejemplo, evita asistentes que pidan input en tiempo real).
- Cuando algo falle por servicios externos (DB apagada, etc.), informa y deja instrucciones para retomarlo.
- Las respuestas deben ser claras, en tono de compañerx de equipo, y en español salvo solicitud explícita.
