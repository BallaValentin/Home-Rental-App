export default function checkAuth(req, res, next) {
  if (!req.session.user && !req.query.message) {
    res.redirect('index/?message=expired');
  } else {
    next();
  }
}
