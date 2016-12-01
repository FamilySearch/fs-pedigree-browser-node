var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.fs.oauthToken(req.query.code, function(error, tokenResponse){
    if(error || tokenResponse.statusCode >= 400){
      return next(error || tokenResponse.data);
    }
    req.session.fs_token = tokenResponse.data.access_token;
    req.session.save(function(){
      res.redirect('/pedigree');
    });
  });
});

module.exports = router;
