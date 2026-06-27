const store = {
  user: {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Administrador',
  },
  analysisHistory: [],
  nextId: 1,
};

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function sendJson(res, status, payload) {
  setCorsHeaders(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function sendOptions(res) {
  setCorsHeaders(res);
  res.statusCode = 204;
  res.end();
}

function signToken(payload) {
  const tokenPayload = {
    ...payload,
    exp: Date.now() + 4 * 60 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (payload.exp && payload.exp > Date.now()) {
      return payload;
    }
  } catch (_) {
    return null;
  }
  return null;
}

function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
}

function authenticate(req, res) {
  if (req.method === 'OPTIONS') {
    sendOptions(res);
    return null;
  }

  const token = getTokenFromHeader(req);
  const payload = verifyToken(token);
  if (!payload) {
    sendJson(res, 401, { message: 'Token inválido o expirado' });
    return null;
  }
  return payload;
}

module.exports = {
  store,
  sendJson,
  sendOptions,
  signToken,
  verifyToken,
  authenticate,
};
