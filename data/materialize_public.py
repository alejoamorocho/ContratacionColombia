"""Genera ``public/data/*.json`` (snapshot 2022-2026) desde BigQuery.

Lee ``vectorvi.vectorvi.contratos`` (ventana 2022-2026, valor>0) y escribe
seis JSON con EXACTAMENTE la forma de ``src/lib/types.ts`` del dashboard
público (meta, panorama, quien, como, donde, senales).

Las funciones ``shape_*`` son PURAS: transforman filas dict -> dict del tipo
y no tocan BigQuery (testeables sin credenciales). La ejecución contra BQ vive
en ``run()`` y sus helpers ``_client``/``_q``.

Uso:
    pip install -r requirements.txt
    export GCP_PROJECT=vectorvi BQ_DATASET=vectorvi   # defaults: 'vectorvi'
    python materialize_public.py

Requiere ``gcloud auth application-default login`` (o credenciales de servicio).
"""
from __future__ import annotations

import datetime
import json
import os
from pathlib import Path
from typing import Any

# ─── Configuración por entorno ──────────────────────────────────────────────

YEAR_FROM = int(os.environ.get("YEAR_FROM", "2022"))
YEAR_TO = int(os.environ.get("YEAR_TO", "2026"))
PROJECT = os.environ.get("GCP_PROJECT", "vectorvi")
DATASET = os.environ.get("BQ_DATASET", "vectorvi")

OUT = Path(__file__).resolve().parent.parent / "public" / "data"
QUERIES_DIR = Path(__file__).resolve().parent / "queries"

DATE_FROM = f"{YEAR_FROM}-01-01"
DATE_TO = f"{YEAR_TO}-12-31"

# Filtro común a todos los agregados (documentado; los .sql lo embeben literal).
WHERE = (
    f"fecha_firma BETWEEN '{DATE_FROM}' AND '{DATE_TO}' "
    f"AND valor IS NOT NULL AND valor > 0"
)

# Tabla base LIMPIA: ventana + valor>0 + DEDUPLICADA por id. Todos los agregados
# leen de aquí (vía _sql), garantizando que ningún contrato se cuente dos veces.
BASE_TABLE = f"{PROJECT}.{DATASET}._contratos_pub"
_BASE_COLS = (
    "id, valor, valor_facturado, valor_pagado, fecha_firma, entidad_nit, "
    "entidad_nombre, contratista_nit, modalidad, objeto_clasificado, orden, "
    "entidad_departamento, es_pyme, "
    "recursos_pgn, recursos_sgp, recursos_regalias, recursos_propios"
)

# Normalizaciones centralizadas: se calculan UNA sola vez en la tabla base
# (DRY) y todas las queries consumen las columnas limpias `modalidad_norm` y
# `objeto_label`, en lugar de repetir el mismo CASE en cada archivo .sql.
_M = "REGEXP_REPLACE(NORMALIZE(UPPER(modalidad), NFD), r'\\pM', '')"
_MODALIDAD_NORM = (
    "CASE WHEN modalidad IS NULL THEN 'Otras'"
    f" WHEN {_M} LIKE '%DIRECTA%' THEN 'Contratación directa'"
    f" WHEN {_M} LIKE '%REGIMEN%ESPECIAL%' THEN 'Régimen especial'"
    f" WHEN {_M} LIKE '%MINIMA%' THEN 'Mínima cuantía'"
    f" WHEN {_M} LIKE '%ABREVIAD%' OR {_M} LIKE '%MENOR CUANTIA%' OR {_M} LIKE '%SUBASTA%' THEN 'Selección abreviada'"
    f" WHEN {_M} LIKE '%LICITACION%' THEN 'Licitación pública'"
    f" WHEN {_M} LIKE '%MERITOS%' OR {_M} LIKE '%CONCURSO%' THEN 'Concurso de méritos'"
    " ELSE 'Otras' END"
)
# Clave normalizada del objeto: primer segmento (antes de la 1ª coma), sin
# tildes ni punto final, en MAYÚSCULAS. Colapsa las variantes sucias del mismo
# concepto que trae la fuente —'CONSULTORÍA', 'CONSULTORÍA.', 'CONSULTORIA,
# APOYO, GESTION'— a una sola clave 'CONSULTORIA', evitando que la categoría
# se fragmente en docenas de etiquetas casi iguales.
_OBJ_KEY = (
    "REGEXP_REPLACE(NORMALIZE(UPPER(TRIM("
    "SPLIT(COALESCE(objeto_clasificado, 'SIN_CLASIFICAR'), ',')[OFFSET(0)]"
    ")), NFD), r'[\\pM.]', '')"
)
_OBJETO_LABEL = (
    f"CASE {_OBJ_KEY}"
    " WHEN 'SALUD' THEN 'Salud' WHEN 'CONSULTORIA' THEN 'Consultoría'"
    " WHEN 'CONTRATACION_PERSONAL' THEN 'Contratación de personal' WHEN 'EDUCACION' THEN 'Educación'"
    " WHEN 'APOYO_GESTION' THEN 'Apoyo a la gestión' WHEN 'JURIDICO' THEN 'Jurídico'"
    " WHEN 'CULTURA_DEPORTE' THEN 'Cultura y deporte' WHEN 'SOCIAL' THEN 'Social'"
    " WHEN 'CONSTRUCCION' THEN 'Construcción' WHEN 'TECNOLOGIA' THEN 'Tecnología'"
    " WHEN 'SEGURIDAD' THEN 'Seguridad' WHEN 'COMUNICACIONES' THEN 'Comunicaciones'"
    " WHEN 'FINANCIERO' THEN 'Financiero' WHEN 'ARRENDAMIENTO' THEN 'Arrendamiento'"
    " WHEN 'ALIMENTACION' THEN 'Alimentación' WHEN 'TRANSPORTE' THEN 'Transporte'"
    " WHEN 'AGROPECUARIO' THEN 'Agropecuario' WHEN 'MEDIO_AMBIENTE' THEN 'Medio ambiente'"
    " WHEN 'CAPACITACION_FORMACION' THEN 'Capacitación y formación' WHEN 'GESTION_DOCUMENTAL' THEN 'Gestión documental'"
    " WHEN 'MANTENIMIENTO' THEN 'Mantenimiento' WHEN 'VIVIENDA' THEN 'Vivienda'"
    " WHEN 'SUMINISTRO' THEN 'Suministro' WHEN 'ASEO' THEN 'Aseo'"
    " WHEN 'TELECOMUNICACIONES' THEN 'Telecomunicaciones' WHEN 'AGUA_SANEAMIENTO' THEN 'Agua y saneamiento'"
    " WHEN 'CATASTRO' THEN 'Catastro' WHEN 'DEFENSA' THEN 'Defensa'"
    " WHEN 'INTERVENTORIA' THEN 'Interventoría'"
    " WHEN 'SERVICIOS_PUBLICOS' THEN 'Servicios públicos' WHEN 'MINAS_ENERGIA' THEN 'Minas y energía'"
    " WHEN 'INFRAESTRUCTURA' THEN 'Infraestructura'"
    " WHEN 'SIN_CLASIFICAR' THEN 'Sin clasificar'"
    f" ELSE INITCAP(REPLACE({_OBJ_KEY}, '_', ' ')) END"
)

