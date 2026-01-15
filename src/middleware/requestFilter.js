module.exports = (req, res, next) => {
  // Request Filter: Log details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Response Filter: Standardize JSON output
  const originalJson = res.json;
  res.json = function (data) {
    const formattedResponse = {
      status: res.statusCode < 400 ? 'Success' : 'Error',
      timestamp: new Date().toISOString(),
      result: data
    };
    return originalJson.call(this, formattedResponse);
  };
  next();
};