const Event = require('../models/EventModel');

exports.add = (req, res) => {
  if (!req.session.user) return res.render('404');
  res.render('eventForm', { event: {} });
  return;
};

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
};

exports.edit = async (req, res) => {
  if (!req.session.user) return res.render('404');
  if (!req.params.id) return res.render('404');

  const event = await Event.find(req.params.id);
  if (!event) return res.render('404');

  res.render('eventForm', { event });
};

exports.patch = async (req, res) => {
  try {
    if (!req.params.id) return res.render('404');
    const event = new Event(req.body);
    await event.edit(req.params.id);

    if (event.errors.length) {
      req.flash('errors', event.errors);
      req.session.save(() => res.redirect(`/events/edit/${req.params.id}`));
      return;
    }

    req.flash('successes', 'Event edited successfully!');
    req.session.save(() => res.redirect('/'));
  } catch (err) {
    console.log(err);
    return res.render('404');
  }
};

exports.details = async (req, res) => {
  if (!req.session.user) return res.render('404');
  if (!req.params.id) return res.render('404');

  const event = await Event.find(req.params.id);
  if (!event) return res.render('404');

  res.render('eventDetails', { event });
};

exports.send = async (req, res) => {
  if (!req.session.user) return res.render('404');
  if (!req.params.id) return res.render('404');

  const event = await Event.find(req.params.id);
  if (!event) return res.render('404');

  const inviteBaseUrl = getInviteBaseUrl(req);
  res.render('sendInvite', { event, inviteBaseUrl });
}

exports.dispatch = async (req, res) => {
  try {
    res.send(req.body);
  } catch (err) {
    console.log(err);
    return res.render('404');
  }
};

function getInviteBaseUrl(req) {
  const protocol = req.protocol;
  const host = req.hostname;
  const eventId = req.params.id;

  return `${protocol}://${host}/invitation/${eventId}`;
}