FUENTES = [
    "SECOP II — Contratos y Procesos (Colombia Compra Eficiente)",
    "PAA — Plan Anual de Adquisiciones (SECOP II)",
    "BPIN — Inversión pública (DNP)",
    "Sanciones — SIRI (Procuraduría)",
    "Aportes a campañas — Cuentas Claras (CNE)",
]

# Frescura por fuente: periodo que cubre el dato y cuándo se ingirió (verificado
# contra BigQuery). Cada fuente tiene su propio corte; esto da la lógica temporal.
FUENTES_DETALLE = [
    {"fuente": "Contratos (SECOP II)", "periodo": "2022–2026", "corte": "firmados hasta jun-2026", "ingesta": "jun-2026"},
    {"fuente": "Procesos (SECOP II)", "periodo": "2022–2026", "corte": "hasta jun-2026", "ingesta": "jun-2026"},
    {"fuente": "PAA — planeación (SECOP II)", "periodo": "2024–2026", "corte": "planes publicados", "ingesta": "may-2026"},
    {"fuente": "BPIN — inversión (DNP)", "periodo": "vigencias 2025–2026", "corte": "presupuesto vigente", "ingesta": "abr-2026"},
    {"fuente": "Sanciones (SIRI / Procuraduría)", "periodo": "2022–2026", "corte": "iniciadas 2022–2026; inhabilidades vigentes a la fecha", "ingesta": "2026"},
    {"fuente": "Aportes de campaña (CNE)", "periodo": "2022–2023", "corte": "ciclos electorales", "ingesta": "abr-2026"},
    {"fuente": "RUES / Supersociedades (cruces)", "periodo": "hasta 2024–2026", "corte": "registro y finanzas", "ingesta": "mar–may 2026"},
]

NOTAS = [
    "Cifras agregadas de SECOP II. Describe, no juzga.",
    f"{YEAR_TO} es un año parcial: solo incluye contratos firmados hasta el corte de datos.",
    "El primer semestre de 2022 tiene cobertura baja en SECOP II frente al resto de la serie.",
    "El valor es el del contrato firmado; no refleja adiciones ni ejecución posterior.",
    "El valor total es sensible a unos pocos contratos de cuantía extrema "
    "(que pueden incluir errores de digitación en la fuente); por eso se muestra "
    "también el valor mediano, robusto a esos casos.",
    "Los conteos están deduplicados por identificador de contrato; los "
    "departamentos se normalizan a código DANE para el mapa.",
]

NOTAS_METODOLOGICAS = [
    "La concentración del top-10 mide qué porcentaje del valor total fue "
    "adjudicado a los 10 mayores contratistas. No implica irregularidad.",
    "Los percentiles describen la distribución del valor por contrato. Un "
    "percentil alto solo indica un contrato de mayor cuantía.",
    "El porcentaje de contratación directa es un dato estadístico; su uso es "
    "legítimo en numerosos supuestos legales.",
]


# ─── Coerción a tipos JSON-safe ─────────────────────────────────────────────
# BigQuery devuelve int para COUNT/EXTRACT y Decimal/float para SUM(NUMERIC).
# El frontend espera number; normalizamos a int o float nativos de Python.


def _i(v: Any) -> int:
    """Entero JSON-safe (None -> 0)."""
    return int(v) if v is not None else 0


def _f(v: Any) -> float:
    """Flotante JSON-safe (None -> 0.0). Acepta Decimal de BQ."""
    return float(v) if v is not None else 0.0


