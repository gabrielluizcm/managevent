const Login = require('../models/LoginModel');

exports.index = (req, res) => {
  if (req.session.user) {
    req.flash('warnings', 'You are already logged in');
    req.session.save(() => res.render('alreadyLoggedIn'));
    return;
  };
  return res.render('login');
};

exports.signup = (req, res) => {
  res.render('signup');
  return;
};

exports.signin = async (req, res) => {
  try {
    const login = new Login(req.body);
    await login.login();

    if (login.errors.length) {
      req.flash('errors', login.errors);
      req.session.save(() => res.redirect('/login/'));
      return;
    }

    req.flash('successes', 'Logged in!')
    req.session.user = login.user;
    req.session.save(() => res.redirect('/'));
  } catch (err) {
    return res.render('404');
  }
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
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};