# PROJECT_MASTER_PROMPT — BELENTANI NEXUS — capa de gobernanza y evidencia

**Canon estratégico individual · 22/10/2026 · belentani7/nexus-machine-ops**

## 1. Contexto comprobado / límites de evidencia

Repositorio con client/, server/, shared/, drizzle/, tests y docs. README describe consola de simulación de máquina, telemetría sintética, control de roles, auditoría encadenada y aprobación triple. No hay hardware real ni adaptador de control físico. Su visión de NEXUS abarca ciclo captura-contextualiza-planifica-produce-verifica-aprueba-entrega-aprende, sin fusionar proyectos.

## 2. Máximo potencial: dirección de producto

Transformar NEXUS en **plano de control verificable de trabajo humano + IA**: contexto y pruebas ligados a cada entregable, permisos por recurso, evaluaciones reproducibles, aprobación humana, empaquetado con hashes y aprendizaje de resultados. La simulación actual debe servir de dominio de referencia, no imponerse a música, educación o negocio.

## 3. UX y funciones máximas deseadas

Home de operaciones con tareas, runbook, riesgos, evidencias, aprobaciones y estados de ciclo. Plantillas por vertical separadas; cada ejecución con manifiesto, archivo de evidencia, coste, decisión y rollback. Distinción clara «simulación vs sistema externo real». Accesibilidad, seguridad y explicabilidad deben ser parte de la experiencia.

## 4. Arquitectura evolutiva

Conservar bounded context de simulación; separar núcleo de workflow, esquema de recursos y adaptadores. RBAC probado y separación requester/approver, ids idempotentes, eventos con cadena de integridad y políticas versionadas, prohibición de acción física. Un API de evidencia no equivale a autorización. Drizzle/migraciones deben conservar compatibilidad.

## 5. Roadmap ejecutable

1. Verificar tests de gateways, expiración, roles y aprobaciones triples. 2. Reforzar evidencia y trazas del simulador. 3. Abstraer contractos de workflow de dominio sin romper consola. 4. Construir segundo flujo no crítico de ejemplo con autorización explícita. 5. Versionar paquetes de entrega y replay seguro para incidentes.

## 6. Lo que no debe hacerse

No conectar dispositivos industriales, servicios de dinero, secretos, despliegue real ni hardware con la simulación. Ninguna IA reemplaza una aprobación humana para acciones críticas.

## Ejecución para agentes
Lee este canon junto con README, código, cambios recientes y pruebas. Distingue implementado, parcial y propuesto; jamás conviertas deseos en hechos. No crees otro repositorio ni mezcles productos por analogía. Trabaja por incrementos **end-to-end**: contexto → contrato → interfaz → lógica → datos, si hacen falta → estados de error → pruebas → entrega validada. Respeta secretos, permiso, usuario, derechos y arquitectura existente. Prioriza el mayor valor verificable, no un informe o rediseño vacío. Un agente nunca tiene permiso implícito para divulgar datos, desplegar, gastar o ejecutar acciones irreversibles.

**Prompt operativo:** «Trabaja como equipo senior de estrategia, producto, diseño, ingeniería, seguridad y QA exclusivamente de ESTE proyecto. Recupera el contexto de sus archivos y haz crecer su visión hasta su máximo potencial **mediante cambios reales comprobados**. Elige y completa la siguiente entrega de mayor impacto sin falsificar funciones o registros. Conserva el concepto canónico, preserva la historia y deja pruebas, criterios de aceptación y límites explícitos».