def _s(v: Any, default: str = "") -> str:
    """String JSON-safe (None -> default)."""
    return str(v) if v is not None else default


# ─── Funciones PURAS de forma (filas dict -> dict del tipo) ─────────────────


def shape_panorama(
    rows_kpi: list[dict[str, Any]],
    rows_anio: list[dict[str, Any]],
    rows_sect: list[dict[str, Any]],
) -> dict[str, Any]:
    """PanoramaData: kpis + por_anio + top_sectores."""
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {
            "contratos": _i(k.get("contratos")),
            "valor_total": _f(k.get("valor_total")),
            "valor_mediano": _f(k.get("valor_mediano")),
            "entidades": _i(k.get("entidades")),
            "contratistas": _i(k.get("contratistas")),
        },
        "por_anio": [
            {
                "anio": _i(r.get("anio")),
                "contratos": _i(r.get("contratos")),
                "valor": _f(r.get("valor")),
            }
            for r in rows_anio
        ],
        "top_sectores": [
            {
                "sector": _s(r.get("sector"), "Sin clasificar"),
                "contratos": _i(r.get("contratos")),
                "valor": _f(r.get("valor")),
            }
            for r in rows_sect
        ],
    }


def shape_quien(
    rows_ent: list[dict[str, Any]],
    rows_nivel: list[dict[str, Any]],
    rows_sector: list[dict[str, Any]],
) -> dict[str, Any]:
    """QuienData: top_entidades + por_nivel + por_sector."""
    return {
        "top_entidades": [
            {
                "nombre": _s(r.get("nombre")),
                "nit": _s(r.get("nit")),
                "valor": _f(r.get("valor")),
                "contratos": _i(r.get("contratos")),
            }
            for r in rows_ent
        ],
        "por_nivel": [
            {
                "nivel": _s(r.get("nivel"), "Sin clasificar"),
                "valor": _f(r.get("valor")),
                "contratos": _i(r.get("contratos")),
            }
            for r in rows_nivel
        ],
        "por_sector": [
            {
                "sector": _s(r.get("sector"), "Sin clasificar"),
                "valor": _f(r.get("valor")),
                "contratos": _i(r.get("contratos")),
            }
            for r in rows_sector
        ],
    }


def _es_directa(modalidad: str) -> bool:
    """True si la modalidad corresponde a contratación directa."""
    return "DIRECTA" in (modalidad or "").upper()


def shape_como(
    rows_mod: list[dict[str, Any]],
    rows_mod_anio: list[dict[str, Any]],
) -> dict[str, Any]:
    """ComoData: por_modalidad + modalidad_por_anio + pct_directa/competitiva.

    pct_directa se deriva sumando el ``pct`` de las modalidades 'directa';
    pct_competitiva es el complemento a 100.
    """
    por_modalidad = [
        {
            "modalidad": _s(r.get("modalidad"), "Sin modalidad"),
            "contratos": _i(r.get("contratos")),
            "valor": _f(r.get("valor")),
            "pct": _f(r.get("pct")),
        }
        for r in rows_mod
    ]
    # pct_directa: cuota POR NÚMERO de contratos. pct_directa_valor: cuota POR
    # VALOR. Son MUY distintas (la directa pesa mucho en número pero poco en
    # valor: son contratos de baja cuantía), así que el frontend debe mostrar
    # ambas y nunca decir «de cada peso… %» usando la cuota por conteo.
    pct_directa = round(
        sum(m["pct"] for m in por_modalidad if _es_directa(m["modalidad"])), 1
    )
    pct_competitiva = round(100.0 - pct_directa, 1)
    total_valor = sum(m["valor"] for m in por_modalidad)
    valor_directa = sum(m["valor"] for m in por_modalidad if _es_directa(m["modalidad"]))
    pct_directa_valor = round(valor_directa * 100.0 / total_valor, 1) if total_valor else 0.0
    return {
        "por_modalidad": por_modalidad,
        "modalidad_por_anio": [
            {
                "anio": _i(r.get("anio")),
                "modalidad": _s(r.get("modalidad"), "Sin modalidad"),
                "valor": _f(r.get("valor")),
            }
            for r in rows_mod_anio
        ],
        "pct_directa": pct_directa,
        "pct_competitiva": pct_competitiva,
        "pct_directa_valor": pct_directa_valor,
    }


def shape_donde(rows_depto: list[dict[str, Any]]) -> dict[str, Any]:
    """DondeData: por_departamento (dane, departamento, valor, contratos)."""
    return {
        "por_departamento": [
            {
                "dane": _s(r.get("dane")),
                "departamento": _s(r.get("departamento")),
                "valor": _f(r.get("valor")),
                "contratos": _i(r.get("contratos")),
            }
            for r in rows_depto
        ],
    }


def shape_senales(
    rows_concentracion: list[dict[str, Any]],
    rows_percentiles: list[dict[str, Any]],
) -> dict[str, Any]:
    """SenalesData: concentracion + percentiles_valor + pct_directa_nacional.

    La fila de concentración trae los tres escalares (top10_pct_valor,
    n_contratistas, pct_directa_nacional) en una sola fila.
    """
    c = rows_concentracion[0] if rows_concentracion else {}
    return {
        "concentracion": {
            "top10_pct_valor": _f(c.get("top10_pct_valor")),
            "n_contratistas": _i(c.get("n_contratistas")),
        },
        "percentiles_valor": [
            {"p": _i(r.get("p")), "valor": _f(r.get("valor"))}
            for r in rows_percentiles
        ],
        "pct_directa_nacional": _f(c.get("pct_directa_nacional")),
        "notas_metodologicas": list(NOTAS_METODOLOGICAS),
    }


