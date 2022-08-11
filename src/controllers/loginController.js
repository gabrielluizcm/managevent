const Login = require('../models/LoginModel');

exports.index = (req, res) => {
  res.render('login');
  return;
};

exports.signup = (req, res) => {
  res.render('signup');
  return;
}

exports.signin = (req, res) => {
  res.render('login');
  return;
};

exports.register = async (req, res) => {
  try {
    const login = new Login(req.body);
    await login.register();

    if (login.errors.length) {
      req.flash('errors', login.errors);
      req.session.save(() => res.redirect('/signup/'));
      return;
    }

    req.flash('successes', 'Account created successfully!')
    req.session.save(() => res.redirect('/login/'));
  } catch (err) {
    return res.render('404');
  }
}