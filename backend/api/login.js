const { store, sendJson, sendOptions, signToken } = require('./_utils');

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    sendOptions(res);
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'Método no permitido' });
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    try {
      const { username, password } = JSON.parse(body || '{}');
      if (username !== store.user.username || password !== store.user.password) {
        sendJson(res, 401, { message: 'Credenciales incorrectas' });
        return;
      }

      const token = signToken({ id: store.user.id, username: store.user.username, name: store.user.name });
      sendJson(res, 200, {
        token,
        user: { id: store.user.id, username: store.user.username, name: store.user.name },
      });
    } catch (error) {
      sendJson(res, 400, { message: 'Solicitud inválida' });
    }
  });
};
