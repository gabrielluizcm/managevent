exports.middlewareGlobal = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.errors = req.flash('errors');
  res.locals.successes = req.flash('successes');
  next();
};

exports.outroMiddleware = (req, res, next) => {
  next();
};

exports.checkCsrfError = (err, req, res, next) => {
  if (err) {
    return res.render('404');
  }
};