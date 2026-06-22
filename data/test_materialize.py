"""Tests de FORMA de las funciones puras shape_* de materialize_public.

Cada test alimenta filas dict de ejemplo (como las que devolvería BigQuery) y
verifica que la salida cumple EXACTAMENTE las claves de ``src/lib/types.ts``.
Las shape_* son puras: NO tocan BigQuery, así que estos tests corren sin
credenciales.
"""
from decimal import Decimal

from materialize_public import (
    shape_panorama,
    shape_quien,
    shape_como,
    shape_donde,
    shape_senales,
    shape_meta,
)


# ─── Claves esperadas según types.ts ────────────────────────────────────────

PANORAMA_KEYS = {"kpis", "por_anio", "top_sectores"}
PANORAMA_KPI_KEYS = {"contratos", "valor_total", "entidades", "contratistas"}
PANORAMA_ANIO_KEYS = {"anio", "contratos", "valor"}
PANORAMA_SECTOR_KEYS = {"sector", "contratos", "valor"}

QUIEN_KEYS = {"top_entidades", "por_nivel", "por_sector"}
QUIEN_ENT_KEYS = {"nombre", "nit", "valor", "contratos"}
QUIEN_NIVEL_KEYS = {"nivel", "valor", "contratos"}
QUIEN_SECTOR_KEYS = {"sector", "valor", "contratos"}

COMO_KEYS = {"por_modalidad", "modalidad_por_anio", "pct_directa", "pct_competitiva"}
COMO_MOD_KEYS = {"modalidad", "contratos", "valor", "pct"}
COMO_MOD_ANIO_KEYS = {"anio", "modalidad", "valor"}

DONDE_KEYS = {"por_departamento"}
DONDE_DEPTO_KEYS = {"dane", "departamento", "valor", "contratos"}

SENALES_KEYS = {
    "concentracion",
    "percentiles_valor",
    "pct_directa_nacional",
    "notas_metodologicas",
}
SENALES_CONC_KEYS = {"top10_pct_valor", "n_contratistas"}
SENALES_PCTL_KEYS = {"p", "valor"}

META_KEYS = {"ventana", "generado", "corte_datos", "fuentes", "notas"}


# ─── shape_panorama ─────────────────────────────────────────────────────────


def test_shape_panorama_estructura():
    rows_kpi = [
        {"contratos": 10, "valor_total": Decimal("100.5"), "entidades": 3, "contratistas": 5}
    ]
    rows_anio = [{"anio": 2022, "contratos": 4, "valor": Decimal("40")}]
    rows_sect = [{"sector": "Salud", "contratos": 6, "valor": Decimal("60")}]

    out = shape_panorama(rows_kpi, rows_anio, rows_sect)

    assert set(out) == PANORAMA_KEYS
    assert set(out["kpis"]) == PANORAMA_KPI_KEYS
    assert out["kpis"]["contratos"] == 10
    assert out["kpis"]["valor_total"] == 100.5
    assert isinstance(out["kpis"]["valor_total"], float)
    assert set(out["por_anio"][0]) == PANORAMA_ANIO_KEYS
    assert out["por_anio"][0]["anio"] == 2022
    assert set(out["top_sectores"][0]) == PANORAMA_SECTOR_KEYS
    assert out["top_sectores"][0]["sector"] == "Salud"


def test_shape_panorama_sector_none_default():
    out = shape_panorama(
        [{"contratos": 1, "valor_total": 1, "entidades": 1, "contratistas": 1}],
        [],
        [{"sector": None, "contratos": 2, "valor": 3}],
    )
    assert out["top_sectores"][0]["sector"] == "Sin clasificar"
    assert out["por_anio"] == []


# ─── shape_quien ────────────────────────────────────────────────────────────


def test_shape_quien_estructura():
    rows_ent = [
        {"nombre": "INVÍAS", "nit": "800215807", "valor": Decimal("28e12"), "contratos": 12400}
    ]
    rows_nivel = [{"nivel": "Nacional", "valor": Decimal("290e12"), "contratos": 2100000}]
    rows_sector = [{"sector": "Salud", "valor": Decimal("62e12"), "contratos": 410000}]

    out = shape_quien(rows_ent, rows_nivel, rows_sector)

    assert set(out) == QUIEN_KEYS
    assert set(out["top_entidades"][0]) == QUIEN_ENT_KEYS
    assert out["top_entidades"][0]["nit"] == "800215807"
    assert isinstance(out["top_entidades"][0]["nit"], str)
    assert set(out["por_nivel"][0]) == QUIEN_NIVEL_KEYS
    assert out["por_nivel"][0]["nivel"] == "Nacional"
    assert set(out["por_sector"][0]) == QUIEN_SECTOR_KEYS


