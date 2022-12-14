const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateTime: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  creatorId: { type: String, required: true },
  cancelledAt: { type: String },
});

const EventModel = mongoose.model('Event', EventSchema);

class Event {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.event = null;
  }

  async create() {
    this.validate();
    if (this.errors.length) return;

    this.event = await EventModel.create(this.body);
  }

  async edit(id) {
    if (typeof id !== 'string') return;
    this.validate();
    if (this.errors.length) return;
    this.event = await EventModel.findByIdAndUpdate(id, this.body, { new: true });
  }

  validate() {
    this.cleanup();

    if (this.body.name < 3 || this.body.name > 20) this.errors.push('Invalid name: must have at least 3 characters and 20 max');
    if (!this.body.dateTime) this.errors.push('Invalid date and hour');
    if (this.body.name < 5 || this.body.name > 50) this.errors.push('Invalid description: must have at least 5 characters and 50 max');
  }

  cleanup() {
    for (const key in this.body)
      if (!typeof this.body[key] === 'string')
        this.body[key] = '';

    delete this.body._csrf;
  }

  static async find(id) {
    if (typeof id !== 'string') return;
    const event = EventModel.findById(id);
    return event;
  }

  static async findMyEvents(creatorId) {
    var myEvents = EventModel.find({ creatorId: creatorId }).sort({ dateTime: 1 });
    return myEvents;
  }
  static async findEvents(creatorId = false) {
    var events = EventModel.find({ creatorId: { $ne: creatorId } }).sort({ dateTime: 1 });
    return events;
  }
}

module.exports = Event;
