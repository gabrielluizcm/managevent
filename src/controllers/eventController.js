const Event = require('../models/EventModel');
const Invite = require('../models/InviteModel');

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
  const eventId = req.params.id;
  if (!eventId) return res.render('404');
  const event = await Event.find(req.params.id);
  if (!event) return res.render('404');

  try {
    const invite = new Invite(req.body);
    invite.body.from = req.session.user.email;
    invite.setDetails((new Date()).getTime(), 'P', eventId);

    await invite.create()
    if (invite.errors.length) {
      req.flash('errors', invite.errors);
      return req.session.save(() => res.redirect(`/events/send/${eventId}`));
    }

    const params = {
      eventName: event.name,
      invitedName: invite.invite.name,
      userName: req.session.user.name,
      eventDate: (new Date(event.dateTime)).toLocaleString(),
      inviteLink: getInviteBaseUrl(req)
    };

    if (!await invite.send(params)) {
      req.flash('errors', invite.errors);
      invite.errors = [];
      invite.body.status = 'F';
      await invite.edit(`${invite.invite._id}`);
      return req.session.save(() => res.redirect(`/events/send/${eventId}`));
    }

    req.flash('successes', 'Invite sent successfully!')
    return req.session.save(() => res.redirect(`/events/send/${eventId}`));
  } catch (err) {
    console.log(err);
    return res.render('404');
  }
};

exports.invite = async (req, res) => {
  if (!req.params.id) return res.render('404');

  const invite = await Invite.find(req.params.id);
  if (!invite) return res.render('404');

  const event = await Event.find(invite.eventId);
  event.dateTime = (new Date(event.dateTime)).toLocaleString();

  res.render('invite', { invite, event });
}

exports.respond = async (req, res) => {
  const inviteData = await Invite.find(req.params.id);
  if (!inviteData) return res.render('404');
  const invite = new Invite(inviteData);
  invite.body.status = req.body.response;

  try {
    await invite.edit(req.params.id);

    if (invite.errors.length) {
      req.flash('errors', invite.errors);
      req.session.save(() => res.redirect(`/events/invite/${req.params.id}`));
      return;
    }

    req.flash('successes', 'Invite responded successfully!');
    req.session.save(() => res.redirect(`/events/invite/${req.params.id}`));
  } catch (err) {
    console.log(err);
    return res.render('404');
  }
}

function getInviteBaseUrl(req) {
  const protocol = req.protocol;
  const host = req.hostname;
  const eventId = req.params.id;

  return `${protocol}://${host}/invitation/${eventId}`;
}