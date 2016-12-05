var express = require('express');
var router = express.Router();

// On sign out we just destroy the session and forward to the home page.
// We don't try to invalidate the FS access token.
router.get('/', function(req, res, next) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