def shape_meta(corte_datos: str | None) -> dict[str, Any]:
    """MetaData: ventana + generado + corte_datos + fuentes + notas."""
    return {
        "ventana": {"desde": YEAR_FROM, "hasta": YEAR_TO},
        "generado": datetime.date.today().isoformat(),
        "corte_datos": _s(corte_datos),
        "fuentes": list(FUENTES),
        "fuentes_detalle": list(FUENTES_DETALLE),
        "notas": list(NOTAS),
    }


def shape_procesos(rows_kpi, rows_mod):
    """ProcesosData: total + % adjudicado/cancelado + por modalidad.

    Solo se publican señales representativas: la competencia (nº de oferentes)
    está vacía en la fuente (~0 %) y la serie por año es un snapshot, así que se
    omiten. 'adjudicado'=estado Seleccionado; 'cancelado'=estado Cancelado.
    """
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {
            "total": _i(k.get("total")),
            "pct_adjudicado": _f(k.get("pct_adjudicado")),
            "pct_cancelado": _f(k.get("pct_desierto")),
        },
        "por_modalidad": [
            {
                "modalidad": _s(r.get("modalidad"), "Otras"),
                "procesos": _i(r.get("procesos")),
                "pct_adjudicado": _f(r.get("pct_adjudicado")),
            }
            for r in rows_mod
        ],
    }


def shape_planeacion(rows_kpi, rows_anio, rows_cat, rows_mod):
    """PlaneacionData (PAA): qué planea comprar el Estado. Solo 2024-2026."""
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {
            "items": _i(k.get("items")),
            "valor_planeado": _f(k.get("valor_planeado")),
            "entidades": _i(k.get("entidades")),
        },
        "por_anio": [{"anio": _i(r.get("anio")), "valor": _f(r.get("valor"))} for r in rows_anio],
        "top_categorias": [
            {"categoria": _s(r.get("categoria"), "Sin clasificar"), "valor": _f(r.get("valor")), "items": _i(r.get("items"))}
            for r in rows_cat
        ],
        "por_modalidad": [
            {"modalidad": _s(r.get("modalidad"), "Otras"), "valor": _f(r.get("valor")), "items": _i(r.get("items"))}
            for r in rows_mod
        ],
    }


def shape_inversion(rows_kpi, rows_sector, rows_vigencia, rows_fuente):
    """InversionData (BPIN): presupuesto de inversión vigente y ejecutado."""
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {
            "proyectos": _i(k.get("proyectos")),
            "valor_vigente": _f(k.get("valor_vigente")),
            "valor_pagado": _f(k.get("valor_pagado")),
            "pct_ejecucion": _f(k.get("pct_ejecucion")),
        },
        "por_sector": [{"sector": _s(r.get("sector")), "vigente": _f(r.get("vigente")), "pagado": _f(r.get("pagado"))} for r in rows_sector],
        "por_vigencia": [{"anio": _i(r.get("anio")), "vigente": _f(r.get("vigente")), "pagado": _f(r.get("pagado"))} for r in rows_vigencia],
        "por_fuente": [{"fuente": _s(r.get("fuente")), "valor": _f(r.get("valor"))} for r in rows_fuente],
    }


def shape_ejecucion(rows_kpi, rows_anio):
    """EjecucionData: contratado vs facturado vs pagado (columnas de contratos)."""
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {
            "contratado": _f(k.get("contratado")),
            "facturado": _f(k.get("facturado")),
            "pagado": _f(k.get("pagado")),
            "pct_facturado": _f(k.get("pct_facturado")),
            "pct_pagado": _f(k.get("pct_pagado")),
            "cobertura_factura": _f(k.get("cobertura_factura")),
            "cobertura_pago": _f(k.get("cobertura_pago")),
        },
        "por_anio": [
            {"anio": _i(r.get("anio")), "contratado": _f(r.get("contratado")),
             "facturado": _f(r.get("facturado")), "pagado": _f(r.get("pagado"))}
            for r in rows_anio
        ],
    }


def shape_cruces(rows_donante, rows_sancionado):
    """CrucesData: solapamientos FACTUALES y neutrales entre registros públicos.

    NO implica irregularidad; describe coincidencias de NIT (ventana 2022-2026).
    """
    d = rows_donante[0] if rows_donante else {}
    s = rows_sancionado[0] if rows_sancionado else {}
    return {
        "donante": {
            "nits": _i(d.get("nits")),
            "contratos": _i(d.get("contratos")),
            "valor": _f(d.get("valor")),
            "total_contratistas": _i(d.get("total_contratistas")),
        },
        "sancionado": {
            "nits": _i(s.get("nits")),
            "contratos": _i(s.get("contratos")),
            "valor": _f(s.get("valor")),
        },
    }


