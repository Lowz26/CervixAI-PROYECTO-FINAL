const { store, sendJson, authenticate } = require('./_utils');

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

  const totalAnalyses = store.analysisHistory.length;
  const lastAnalysis = store.analysisHistory[store.analysisHistory.length - 1] || null;
  const positiveCount = store.analysisHistory.filter((item) => item.result === 'positivo').length;
  const negativeCount = store.analysisHistory.filter((item) => item.result === 'negativo').length;

  sendJson(res, 200, {
    summary: {
      totalAnalyses,
      lastAnalysis,
      positiveCount,
      negativeCount,
    },
    note: 'Este backend usa almacenamiento en memoria dentro de funciones Vercel y no persiste datos permanentemente.',
  });
};
