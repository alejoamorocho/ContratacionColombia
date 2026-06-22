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
    "entidad_departamento"
)

FUENTES = [
    "SECOP II — Contratos y Procesos (Colombia Compra Eficiente)",
    "PAA — Plan Anual de Adquisiciones (SECOP II)",
    "BPIN — Inversión pública (DNP)",
    "Sanciones — SIRI (Procuraduría)",
    "Aportes a campañas — Cuentas Claras (CNE)",
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
    pct_directa = round(
        sum(m["pct"] for m in por_modalidad if _es_directa(m["modalidad"])), 1
    )
    pct_competitiva = round(100.0 - pct_directa, 1)
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
        SELECT {_BASE_COLS}
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