def shape_sanciones(rows_kpi, rows_tipo, rows_anio, rows_gravedad):
    """SancionesData: registro factual del SIRI (agregado, sin nombres)."""
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {
            "total": _i(k.get("total")),
            "inhabilidad_vigente": _i(k.get("inhabilidad_vigente")),
            "inhabilidad_promedio_meses": _f(k.get("inhabilidad_promedio_meses")),
            "inhabilidad_mediana_meses": _i(k.get("inhabilidad_mediana_meses")),
        },
        "por_tipo": [{"tipo": _s(r.get("tipo"), "Sin clasificar"), "n": _i(r.get("n"))} for r in rows_tipo],
        "por_anio": [{"anio": _i(r.get("anio")), "n": _i(r.get("n"))} for r in rows_anio],
        "por_gravedad": [{"gravedad": _s(r.get("gravedad"), "Sin clasificar"), "n": _i(r.get("n"))} for r in rows_gravedad],
    }


def shape_electoral(rows_kpi, rows_anio, rows_partido, rows_depto):
    """ElectoralData: aportes a campañas (CNE), agregado (sin cruces)."""
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {
            "aportes": _i(k.get("aportes")),
            "monto_total": _f(k.get("monto_total")),
            "candidatos": _i(k.get("candidatos")),
        },
        "por_anio": [{"anio": _i(r.get("anio")), "monto": _f(r.get("monto"))} for r in rows_anio],
        "top_partidos": [{"partido": _s(r.get("partido"), "Sin partido"), "monto": _f(r.get("monto")), "aportes": _i(r.get("aportes"))} for r in rows_partido],
        "por_departamento": [{"departamento": _s(r.get("departamento")), "monto": _f(r.get("monto"))} for r in rows_depto],
    }


# ─── Ejecución contra BigQuery (separada de las shape_*) ────────────────────


def _client():  # pragma: no cover - requiere credenciales
    from google.cloud import bigquery

    return bigquery.Client(project=PROJECT)


def _sql(name: str) -> str:
    """Lee un .sql de queries/ y lo APUNTA a la tabla base limpia (deduplicada y
    pre-filtrada), no a `contratos` cruda; luego sustituye placeholders {p}.{d}."""
    raw = QUERIES_DIR.joinpath(name).read_text(encoding="utf-8")
    raw = raw.replace("`{p}.{d}.contratos`", f"`{BASE_TABLE}`")
    return raw.replace("{p}", PROJECT).replace("{d}", DATASET)


def _ensure_base(client) -> None:  # pragma: no cover - requiere BQ
    """Crea la tabla base LIMPIA: ventana 2022-2026, valor>0 y deduplicada por id.

    La fuente SECOP trae ~0.3% de ids repetidos (mismo contrato ingerido/
    versionado más de una vez). Se conserva la última versión por id según
    ``ultima_actualizacion`` para no contar ni sumar dos veces el mismo contrato.
    """
    client.query(
        f"""CREATE OR REPLACE TABLE `{BASE_TABLE}` AS
        SELECT {_BASE_COLS},
               {_MODALIDAD_NORM} AS modalidad_norm,
               {_OBJETO_LABEL} AS objeto_label
        FROM `{PROJECT}.{DATASET}.contratos`
        WHERE {WHERE}
        QUALIFY ROW_NUMBER() OVER (
            PARTITION BY id ORDER BY ultima_actualizacion DESC
        ) = 1"""
    ).result()


def _drop_base(client) -> None:  # pragma: no cover - requiere BQ
    """Elimina la tabla base temporal tras generar el snapshot."""
    client.query(f"DROP TABLE IF EXISTS `{BASE_TABLE}`").result()


def _q(client, name: str) -> list[dict[str, Any]]:  # pragma: no cover - BQ
    """Ejecuta el .sql `name` y devuelve filas como lista de dicts."""
    return [dict(r) for r in client.query(_sql(name)).result()]


def _write(nombre: str, data: dict[str, Any]) -> None:  # pragma: no cover - IO
    (OUT / f"{nombre}.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def shape_genero(rows_kpi, rows_anio):
    """GeneroData: género del REPRESENTANTE LEGAL (no de la propiedad), ~98% cobertura."""
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {
            "pct_contratos_mujer": _f(k.get("pct_contratos_mujer")),
            "pct_valor_mujer": _f(k.get("pct_valor_mujer")),
            "mediana_valor_mujer": _f(k.get("mediana_valor_mujer")),
            "mediana_valor_hombre": _f(k.get("mediana_valor_hombre")),
        },
        "serie": [
            {"anio": _i(r.get("anio")), "pct_contratos_mujer": _f(r.get("pct_contratos_mujer")), "pct_valor_mujer": _f(r.get("pct_valor_mujer"))}
            for r in rows_anio
        ],
    }


def shape_pyme(rows_kpi, rows_serie):
    """PymeData: participación PYME (autodeclarada) + por modalidad."""
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {
            "pct_contratos_pyme": _f(k.get("pct_contratos_pyme")),
            "pct_valor_pyme": _f(k.get("pct_valor_pyme")),
            "valor_total_pyme": _f(k.get("valor_total_pyme")),
        },
        "serie": [
            {"modalidad": _s(r.get("modalidad"), "Otras"), "contratos": _i(r.get("contratos")), "pct_contratos_pyme": _f(r.get("pct_contratos_pyme"))}
            for r in rows_serie
        ],
    }


