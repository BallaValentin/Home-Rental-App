export default function userSession(req, res, next) {
  res.locals.user = req.session.user;
  next();
}
