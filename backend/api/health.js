const { sendJson } = require('./_utils');

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }
  sendJson(res, 200, { status: 'ok', mode: 'serverless-memory' });
};
