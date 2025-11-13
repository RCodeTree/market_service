/**
 * 统一 JSON 响应工具
 * - 处理 BigInt 自动转换
 */
const safeStringify = (obj) => {
  const seen = new WeakSet();
  const replacer = (_, value) => {
    if (typeof value === 'bigint') return Number(value);
    if (value && typeof value === 'object') {
      if (seen.has(value)) return undefined;
      seen.add(value);
    }
    return value;
  };
  return JSON.stringify(obj, replacer);
};

const jsonResponse = (res, statusCode, payload) => {
  res.set('Content-Type', 'application/json');
  res.status(statusCode).send(safeStringify(payload));
};

const ok = (res, message, data, code = 200) => {
  jsonResponse(res, 200, {
    success: true,
    code,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const error = (res, statusCode, message, code = statusCode, extra = {}) => {
  jsonResponse(res, statusCode, {
    success: false,
    code,
    message,
    ...extra,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  jsonResponse,
  ok,
  error,
};
