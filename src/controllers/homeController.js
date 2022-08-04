exports.index = (req, res) => {
  res.render('index');
  return;
};

exports.postEndpoint = (req, res) => {
  res.send(req.body);
  return;
};
