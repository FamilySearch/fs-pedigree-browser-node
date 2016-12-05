var express = require('express');
var router = express.Router();

// Setup the FS sdk client before handling any requests on this router.
router.use(require('../middleware/fs-client'));

// Start FS sign in by forwarding the user to the OAuth sign in page.
router.get('/', function(req, res, next) {
  
  // oauthRedirectURL() returns the URL that the user should be redirected to
  // on familysearch.org for starting OAuth. The propery query params will be
  // set for the app key (client id) and the redirect uri.
  res.redirect(req.fs.oauthRedirectURL());
});

module.exports = router;
