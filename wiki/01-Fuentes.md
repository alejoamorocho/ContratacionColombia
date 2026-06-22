# De dónde vienen los datos

## Fuente principal: SECOP II

Los datos provienen del **SECOP II** (Sistema Electrónico de Contratación Pública) de Colombia Compra Eficiente, publicado como datos abiertos. Es el registro oficial de la contratación del Estado colombiano.

El dashboard usa el dataset de **contratos** (no procesos ni planes): el contrato firmado entre una entidad pública y un contratista.

## Ventana

**2022–2026.** Cinco años de contratos firmados. Notas:

- **2026** es parcial: se va completando a medida que se publican más contratos.
- El **primer semestre de 2022** tiene cobertura más baja en SECOP; las cifras de ese periodo deben leerse con esa salvedad.

## Columnas que usamos

El materializador agrega estas columnas de la tabla `contratos`:

| Columna | Uso |
|---------|-----|
| `valor` | Monto del contrato (suma, percentiles) |
| `fecha_firma` | Define el año del contrato |
| `entidad_nit`, `entidad_nombre` | Entidad contratante |
| `contratista_nit` | Contratista (conteo de únicos, concentración) |
| `modalidad` | Modalidad de contratación (directa, licitación, etc.) |
| `objeto_clasificado` | Sector |
| `orden` | Nivel de gobierno (nacional, territorial…) |
| `entidad_departamento` | Departamento (se normaliza a código DANE) |

## Límites

- Los datos son **tan buenos como la fuente**: si una entidad reporta tarde o con errores, eso se refleja.
- Mostramos **agregados**, no contratos individuales.
- No cruzamos con otras fuentes ni inferimos irregularidades: ver **[Metodología](03-Metodologia.md)**.
