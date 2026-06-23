#!/usr/bin/env python
"""Publica la carpeta wiki/ en la Wiki de GitHub (repo .wiki.git).

GitHub exige crear la PRIMERA página de la Wiki manualmente (una vez) desde la
web — pestaña «Wiki» → «Create the first page» → «Save Page» — antes de permitir
el push por git. Hecho ese clic, este script publica las 16 páginas:

    python scripts/publish_wiki.py

Transforma los enlaces para que funcionen en la Wiki de GitHub:
- enlaces entre páginas: quita la extensión .md (la Wiki usa el slug del archivo).
- referencias a archivos del repo (../path): a URL absoluta en GitHub.
Añade _Sidebar.md (navegación) y _Footer.md (créditos).
"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")  # consola Windows = cp1252
except Exception:
    pass

REPO = "alejoamorocho/ContratacionColombia"
WIKI_URL = f"https://github.com/{REPO}.wiki.git"
BLOB = f"https://github.com/{REPO}/blob/main"
SRC = Path(__file__).resolve().parent.parent / "wiki"

ORDEN = [
    ("Home", "Inicio"), ("00-Que-Es", "Qué es"), ("14-La-Historia", "La historia del proyecto"),
    ("07-Las-Secciones", "Las secciones"), ("01-Fuentes", "Fuentes"),
    ("02-Datos-y-Materializacion", "Materialización"), ("06-Auditoria-De-Datos", "Auditoría de datos"),
    ("09-Caveats-Y-Limites", "Caveats y límites"), ("03-Metodologia", "Metodología"),
    ("13-Como-Se-Calcula-Todo", "Cómo se calcula todo"), ("08-Los-Cruces", "Los cruces"),
    ("10-Glosario", "Glosario"), ("11-Arquitectura", "Arquitectura"),
    ("04-Hacer-Un-Fork", "Hacer un fork"), ("12-Despliegue", "Despliegue"), ("05-FAQ", "FAQ"),
]


def transform(text: str) -> str:
    text = re.sub(r"\]\(\.\./([^)]+)\)", lambda m: f"]({BLOB}/{m.group(1)})", text)
    text = re.sub(r"\]\((?!https?://)([^)#]+)\.md(#[^)]*)?\)",
                  lambda m: f"]({m.group(1)}{m.group(2) or ''})", text)
    return text


def main() -> int:
    tmp = Path(tempfile.mkdtemp(prefix="vectorvi-wiki-"))
    print(f"→ Clonando {WIKI_URL} …")
    r = subprocess.run(["git", "clone", WIKI_URL, str(tmp)], capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr.strip())
        print("\n✖ No se pudo clonar la Wiki. Crea la PRIMERA página desde la web una vez:")
        print(f"   https://github.com/{REPO}/wiki  →  Create the first page  →  Save Page")
        print("   Luego vuelve a correr: python scripts/publish_wiki.py")
        return 1

    for p in tmp.glob("*.md"):  # limpia el contenido anterior (no .git)
        p.unlink()
    for p in sorted(SRC.glob("*.md")):
        (tmp / p.name).write_text(transform(p.read_text(encoding="utf-8")), encoding="utf-8")

    (tmp / "_Sidebar.md").write_text(
        "### VECTORVI — Wiki\n\n" + "\n".join(f"- [{t}]({s})" for s, t in ORDEN) + "\n",
        encoding="utf-8")
    (tmp / "_Footer.md").write_text(
        "VECTORVI · Observatorio público de contratación colombiana · Apache 2.0 · "
        f"Alejandro y Juan José Amorocho · [Repositorio](https://github.com/{REPO})\n",
        encoding="utf-8")

    subprocess.run(["git", "-C", str(tmp), "add", "-A"], check=True)
    subprocess.run(["git", "-C", str(tmp), "commit", "-m", "Sincronizar wiki/ → Wiki de GitHub"],
                   capture_output=True, text=True)
    r = subprocess.run(["git", "-C", str(tmp), "push"], capture_output=True, text=True)
    print(r.stdout.strip() or r.stderr.strip())
    if r.returncode == 0:
        print(f"\n✓ Wiki publicada: https://github.com/{REPO}/wiki")
    shutil.rmtree(tmp, ignore_errors=True)
    return r.returncode


if __name__ == "__main__":
    raise SystemExit(main())
