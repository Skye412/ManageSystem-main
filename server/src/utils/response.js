function success(res, data, message = '操作成功') {
  return res.status(200).json({ code: 200, message, data });
}

function error(res, status, message) {
  return res.status(status).json({ code: status, message });
}

module.exports = { success, error };
