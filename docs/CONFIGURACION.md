# Configuración y estructura

- `src/app`: rutas y pantallas Next.js.
- `src/lib`: datos y lógica compartida.
- `public`: recursos públicos, nunca documentos privados.
- `tests`: comprobaciones del dominio.

Sin telemetría propia, anuncios ni fuentes cargadas desde servicios externos. La telemetría de Next.js puede desactivarse con `NEXT_TELEMETRY_DISABLED=1`.

No hay variables obligatorias. Modifica `src/lib/catalog.ts` para ampliar el catálogo. Conserva identificadores únicos, textos alternativos y rutas locales. Las ilustraciones de partida son WebP de 1200 × 800.
