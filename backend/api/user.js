const { sendJson, authenticate } = require('./_utils');

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { message: 'Método no permitido' });
    return;
  }

  const payload = authenticate(req, res);
  if (!payload) return;

  sendJson(res, 200, { id: payload.id, username: payload.username, name: payload.name });
};
