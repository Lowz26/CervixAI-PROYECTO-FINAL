const { store, sendJson, authenticate } = require('../_utils');

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const payload = authenticate(req, res);
  if (!payload) return;

  const id = Number(req.query.id);
  if (!id) {
    sendJson(res, 400, { message: 'ID inválido' });
    return;
  }

  const itemIndex = store.analysisHistory.findIndex((entry) => entry.id === id);
  const item = store.analysisHistory[itemIndex];

  if (!item) {
    sendJson(res, 404, { message: 'Registro no encontrado' });
    return;
  }

  if (req.method === 'GET') {
    sendJson(res, 200, item);
    return;
  }

  if (req.method === 'DELETE') {
    store.analysisHistory.splice(itemIndex, 1);
    sendJson(res, 200, { message: 'Registro eliminado' });
    return;
  }

  sendJson(res, 405, { message: 'Método no permitido' });
};