def shape_duracion(rows_kpi, rows_serie):
    """DuracionData: plazo CONTRATADO (fecha_inicio→fecha_fin), no ejecución real."""
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {"mediana_dias": _i(k.get("mediana_dias")), "p25": _i(k.get("p25")), "p75": _i(k.get("p75")), "p90": _i(k.get("p90"))},
        "serie": [
            {"modalidad": _s(r.get("modalidad"), "Otras"), "mediana_dias": _i(r.get("mediana_dias"))}
            for r in rows_serie
        ],
    }


_MESES_ORDEN = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]


def shape_estacionalidad(rows_kpi, rows_serie):
    """EstacionalidadData: kpis + serie por mes (Ene..Dic), años completos 2022-2025."""
    k = rows_kpi[0] if rows_kpi else {}
    by_mes = {_s(r.get("mes")): r for r in rows_serie}
    return {
        "kpis": {
            "pct_contratos_enero": _f(k.get("pct_contratos_enero")),
            "pct_valor_diciembre": _f(k.get("pct_valor_diciembre")),
            "ratio_enero_promedio": _f(k.get("ratio_enero_promedio")),
            "pct_contratos_q1": _f(k.get("pct_contratos_q1")),
        },
        "serie": [
            {"mes": m, "contratos": _i(by_mes.get(m, {}).get("contratos")), "valor": _f(by_mes.get(m, {}).get("valor"))}
            for m in _MESES_ORDEN
        ],
    }


def shape_financiacion(rows_kpi, rows_fuente):
    """FinanciacionData: valor contratado por fuente del gasto (~63% del total con fuente)."""
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {
            "pgn": _f(k.get("pgn")), "propios": _f(k.get("propios")), "sgp": _f(k.get("sgp")), "regalias": _f(k.get("regalias")),
            "valor_con_fuente": _f(k.get("valor_con_fuente")), "valor_total": _f(k.get("valor_total")), "pct_con_fuente": _f(k.get("pct_con_fuente")),
        },
        "serie": [{"fuente": _s(r.get("fuente")), "valor": _f(r.get("valor"))} for r in rows_fuente],
    }


def shape_crecimiento(rows_kpi, rows_serie):
    """CrecimientoData: variación nominal del valor por sector 2023→2025 (sin alzas de 1 solo contrato)."""
    k = rows_kpi[0] if rows_kpi else {}
    return {
        "kpis": {
            "valor_2025": _f(k.get("valor_2025")), "valor_2023": _f(k.get("valor_2023")),
            "sector_mayor_alza": _s(k.get("sector_mayor_alza"), "—"), "var_mayor_alza": _f(k.get("var_mayor_alza")),
            "n_sectores_cayeron": _i(k.get("n_sectores_cayeron")), "n_sectores": _i(k.get("n_sectores")),
        },
        "serie": [{"sector": _s(r.get("sector"), "Sin clasificar"), "var_pct": _f(r.get("var_pct"))} for r in rows_serie],
    }


def _build_analisis(client):  # pragma: no cover - requiere BQ
    """Secciones analíticas (datos valiosos): género, PYME, duración, estacionalidad,
    financiación, crecimiento. Agregados nacionales, ventana 2022-2026."""
    return {"items": {
        "genero": shape_genero(_q(client, "genero_kpis.sql"), _q(client, "genero_anio.sql")),
        "pyme": shape_pyme(_q(client, "pyme_kpis.sql"), _q(client, "pyme_modalidad.sql")),
        "duracion": shape_duracion(_q(client, "duracion_kpis.sql"), _q(client, "duracion_modalidad.sql")),
        "estacionalidad": shape_estacionalidad(_q(client, "estacionalidad_kpis.sql"), _q(client, "estacionalidad_mes.sql")),
        "financiacion": shape_financiacion(_q(client, "financiacion_kpis.sql"), _q(client, "financiacion_fuente.sql")),
        "crecimiento": shape_crecimiento(_q(client, "crecimiento_kpis.sql"), _q(client, "crecimiento_sector.sql")),
    }}


