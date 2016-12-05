var express = require('express');
var router = express.Router();
var restError = require('../lib/rest-error');

// Setup the FS sdk client before handling any requests on this router.
router.use(require('../middleware/fs-client'));

// This route handles the response when familysearch.org forwards the user back
// to the app after signin in during OAuth. It retrieves the code from the query
// params, exchanges the code for an access token, and forward the user to the
// pedigree page. If there's an error, the user will be sent to the error page.
router.get('/', function(req, res, next) {
  
  // Exchange the code for an access token and handle the response.
  // https://familysearch.org/developers/docs/api/authentication/Authorization_resource
  req.fs.oauthToken(req.query.code, function(error, tokenResponse){
    
    // error will be set when there was a networking error (i.e. the request
    // didn't make it to the FS API or we didn't receive the response from the
    // API). If we did get a response then we still check the status code 
    // to make sure the user successfully signed in.
    if(error || tokenResponse.statusCode >= 400){
      return next(error || restError(tokenResponse));
    }
    
    // At this point we've verified that the user successfully sign in so we
    // save the access token in the session and forward the user on to the
    // pedigree page. We need to save the access token so that we can setup
    // an instance of the sdk on future requests.
    req.session.fs_token = tokenResponse.data.access_token;
    req.session.save(function(){
      res.redirect('/pedigree');
    });
  });
});

module.exports = router;
