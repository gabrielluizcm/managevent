const Event = require('../models/EventModel');

exports.index = async (req, res) => {
  const myEvents = req.session.user ? await Event.findMyEvents(req.session.user._id) : [];
  const events = req.session.user ? await Event.findEvents(req.session.user._id) : [];
  return res.render('index', { myEvents, events });
};