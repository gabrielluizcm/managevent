const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const LoginSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
});

const LoginModel = mongoose.model('Login', LoginSchema);

class Login {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  async register() {
    this.validate();
    if (this.errors.length) return;

    await this.userExists();
    if (this.errors.length) return;

    try {
      const salt = bcryptjs.genSaltSync();
      this.body.password = bcryptjs.hashSync(this.body.password, salt);
      this.user = await LoginModel.create(this.body);
    } catch (err) {
      this.errors.push(err.message);
      console.log(err);
    }
  }

  validate() {
    this.cleanup();

    if (this.body.name < 3 || this.body.name > 30) this.errors.push('Invalid name: must have at least 3 characters and 30 max');
    if (!validator.isEmail(this.body.email)) this.errors.push('Invalid e-mail');
    if (this.body.password < 3 || this.body.password > 16) this.errors.push('Invalid password: must have at least 3 characters and 16 max');
    if (this.body.password !== this.body.confirmPassword) this.errors.push('Passwords do not match');

    delete this.body.confirmPassword;
  }

  async userExists() {
    try {
      if (await LoginModel.findOne({ email: this.body.email }))
        this.errors.push('Email already registered');
    } catch (err) {
      this.errors.push(err.message);
      console.log(err);
    }
  }

  cleanup() {
    for (const key in this.body)
      if (!typeof this.body[key] === 'string')
        this.body[key] = '';

    delete this.body._csrf;
  }
}

module.exports = Login;