def _build_senales_extra(client):  # pragma: no cover - requiere BQ
    """Señales/cruces adicionales — agregados NACIONALES neutrales (sin perfiles),
    ventana 2022-2026. NINGÚN dato es acusatorio: son coincidencias factuales que
    merecen verificación caso por caso. Usan contratos crudos (requieren columnas
    fuera de la base); el ~0.3% de duplicados es marginal para estos agregados.
    """
    P, D = PROJECT, DATASET
    C = f"`{P}.{D}.contratos`"
    W = "c.fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND c.valor > 0"
    Q = {
        "adiciones": f"SELECT COUNTIF(fecha_prorroga IS NOT NULL) AS contratos, SUM(IF(fecha_prorroga IS NOT NULL, valor, 0)) AS valor FROM {C} c WHERE {W}",
        "prorroga_sin_ejecucion": f"SELECT COUNT(*) AS contratos, SUM(valor) AS valor FROM {C} c WHERE {W} AND fecha_prorroga IS NOT NULL AND SAFE_DIVIDE(valor_pagado, valor) < 0.30 AND DATE_DIFF(CURRENT_DATE(), fecha_firma, MONTH) >= 12",
        # vigencia 2025-2026 (literal, consistente con la nota): la tabla BPIN solo
        # trae vigencias >= 2025; 2027+ tienen valor_vigente ~0. El filtro acota a
        # los presupuestos vigentes reales. valor_vigente >= $1.000M y ejecución < 30%.
        "brechas_bpin": f"SELECT COUNT(*) AS proyectos, SUM(valor_vigente - valor_pagado) AS valor FROM `{P}.{D}.bpin_ejecucion` WHERE SAFE_CAST(vigencia AS INT64) BETWEEN 2025 AND 2026 AND valor_vigente >= 1e9 AND SAFE_DIVIDE(valor_pagado, valor_vigente) < 0.30",
        # PAA deduplicado (id + última versión por encabezado), MISMA lógica que
        # planeacion_kpis.sql: sin esto el «planeado» se infla ~30% por versiones
        # superadas y el umbral 1,2× quedaría incoherente con la sección Planeación.
        "contratos_no_planeados": f"WITH paa_dd AS (SELECT * EXCEPT(rn) FROM (SELECT entidad_nit, anio, valor_total_esperado, paa_encabezado_id, version_paa, ROW_NUMBER() OVER (PARTITION BY id ORDER BY fecha_ingesta DESC) rn FROM `{P}.{D}.paa` WHERE anio BETWEEN 2022 AND 2026) WHERE rn = 1), maxv AS (SELECT paa_encabezado_id, MAX(version_paa) mv FROM paa_dd GROUP BY 1), paa_latest AS (SELECT d.* FROM paa_dd d JOIN maxv m ON d.paa_encabezado_id = m.paa_encabezado_id AND d.version_paa = m.mv), paa AS (SELECT entidad_nit, anio, SUM(valor_total_esperado) vp FROM paa_latest WHERE entidad_nit IS NOT NULL AND valor_total_esperado > 0 GROUP BY 1,2), ct AS (SELECT entidad_nit, EXTRACT(YEAR FROM fecha_firma) anio, SUM(valor) vc FROM {C} c WHERE {W} GROUP BY 1,2) SELECT COUNT(*) AS casos, SUM(vc) AS valor FROM ct JOIN paa USING(entidad_nit, anio) WHERE vc > 1.2 * vp",
        "monopolio_municipal": f"SELECT COUNT(*) AS municipios, SUM(valor_c) AS valor FROM (SELECT entidad_municipio, contratista_nit, SUM(valor) valor_c, SUM(valor)/SUM(SUM(valor)) OVER (PARTITION BY entidad_municipio) sh, COUNT(*) OVER (PARTITION BY entidad_municipio) nm FROM {C} c WHERE {W} AND entidad_municipio IS NOT NULL GROUP BY 1,2) WHERE sh >= 0.5 AND nm BETWEEN 30 AND 5000",
        "supervisor_contratista": f"WITH s AS (SELECT doc_supervisor d, entidad_nit e FROM {C} c WHERE {W} AND doc_supervisor IS NOT NULL GROUP BY 1,2 HAVING COUNT(*) >= 2), k AS (SELECT contratista_nit d, entidad_nit e, SUM(valor) v FROM {C} c WHERE {W} AND contratista_nit IS NOT NULL GROUP BY 1,2 HAVING COUNT(*) >= 2) SELECT COUNT(DISTINCT s.d) AS personas, SUM(k.v) AS valor FROM s JOIN k ON k.d = s.d AND k.e = s.e",
        "puerta_giratoria": f"WITH sv AS (SELECT CAST(numero_documento AS STRING) doc, entidad_normalizada ent FROM `{P}.{D}.sigep_servidores` WHERE numero_documento IS NOT NULL GROUP BY 1,2) SELECT COUNT(DISTINCT sv.doc) AS personas, SUM(c.valor) AS valor FROM sv JOIN {C} c ON CAST(sv.doc AS STRING) = c.contratista_nit AND sv.ent = c.entidad_nombre_normalizado WHERE {W}",
        # IMPORTANTE (anti fan-out): estas 3 señales cruzan contratos con una
        # tabla donde un NIT puede aparecer en VARIAS filas (varias campañas,
        # varias relaciones, sanciones en varios deptos). Un JOIN directo
        # multiplicaría el valor del MISMO contrato una vez por cada coincidencia
        # (p. ej. donante_post_eleccion llegaba a $820 B > universo $584 B). Se
        # deduplica el lado cruzado (DISTINCT / EXISTS) para sumar cada contrato
        # UNA sola vez. Los conteos COUNT(DISTINCT contratista) ya eran correctos.
        "redes_relaciones": f"WITH nits AS (SELECT CAST(nit_a AS STRING) nit FROM `{P}.{D}.relaciones` WHERE tipo_relacion = 'REPRESENTANTE_COMPARTIDO' UNION DISTINCT SELECT CAST(nit_b AS STRING) FROM `{P}.{D}.relaciones` WHERE tipo_relacion = 'REPRESENTANTE_COMPARTIDO') SELECT COUNT(DISTINCT c.contratista_nit) AS empresas, SUM(c.valor) AS valor FROM nits JOIN {C} c ON c.contratista_nit = nits.nit WHERE {W}",
        "sancionado_otro_depto": f"WITH sa AS (SELECT sancionado_nit nit, UPPER(TRIM(departamento)) dp, MIN(fecha_inicio) f FROM `{P}.{D}.sanciones` WHERE sancionado_nit IS NOT NULL AND departamento IS NOT NULL GROUP BY 1,2) SELECT COUNT(DISTINCT c.contratista_nit) AS contratistas, SUM(c.valor) AS valor FROM {C} c WHERE {W} AND EXISTS (SELECT 1 FROM sa WHERE sa.nit = c.contratista_nit AND sa.dp != UPPER(TRIM(c.entidad_departamento)) AND c.fecha_firma > sa.f)",
        "donante_post_eleccion": f"WITH d AS (SELECT CAST(nit_aportante AS STRING) nit, MIN(SAFE_CAST(anio_eleccion AS INT64)) ae FROM `{P}.{D}.campanas` WHERE SAFE_CAST(anio_eleccion AS INT64) >= 2022 AND nit_aportante IS NOT NULL GROUP BY 1) SELECT COUNT(DISTINCT c.contratista_nit) AS contratistas, SUM(c.valor) AS valor FROM d JOIN {C} c ON c.contratista_nit = d.nit WHERE {W} AND c.fecha_firma > DATE(d.ae + 1, 1, 1)",
        "cluster_electoral": f"WITH cl AS (SELECT candidato, COUNT(DISTINCT CAST(ca.nit_aportante AS STRING)) na, COUNT(DISTINCT IF(co.id IS NOT NULL, CAST(ca.nit_aportante AS STRING), NULL)) nc FROM `{P}.{D}.campanas` ca LEFT JOIN {C} co ON CAST(ca.nit_aportante AS STRING) = co.contratista_nit AND co.fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' GROUP BY candidato) SELECT COUNT(*) AS clusters, SUM(nc) AS aportantes_que_contratan FROM cl WHERE na >= 3 AND nc >= 2",
    }

    def coerce(v):
        if v is None:
            return 0
        if isinstance(v, (bool, int)):
            return v
        return float(v)

    items = {}
    for key, sql in Q.items():
        rows = [dict(r) for r in client.query(sql).result()]
        items[key] = {k: coerce(v) for k, v in (rows[0].items() if rows else {})}
    return {"items": items}