def test_shape_quien_nivel_none_default():
    out = shape_quien([], [{"nivel": None, "valor": 1, "contratos": 1}], [])
    assert out["por_nivel"][0]["nivel"] == "Sin clasificar"


# ─── shape_como ─────────────────────────────────────────────────────────────


def test_shape_como_estructura_y_pct_derivado():
    rows_mod = [
        {"modalidad": "Contratación directa", "contratos": 60, "valor": Decimal("190e12"), "pct": 59.6},
        {"modalidad": "Licitación pública", "contratos": 9, "valor": Decimal("160e12"), "pct": 9.2},
        {"modalidad": "Selección abreviada", "contratos": 31, "valor": Decimal("78e12"), "pct": 31.2},
    ]
    rows_mod_anio = [
        {"anio": 2022, "modalidad": "Contratación directa", "valor": Decimal("48e12")}
    ]

    out = shape_como(rows_mod, rows_mod_anio)

    assert set(out) == COMO_KEYS
    assert set(out["por_modalidad"][0]) == COMO_MOD_KEYS
    assert set(out["modalidad_por_anio"][0]) == COMO_MOD_ANIO_KEYS
    # pct_directa = suma de pct de modalidades 'directa'
    assert out["pct_directa"] == 59.6
    assert out["pct_competitiva"] == round(100.0 - 59.6, 1)
    assert isinstance(out["pct_directa"], float)


def test_shape_como_sin_directa():
    rows_mod = [
        {"modalidad": "Licitación pública", "contratos": 50, "valor": 1, "pct": 50.0},
        {"modalidad": "Mínima cuantía", "contratos": 50, "valor": 1, "pct": 50.0},
    ]
    out = shape_como(rows_mod, [])
    assert out["pct_directa"] == 0.0
    assert out["pct_competitiva"] == 100.0
    assert out["modalidad_por_anio"] == []


# ─── shape_donde ────────────────────────────────────────────────────────────


def test_shape_donde_estructura():
    rows = [
        {"dane": "11", "departamento": "Bogotá D.C.", "valor": Decimal("142e12"), "contratos": 980000},
        {"dane": "05", "departamento": "Antioquia", "valor": Decimal("61e12"), "contratos": 540000},
        {"dane": "76", "departamento": "Valle del Cauca", "valor": Decimal("38e12"), "contratos": 410000},
    ]

    out = shape_donde(rows)

    assert set(out) == DONDE_KEYS
    assert len(out["por_departamento"]) == 3
    for item in out["por_departamento"]:
        assert set(item) == DONDE_DEPTO_KEYS
        assert isinstance(item["dane"], str)
    assert out["por_departamento"][0]["dane"] == "11"
    assert out["por_departamento"][0]["departamento"] == "Bogotá D.C."


# ─── shape_senales ──────────────────────────────────────────────────────────


def test_shape_senales_estructura():
    rows_conc = [
        {"top10_pct_valor": Decimal("18.4"), "n_contratistas": 410000, "pct_directa_nacional": Decimal("59.6")}
    ]
    rows_pctl = [
        {"p": 10, "valor": Decimal("1200000")},
        {"p": 50, "valor": Decimal("18000000")},
        {"p": 99, "valor": Decimal("2400000000")},
    ]

    out = shape_senales(rows_conc, rows_pctl)

    assert set(out) == SENALES_KEYS
    assert set(out["concentracion"]) == SENALES_CONC_KEYS
    assert out["concentracion"]["top10_pct_valor"] == 18.4
    assert out["concentracion"]["n_contratistas"] == 410000
    assert out["pct_directa_nacional"] == 59.6
    for item in out["percentiles_valor"]:
        assert set(item) == SENALES_PCTL_KEYS
    assert out["percentiles_valor"][0]["p"] == 10
    assert isinstance(out["notas_metodologicas"], list)
    assert len(out["notas_metodologicas"]) >= 1
    assert all(isinstance(n, str) for n in out["notas_metodologicas"])


# ─── shape_meta ─────────────────────────────────────────────────────────────


def test_shape_meta_estructura():
    out = shape_meta("2026-06-20")

    assert set(out) == META_KEYS
    assert out["ventana"] == {"desde": 2022, "hasta": 2026}
    assert out["corte_datos"] == "2026-06-20"
    assert isinstance(out["fuentes"], list) and len(out["fuentes"]) >= 1
    assert isinstance(out["notas"], list) and len(out["notas"]) >= 1
    # 'generado' es ISO date YYYY-MM-DD
    assert len(out["generado"]) == 10 and out["generado"][4] == "-"


def test_shape_meta_corte_none():
    out = shape_meta(None)
    assert out["corte_datos"] == ""
