const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true },
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

  static async find(id) {
    if (typeof id !== 'string') return;
    const invite = InviteModel.findById(id);
    return invite;
  }

  static async findByEvent(eventId) {
    var invite = InviteModel.find({ eventId: eventId }).sort({ sentAt: 1 });
    return invite;
  }

  static async findByEmailEvent(email, eventId) {
    var invite = InviteModel.find({ email: email, eventId: eventId }).sort({ sentAt: 1 });
    return invite;
  }
}

module.exports = Invite;