def run() -> None:  # pragma: no cover - requiere credenciales + BQ
    """Ejecuta todas las queries y escribe los seis JSON del snapshot."""
    OUT.mkdir(parents=True, exist_ok=True)
    client = _client()
    print("Creando tabla base limpia (deduplicada por id)…")
    _ensure_base(client)
    try:
        _run_aggregates(client)
    finally:
        _drop_base(client)
    print("Snapshot generado en", OUT)


def _run_aggregates(client) -> None:  # pragma: no cover - requiere BQ
    """Ejecuta los agregados sobre la tabla base limpia y escribe los JSON."""
    panorama = shape_panorama(
        _q(client, "panorama_kpis.sql"),
        _q(client, "panorama_anio.sql"),
        _q(client, "panorama_sectores.sql"),
    )
    _write("panorama", panorama)

    quien = shape_quien(
        _q(client, "quien_entidades.sql"),
        _q(client, "quien_nivel.sql"),
        _q(client, "quien_sector.sql"),
    )
    _write("quien", quien)

    como = shape_como(
        _q(client, "como_modalidad.sql"),
        _q(client, "como_modalidad_anio.sql"),
    )
    _write("como", como)

    donde = shape_donde(_q(client, "donde_departamento.sql"))
    _write("donde", donde)

    senales = shape_senales(
        _q(client, "senales_concentracion.sql"),
        _q(client, "senales_percentiles.sql"),
    )
    _write("senales", senales)

    # ── Fuentes adicionales (cada una su tabla; el redirect a _contratos_pub
    #    solo aplica a referencias a `contratos`) ────────────────────────────
    _write("procesos", shape_procesos(
        _q(client, "procesos_kpis.sql"),
        _q(client, "procesos_modalidad.sql"),
    ))
    _write("planeacion", shape_planeacion(
        _q(client, "planeacion_kpis.sql"),
        _q(client, "planeacion_anio.sql"),
        _q(client, "planeacion_categorias.sql"),
        _q(client, "planeacion_modalidad.sql"),
    ))
    _write("inversion", shape_inversion(
        _q(client, "inversion_kpis.sql"),
        _q(client, "inversion_sector.sql"),
        _q(client, "inversion_vigencia.sql"),
        _q(client, "inversion_fuente.sql"),
    ))
    _write("ejecucion", shape_ejecucion(
        _q(client, "ejecucion_kpis.sql"),
        _q(client, "ejecucion_anio.sql"),
    ))
    _write("sanciones", shape_sanciones(
        _q(client, "sanciones_kpis.sql"),
        _q(client, "sanciones_tipo.sql"),
        _q(client, "sanciones_anio.sql"),
        _q(client, "sanciones_gravedad.sql"),
    ))
    _write("electoral", shape_electoral(
        _q(client, "electoral_kpis.sql"),
        _q(client, "electoral_anio.sql"),
        _q(client, "electoral_partido.sql"),
        _q(client, "electoral_depto.sql"),
    ))
    _write("cruces", shape_cruces(
        _q(client, "cruces_donante.sql"),
        _q(client, "cruces_sancionado.sql"),
    ))
    _write("senales_extra", _build_senales_extra(client))
    _write("analisis", _build_analisis(client))

    corte_rows = [
        dict(r)
        for r in client.query(
            f"SELECT CAST(MAX(fecha_firma) AS STRING) AS d FROM `{BASE_TABLE}`"
        ).result()
    ]
    corte = corte_rows[0]["d"] if corte_rows else None
    _write("meta", shape_meta(corte))


if __name__ == "__main__":  # pragma: no cover
    run()
