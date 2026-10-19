// Formato uniforme: { ok: true, data } cuando sale bien, { ok: false, mensaje } cuando falla.

const exito = (res, data, codigo = 200) => res.status(codigo).json({ ok: true, data });

const creado = (res, data) => exito(res, data, 201);

module.exports = { exito, creado };
