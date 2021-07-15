export function test(req, res) {
  return res.status(200).json({
    requestId: req.id,
    code: 200,
    data: {
      test: req.body,
      timestamp: new Date(),
    },
  });
}

export function register(req, res, next) {
  res.status(201).json({
    requestId: req.id,
    code: 200,
    data: req.body,
  });
  next();
}

export function hit(req, res, next) {
  res.status(201).json({
    requestId: req.id,
    code: 200,
    data: req.body,
  });
  next();
}

export function display(req, res, next) {
  res.status(200).json({
    requestId: req.id,
    code: 200,
    data: req.body,
  });
  next();
}
