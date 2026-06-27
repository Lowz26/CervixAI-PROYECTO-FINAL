const { store, sendJson, authenticate } = require('./_utils');

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const payload = authenticate(req, res);
  if (!payload) return;

  if (req.method !== 'GET') {
    sendJson(res, 405, { message: 'Método no permitido' });
    return;
  }

  sendJson(res, 200, { items: store.analysisHistory });
};
