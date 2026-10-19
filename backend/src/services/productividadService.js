const Tarea = require('../models/Tarea');
const { exigirPremium } = require('../utils/plan');

// Tareas que el usuario completó en un mes, contadas por día.
// Plan básico: solo el mes actual. Premium: cualquier mes (histórico).
async function delMes(usuario, { anio, mes }) {
  const hoy = new Date();
  const year = anio || hoy.getFullYear();
  const month = mes || hoy.getMonth() + 1;
  const esActual = year === hoy.getFullYear() && month === hoy.getMonth() + 1;

  if (!esActual) {
    exigirPremium(usuario, 'El historial de meses anteriores es exclusivo de la versión Premium');
  }

  const completadas = await Tarea.find({
    asignadoA: usuario._id,
    estado: 'completada',
    fechaCompletada: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) },
  }).select('fechaCompletada fechaLimite');

  const diasDelMes = new Date(year, month, 0).getDate();
  const porDia = Array(diasDelMes).fill(0);
  let aTiempo = 0;

  completadas.forEach((tarea) => {
    porDia[tarea.fechaCompletada.getDate() - 1] += 1;
    if (!tarea.fechaLimite || tarea.fechaCompletada <= tarea.fechaLimite) aTiempo += 1;
  });

  return {
    anio: year,
    mes: month,
    esMesActual: esActual,
    completadas: completadas.length,
    aTiempo,
    porDia,
  };
}

module.exports = { delMes };
