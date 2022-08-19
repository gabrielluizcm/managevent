const Event = require('../models/EventModel');

exports.add = (req, res) => {
  res.render('eventForm');
  return;
}

exports.create = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.create();

    if (event.errors.length) {
      req.flash('errors', event.errors);
      req.session.save(() => res.redirect('/events/create/'));
      return;
    }

    req.flash('successes', 'Event created successfully!')
    req.session.save(() => res.redirect('/'));
  } catch (err) {
    console.log(err);
    return res.render('404');
  }
}