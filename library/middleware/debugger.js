module.exports = function (err, req, res, next) {
  res.render('error', {
    message: err.message,
    error: err
  });
};
