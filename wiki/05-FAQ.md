# FAQ

**¿Esto dice quién es corrupto?**
No. El proyecto describe datos públicos; no juzga, no acusa, no califica. Ver [Metodología](03-Metodologia.md).

**¿De dónde salen los datos?**
Del SECOP II (datos abiertos de la contratación pública colombiana), ventana 2022–2026. Ver [Fuentes](01-Fuentes.md).

**¿Están actualizados al minuto?**
No. Es una **foto fija**: un snapshot que se regenera manualmente cuando los mantenedores corren el materializador. La fecha de corte aparece en la sección **Acerca**.

**¿Por qué 2026 se ve incompleto?**
Porque es el año en curso: se completa a medida que se publican más contratos.

**¿Necesito BigQuery / una cuenta para usar el sitio o forkearlo?**
No. El snapshot viene incluido. Solo necesitas BigQuery si quieres **regenerar** los datos con tu propia fuente.

**¿Puedo usar este código para mi propio proyecto?**
Sí, bajo Apache 2.0. Úsalo, modifícalo, despliégalo —incluso comercialmente— conservando la atribución. Ver [Hacer un fork](04-Hacer-Un-Fork.md).

**¿Tiene login o cuentas?**
No. El sitio público es 100% anónimo y de solo lectura. No hay registro ni inicio de sesión.

**¿Por qué es estático y no una app con backend?**
Por simplicidad, costo y seguridad: sin servidor que mantener ni que pueda ser abusado. La única superficie pública son archivos.

**Encontré un error en los datos / la gráfica. ¿Qué hago?**
Abre un *issue* indicando la sección y el periodo. Ver [CONTRIBUTING](../CONTRIBUTING.md).
