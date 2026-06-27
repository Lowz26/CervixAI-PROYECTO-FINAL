const { store, sendJson, authenticate } = require('./_utils');

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'Método no permitido' });
    return;
  }

  const payload = authenticate(req, res);
  if (!payload) return;

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    try {
      const { imageName, imageNotes } = JSON.parse(body || '{}');
      const result = Math.random() > 0.5 ? 'positivo' : 'negativo';
      const report = {
        id: store.nextId++,
        imageName: imageName || `imagen-${Date.now()}`,
        notes: imageNotes || '',
        result,
        analyzedAt: new Date().toISOString(),
        analyst: payload.name,
      };
      store.analysisHistory.push(report);
      sendJson(res, 200, { message: 'Análisis simulado completado', report });
    } catch (error) {
      sendJson(res, 400, { message: 'Solicitud inválida' });
    }
  });
};
