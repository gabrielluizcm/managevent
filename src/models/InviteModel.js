const mongoose = require('mongoose');
const validator = require('validator');
const nodemailer = require('nodemailer');

const InviteSchema = new mongoose.Schema({
  name: { type: String },
  from: { type: String, required: true },
  to: { type: String, required: true },
  sentAt: { type: String, required: true },
  acceptedAt: { type: String },
  cancelledAt: { type: String },
  status: { type: String, required: true },
  eventId: { type: String, required: true },
});

const InviteModel = mongoose.model('Invite', InviteSchema);

class Invite {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.invite = null;
  }

  async create() {
    this.validate();
    if (this.errors.length) return;

    this.invite = await InviteModel.create(this.body);
  }

  async edit(id) {
    if (typeof id !== 'string') return;
    this.validate();
    if (this.errors.length) return;
    this.invite = await InviteModel.findByIdAndUpdate(id, this.body, { new: true });
  }

  validate() {
    this.cleanup();

    if (this.body.name < 3 || this.body.name > 20) this.errors.push('Invalid name: must have at least 3 characters and 20 max');
    if (!validator.isEmail(this.body.from)) this.errors.push('Invalid "from" e-mail');
    if (!validator.isEmail(this.body.to)) this.errors.push('Invalid "to" e-mail');
    if (!this.body.sentAt) this.errors.push('Invalid sent timestamp');
    if (!this.body.status) this.errors.push('Invalid status code');
    if (!this.body.eventId) this.errors.push('Invalid event id');
  }

  cleanup() {
    for (const key in this.body)
      if (!typeof this.body[key] === 'string')
        this.body[key] = '';

    delete this.body._csrf;
  }

  send() {
    this.validate();
    if (this.errors.length) return;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dev.gabrielluiz@gmail.com',
        pass: process.env.GMAILPASSWORD
      }
    });
    const mailOptions = {
      from: this.body.from,
      to: this.body.to,
      subject: 'Invitation for event X', //will be dynamic
      text: "You've been invited yadda yadda yadda"
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.errors.push(error);
        return false;
      }
      else
        return true;
    });
  }

  static async find(id) {
    if (typeof id !== 'string') return;
    const invite = InviteModel.findById(id);
    return invite;
  }

  static async findByEvent(eventId) {
    var invite = InviteModel.find({ eventId: eventId }).sort({ sentAt: 1 });
    return invite;
  }

  static async findByFromEvent(from, eventId) {
    var invite = InviteModel.find({ from: from, eventId: eventId }).sort({ sentAt: 1 });
    return invite;
  }

  static async findByToEvent(to, eventId) {
    var invite = InviteModel.find({ to: to, eventId: eventId }).sort({ sentAt: 1 });
    return invite;
  }
}

module.exports = Invite;
