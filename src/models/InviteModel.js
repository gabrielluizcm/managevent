const mongoose = require('mongoose');
const validator = require('validator');
const nodemailer = require('nodemailer');

const InviteSchema = new mongoose.Schema({
  name: { type: String },
  from: { type: String },
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

  setDetails(sentAt, status, eventId) {
    this.body.sentAt = sentAt;
    this.body.status = status;
    this.body.eventId = eventId;
  }

  validate() {
    this.cleanup();

    if (this.body.name < 3 || this.body.name > 20) this.errors.push('Invalid name: must have at least 3 characters and 20 max');
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

  async send(params) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dev.gabrielluiz@gmail.com',
        pass: process.env.MAILPASSWORD
      }
    });
    const mailOptions = {
      from: this.body.from,
      to: this.body.to,
      subject: `Invitation for event ${params.eventName}`,
      html: `<h1>Hello <b>${params.invitedName}</b>!</h1>
      <h2>Your friend <b>${params.userName}</b> has invited you to the event <b>${params.eventName}</b> on <b>${params.eventDate}</b>.</h2>
      <p>If you're interested in more details or wish to confirm your presence, please, click the link below to access our website: </p>
      <p><a href="${params.inviteLink}" target="_blank">${params.eventName} on ManagEvent</a></p>
      <p>This is an automatic email, please do not respond.</p>
      <p><a href="http://managevent.com" target="_blank">ManagEvent&#169;</a> by <a href="http://github.com/gabrielluizcm" target="_blank">Gabriel Luiz</a></p>`
    };

    return await transporter.sendMail(mailOptions)
      .then(info => true)
      .catch(error => {
        this.errors.push(`Error code ${error.code}`); return false;
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
