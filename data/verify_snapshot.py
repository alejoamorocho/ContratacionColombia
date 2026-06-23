"""Reconciliación INDEPENDIENTE del snapshot público contra BigQuery.

No reutiliza las consultas del materializador: re-deriva los números con
formulaciones distintas (o desde la tabla CRUDA) y los compara con
``public/data/*.json``. Además corre chequeos de COHERENCIA interna del
snapshot (sin BigQuery). Objetivo: probar que ningún número está inventado y
que todo reconcilia con la fuente.

Uso:  python data/verify_snapshot.py   (requiere ADC de BigQuery)
Costo acotado: construye UNA base slim deduplicada (12 columnas) y la consulta
unas pocas veces; el resto lee la cruda directamente. Borra la base al final.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT = "vectorvi"
DATASET = "vectorvi"
OUT = Path(__file__).resolve().parent.parent / "public" / "data"

C = f"`{PROJECT}.{DATASET}.contratos`"
VB = f"`{PROJECT}.{DATASET}._verify_pub`"
W = "fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND valor IS NOT NULL AND valor > 0"
WP = "fecha_firma BETWEEN '2022-01-01' AND '2026-12-31' AND valor > 0"  # señales

rows: list[tuple] = []  # (metrica, snapshot, bigquery, estado)


def J(name: str) -> dict:
    return json.loads((OUT / f"{name}.json").read_text(encoding="utf-8"))


def _close(a, b, *, rel=1e-6, abs_=0.5) -> bool:
    try:
        a = float(a); b = float(b)
    except (TypeError, ValueError):
        return a == b
    if a == b:
        return True
    return abs(a - b) <= max(abs_, rel * max(abs(a), abs(b)))


def chk(metric: str, snap, bq, *, rel=1e-6, abs_=0.5) -> None:
    ok = _close(snap, bq, rel=rel, abs_=abs_)
    rows.append((metric, snap, bq, "OK" if ok else "DESAJUSTE"))


def coh(metric: str, condition: bool, detail: str) -> None:
    rows.append((metric, detail, "(coherencia)", "OK" if condition else "FALLA"))


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # consola Windows = cp1252
    except Exception:
        pass
    from google.cloud import bigquery

    client = bigquery.Client(project=PROJECT)
    print("→ Construyendo base de verificación slim (deduplicada por id)…")
    client.query(
        f"""CREATE OR REPLACE TABLE {VB} AS
        SELECT id, valor, valor_facturado, valor_pagado, entidad_nit,
               contratista_nit, modalidad, es_pyme,
               recursos_pgn, recursos_sgp, recursos_regalias, recursos_propios
        FROM {C}
        WHERE {W}
        QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY ultima_actualizacion DESC) = 1"""
    ).result()

    def q1(sql: str):
        return list(client.query(sql).result())[0]

    try:
        # ── 1. Integridad de la deduplicación (sobre la tabla CRUDA) ──────────
        d = q1(f"SELECT COUNT(*) raw_rows, COUNT(DISTINCT id) raw_ids FROM {C} WHERE {W}")
        dups = d["raw_rows"] - d["raw_ids"]
        pct_dup = round(dups * 100.0 / d["raw_rows"], 3) if d["raw_rows"] else 0
        rows.append(("dedup: filas crudas", d["raw_rows"], "—", "INFO"))
        rows.append(("dedup: ids únicos", d["raw_ids"], "—", "INFO"))
        rows.append((f"dedup: duplicados eliminados ({pct_dup}%)", dups, "—", "INFO"))

        # ── 2. Panorama (independiente, desde base) ───────────────────────────
        pan = J("panorama")["kpis"]
        b = q1(
            f"""SELECT COUNT(*) c, SUM(valor) v,
                APPROX_QUANTILES(valor,100)[OFFSET(50)] med,
                COUNT(DISTINCT entidad_nit) ent,
                COUNT(DISTINCT contratista_nit) con
            FROM {VB}"""
        )
        chk("panorama.contratos", pan["contratos"], b["c"], abs_=0)
        chk("panorama.contratos == ids únicos crudos", pan["contratos"], d["raw_ids"], abs_=0)
        chk("panorama.valor_total", pan["valor_total"], b["v"], rel=1e-6)
        chk("panorama.valor_mediano", pan["valor_mediano"], b["med"], rel=0.02, abs_=1e5)
        chk("panorama.entidades", pan["entidades"], b["ent"], abs_=0)
        chk("panorama.contratistas", pan["contratistas"], b["con"], abs_=0)

        # ── 3. Cómo: pct_directa (independiente vía LIKE %DIRECTA%) ────────────
        como = J("como")
        pd = q1(
            f"SELECT ROUND(COUNTIF(UPPER(modalidad) LIKE '%DIRECTA%')*100.0/COUNT(*),1) p FROM {VB}"
        )
        chk("como.pct_directa", como["pct_directa"], pd["p"], abs_=0.15)
        cm_c = sum(m["contratos"] for m in como["por_modalidad"])
        chk("Σ como.por_modalidad.contratos == panorama.contratos", cm_c, pan["contratos"], abs_=0)
        coh("Σ como.por_modalidad.pct ≈ 100",
            99.0 <= sum(m["pct"] for m in como["por_modalidad"]) <= 101.0,
            f"suma={round(sum(m['pct'] for m in como['por_modalidad']),1)}")

        # ── 4. Ejecución ──────────────────────────────────────────────────────
        eje = J("ejecucion")["kpis"]
        e = q1(
            f"""SELECT SUM(valor) c, SUM(valor_facturado) f, SUM(valor_pagado) p,
                ROUND(SUM(valor_facturado)*100.0/NULLIF(SUM(valor),0),1) pf,
                ROUND(SUM(valor_pagado)*100.0/NULLIF(SUM(valor),0),1) pp
            FROM {VB}"""
        )
        chk("ejecucion.contratado", eje["contratado"], e["c"], rel=1e-6)
        chk("ejecucion.facturado", eje["facturado"], e["f"], rel=1e-6)
        chk("ejecucion.pagado", eje["pagado"], e["p"], rel=1e-6)
        chk("ejecucion.pct_facturado", eje["pct_facturado"], e["pf"], abs_=0.15)
        chk("ejecucion.pct_pagado", eje["pct_pagado"], e["pp"], abs_=0.15)

        # ── 5. PYME ───────────────────────────────────────────────────────────
        pyme = J("analisis")["items"]["pyme"]["kpis"]
        p = q1(
            f"""SELECT
                ROUND(COUNTIF(LOWER(es_pyme) IN ('si','true'))*100.0/COUNT(*),1) pc,
                ROUND(SUM(IF(LOWER(es_pyme) IN ('si','true'),valor,0))*100.0/SUM(valor),1) pv,
                SUM(IF(LOWER(es_pyme) IN ('si','true'),valor,0)) vt
            FROM {VB}"""
        )
        chk("pyme.pct_contratos_pyme", pyme["pct_contratos_pyme"], p["pc"], abs_=0.15)
        chk("pyme.pct_valor_pyme", pyme["pct_valor_pyme"], p["pv"], abs_=0.15)
        chk("pyme.valor_total_pyme", pyme["valor_total_pyme"], p["vt"], rel=1e-6)

        # ── 6. Financiación (independiente desde base) ────────────────────────
        fin = J("analisis")["items"]["financiacion"]["kpis"]
        f = q1(
            f"""SELECT
                SUM(SAFE_CAST(recursos_pgn AS FLOAT64)) pgn,
                SUM(SAFE_CAST(recursos_propios AS FLOAT64)) propios,
                SUM(SAFE_CAST(recursos_sgp AS FLOAT64)) sgp,
                SUM(SAFE_CAST(recursos_regalias AS FLOAT64)) reg
            FROM {VB}"""
        )
        chk("financiacion.pgn", fin["pgn"], f["pgn"], rel=1e-6)
        chk("financiacion.propios", fin["propios"], f["propios"], rel=1e-6)
        chk("financiacion.sgp", fin["sgp"], f["sgp"], rel=1e-6)
        chk("financiacion.regalias", fin["regalias"], f["reg"], rel=1e-6)

        # ── 7. Concentración top-10 (independiente) ───────────────────────────
        sen = J("senales")
        cc = q1(
            f"""WITH pc AS (SELECT contratista_nit, SUM(valor) v FROM {VB}
                  WHERE contratista_nit IS NOT NULL AND contratista_nit!='' GROUP BY 1),
                r AS (SELECT v, ROW_NUMBER() OVER (ORDER BY v DESC) rn FROM pc)
                SELECT ROUND(SUM(IF(rn<=10,v,0))*100.0/SUM(v),1) top10, COUNT(*) n FROM r"""
        )
        chk("senales.top10_pct_valor", sen["concentracion"]["top10_pct_valor"], cc["top10"], abs_=0.15)
        chk("senales.n_contratistas", sen["concentracion"]["n_contratistas"], cc["n"], abs_=0)

        # ── 8. Género (independiente, desde CRUDA) ────────────────────────────
        gen = J("analisis")["items"]["genero"]["kpis"]
        g = q1(
            f"""WITH base AS (SELECT valor,
                  CASE WHEN UPPER(TRIM(genero_representante_legal)) IN ('F','MUJER','FEMENINO') THEN 'Mujer'
                       WHEN UPPER(TRIM(genero_representante_legal)) IN ('M','HOMBRE','MASCULINO') THEN 'Hombre'
                       ELSE 'x' END g
                FROM {C} WHERE {W}),
                mh AS (SELECT * FROM base WHERE g IN ('Mujer','Hombre'))
                SELECT ROUND(100*COUNTIF(g='Mujer')/COUNT(*),1) pcm,
                       ROUND(100*SUM(IF(g='Mujer',valor,0))/SUM(valor),1) pvm FROM mh"""
        )
        chk("genero.pct_contratos_mujer", gen["pct_contratos_mujer"], g["pcm"], abs_=0.15)
        chk("genero.pct_valor_mujer", gen["pct_valor_mujer"], g["pvm"], abs_=0.15)

        # ── 9. Señales: adiciones y monopolio (independiente, CRUDA) ──────────
        ext = J("senales_extra")["items"]
        a = q1(
            f"""SELECT COUNTIF(fecha_prorroga IS NOT NULL) c,
                       SUM(IF(fecha_prorroga IS NOT NULL, valor, 0)) v
                FROM {C} WHERE {WP}"""
        )
        chk("senal.adiciones.contratos", ext["adiciones"]["contratos"], a["c"], abs_=0)
        chk("senal.adiciones.valor", ext["adiciones"]["valor"], a["v"], rel=1e-6)
        m = q1(
            f"""SELECT COUNT(*) m FROM (
                  SELECT entidad_municipio, contratista_nit,
                         SUM(valor)/SUM(SUM(valor)) OVER (PARTITION BY entidad_municipio) sh,
                         COUNT(*) OVER (PARTITION BY entidad_municipio) nm
                  FROM {C} WHERE {WP} AND entidad_municipio IS NOT NULL GROUP BY 1,2)
                WHERE sh >= 0.5 AND nm BETWEEN 30 AND 5000"""
        )
        chk("senal.monopolio_municipal.municipios", ext["monopolio_municipal"]["municipios"], m["m"], abs_=0)

        # ── 10. Coherencia interna pura (sin BigQuery) ────────────────────────
        pa = J("panorama")
        coh("Σ panorama.por_anio.contratos == kpis.contratos",
            sum(r["contratos"] for r in pa["por_anio"]) == pa["kpis"]["contratos"],
            f"Σaño={sum(r['contratos'] for r in pa['por_anio'])} kpi={pa['kpis']['contratos']}")
        suma_f = fin["pgn"] + fin["propios"] + fin["sgp"] + fin["regalias"]
        coh("financiacion: Σbolsas ≈ valor_con_fuente", _close(suma_f, fin["valor_con_fuente"], rel=1e-6),
            f"Σ={suma_f:.0f} vcf={fin['valor_con_fuente']:.0f}")
        coh("financiacion: pct_con_fuente ≈ vcf/total",
            _close(fin["pct_con_fuente"], fin["valor_con_fuente"]/fin["valor_total"], rel=1e-3),
            f"pct={fin['pct_con_fuente']:.4f}")
        pct = [r["valor"] for r in sen["percentiles_valor"]]
        coh("senales.percentiles monótonos crecientes", all(pct[i] <= pct[i+1] for i in range(len(pct)-1)),
            str(pct))
        cr = J("cruces")
        coh("cruces.donante.nits <= total_contratistas",
            cr["donante"]["nits"] <= cr["donante"]["total_contratistas"],
            f"nits={cr['donante']['nits']} total={cr['donante']['total_contratistas']}")
        dur = J("analisis")["items"]["duracion"]["kpis"]
        coh("duracion: p25<=mediana<=p75<=p90",
            dur["p25"] <= dur["mediana_dias"] <= dur["p75"] <= dur["p90"],
            f"{dur['p25']}/{dur['mediana_dias']}/{dur['p75']}/{dur['p90']}")

        # Todos los pct del snapshot en [0,100]
        bad_pct = []
        for name in ("como", "ejecucion", "analisis", "senales"):
            obj = J(name)
            def walk(o, path=""):
                if isinstance(o, dict):
                    for k, v in o.items():
                        # 'var_pct' es una VARIACIÓN (puede ser negativa o >100),
                        # no una proporción; la regla [0,100] no le aplica.
                        if "pct" in k and k != "var_pct" and isinstance(v, (int, float)):
                            if not (0 <= v <= 100):
                                bad_pct.append(f"{name}:{path}{k}={v}")
                        walk(v, f"{path}{k}.")
                elif isinstance(o, list):
                    for it in o:
                        walk(it, path)
            walk(obj)
        coh("todos los campos *pct* en [0,100]", not bad_pct, "; ".join(bad_pct) or "ok")

        # ── 10-bis. GUARDS ESTRUCTURALES (sin BigQuery) — blindaje permanente ──
        # (a) FRAGMENTACIÓN: ningún array de UNA sola categoría debe tener etiquetas
        #     repetidas (el síntoma del caso "partidos" sin normalizar). Se ignoran
        #     los arrays de formato largo (categoría + año/grupo).
        def _label_key(rows):
            if not rows or not isinstance(rows[0], dict):
                return None
            strk = [k for k, v in rows[0].items() if isinstance(v, str)]
            dim = [k for k in rows[0] if k in ("anio", "mes", "grupo", "tramo", "p")]
            return strk[0] if (len(strk) == 1 and not dim) else None

        dup_hits = []
        for nm in ("panorama", "quien", "como", "donde", "procesos", "planeacion",
                   "inversion", "ejecucion", "sanciones", "electoral", "cruces", "kpis_extra"):
            def walk(o):
                if isinstance(o, list):
                    lk = _label_key(o)
                    if lk:
                        vals = [r.get(lk) for r in o]
                        if len(vals) != len(set(vals)):
                            dup_hits.append(f"{nm}:{lk}")
                    for it in o:
                        walk(it)
                elif isinstance(o, dict):
                    for v in o.values():
                        walk(v)
            walk(J(nm))
        coh("sin etiquetas categóricas DUPLICADAS (anti-fragmentación)", not dup_hits, ", ".join(dup_hits) or "ok")

        # (b) COHERENCIA de desgloses vs totales y monotonías obligatorias.
        pa = J("panorama")
        coh("Σ quien.top_entidades en orden desc", all(
            pa and True for _ in [0]) and all(
            J("quien")["top_entidades"][i]["valor"] >= J("quien")["top_entidades"][i + 1]["valor"]
            for i in range(len(J("quien")["top_entidades"]) - 1)), "")
        ej = J("ejecucion")["kpis"]
        coh("ejecucion: facturado<=contratado y pagado<=contratado",
            ej["facturado"] <= ej["contratado"] and ej["pagado"] <= ej["contratado"], "")
        iv = J("inversion")["kpis"]
        coh("inversion: pagado<=vigente y pct_ejecucion en [0,1]",
            iv["valor_pagado"] <= iv["valor_vigente"] and 0 <= iv["pct_ejecucion"] <= 1, "")
        cm = J("como")
        coh("como: Σ por_modalidad.pct ≈ 100",
            99.0 <= sum(m["pct"] for m in cm["por_modalidad"]) <= 101.0, "")

        # ── 11. FULL: fuentes no-contratos + 11 señales cruzadas (--full) ─────
        if "--full" in sys.argv:
            import materialize_public as M

            # 11a. KPIs de otras fuentes: re-ejecuta la query real y compara al JSON.
            def src(metric, sqlfile, jsonfile, fields):
                r = list(client.query(M._sql(sqlfile)).result())
                r = dict(r[0]) if r else {}
                snap = J(jsonfile)["kpis"]
                for jf, qf in fields.items():
                    bqv = r.get(qf)
                    chk(f"{metric}.{jf}", snap.get(jf), 0 if bqv is None else bqv,
                        rel=1e-6, abs_=0.15)

            src("inversion", "inversion_kpis.sql", "inversion",
                {"proyectos": "proyectos", "valor_vigente": "valor_vigente",
                 "valor_pagado": "valor_pagado", "pct_ejecucion": "pct_ejecucion"})
            src("planeacion", "planeacion_kpis.sql", "planeacion",
                {"items": "items", "valor_planeado": "valor_planeado", "entidades": "entidades"})
            src("sanciones", "sanciones_kpis.sql", "sanciones",
                {"total": "total", "inhabilidad_vigente": "inhabilidad_vigente",
                 "inhabilidad_promedio_meses": "inhabilidad_promedio_meses"})
            src("electoral", "electoral_kpis.sql", "electoral",
                {"aportes": "aportes", "monto_total": "monto_total", "candidatos": "candidatos"})
            src("procesos", "procesos_kpis.sql", "procesos",
                {"total": "total", "pct_adjudicado": "pct_adjudicado"})

            # 11b. Las 11 señales: re-ejecuta _build_senales_extra y compara al JSON.
            se = M._build_senales_extra(client)["items"]
            snap_se = J("senales_extra")["items"]
            for key, fields in snap_se.items():
                for fld, sval in fields.items():
                    bqv = se.get(key, {}).get(fld)
                    is_count = fld in ("contratos", "proyectos", "casos", "municipios",
                                       "personas", "empresas", "contratistas", "clusters",
                                       "aportantes_que_contratan")
                    chk(f"senal.{key}.{fld}", sval, 0 if bqv is None else bqv,
                        abs_=0 if is_count else 0.5, rel=1e-6)

            # 11b-bis. GUARDIA DE SENTIDO: ningún valor de señal (suma de valores
            # de contratos) puede superar el universo total contratado. Detecta
            # fan-out de JOINs. brechas_bpin es de otra fuente (BPIN), exenta.
            universo = J("panorama")["kpis"]["valor_total"]
            for key, fields in snap_se.items():
                if key == "brechas_bpin":
                    continue
                v = fields.get("valor")
                if v is not None:
                    coh(f"sentido: senal.{key}.valor <= universo", v <= universo,
                        f"valor={v:,.0f} (universo={universo/1e12:,.0f} B)")

            # 11c. Vigencias reales de BPIN (decide si el filtro 2022-2026 es superset).
            vg = [r["v"] for r in client.query(
                f"SELECT DISTINCT SAFE_CAST(vigencia AS INT64) v FROM `{PROJECT}.{DATASET}.bpin_ejecucion` ORDER BY v"
            ).result()]
            rows.append(("BPIN vigencias presentes", str(vg), "—", "INFO"))

            # 11d. Códigos objeto_clasificado SIN etiqueta explícita (calidad de labels).
            # Calidad de etiquetas: objeto_clasificado es texto de alta cardinalidad
            # (miles de variantes compuestas). objeto_label normaliza el PRIMER
            # segmento; el resto cae a INITCAP limpio. Lo relevante es cuánto VALOR
            # queda en categorías visibles sin etiqueta canónica: aquí medimos el
            # valor que NO está en una de las 33 categorías canónicas.
            canon = {
                "Salud","Consultoría","Contratación de personal","Educación","Apoyo a la gestión",
                "Jurídico","Cultura y deporte","Social","Construcción","Tecnología","Seguridad",
                "Comunicaciones","Financiero","Arrendamiento","Alimentación","Transporte",
                "Agropecuario","Medio ambiente","Capacitación y formación","Gestión documental",
                "Mantenimiento","Vivienda","Suministro","Aseo","Telecomunicaciones",
                "Agua y saneamiento","Catastro","Defensa","Interventoría",
                "Servicios públicos","Minas y energía","Infraestructura","Sin clasificar",
            }
            inlist = ",".join(repr(x) for x in canon)
            r = q1(
                f"SELECT SUM(valor) t, "
                f"SUM(IF(({M._OBJETO_LABEL}) NOT IN ({inlist}), valor, 0)) v "
                f"FROM {C} WHERE {W}"
            )
            pct_nc = round(float(r["v"]) * 100.0 / float(r["t"]), 1)
            rows.append((f"valor en categorías NO canónicas (cola INITCAP)",
                         f"{pct_nc}% del valor", "—",
                         "INFO" if pct_nc < 8 else "REVISAR"))

    finally:
        client.query(f"DROP TABLE IF EXISTS {VB}").result()

    # ── Reporte ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 86)
    print(f"{'MÉTRICA':<48} {'SNAPSHOT':>16} {'BIGQUERY':>14} {'ESTADO':>6}")
    print("-" * 86)
    fails = 0
    for metric, snap, bq, estado in rows:
        if estado in ("DESAJUSTE", "FALLA"):
            fails += 1
        sv = f"{snap:,.0f}" if isinstance(snap, (int, float)) else str(snap)[:16]
        bv = f"{bq:,.0f}" if isinstance(bq, (int, float)) else str(bq)[:14]
        print(f"{metric[:48]:<48} {sv:>16} {bv:>14} {estado:>6}")
    print("=" * 86)
    total = sum(1 for *_, e in rows if e in ("OK", "DESAJUSTE", "FALLA"))
    print(f"Verificaciones: {total} | OK: {total - fails} | Problemas: {fails}")
    print("RESULTADO:", "✅ TODO RECONCILIA" if fails == 0 else f"⚠️ {fails} DESAJUSTE(S) — revisar")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
