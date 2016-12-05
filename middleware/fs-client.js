var FamilySearch = require('fs-js-lite');
var config = require('config');

// Middleware that sets up the FS sdk.
module.exports = function(req, res, next){
  
  // We wrap it in a try/catch block because config will throw an exception
  // if the setting doesn't exist.
  try {
    var domain = req.protocol + '://' + req.hostname;
    req.fs = new FamilySearch({
      environment: config.get('FS.environment'),
      appKey: config.get('FS.appKey'),
      redirectUri: domain + '/oauth-redirect'
    });
    
    // Load the token if it's saved in the session
    if(req.session && req.session.fs_token){
      req.fs.setAccessToken(req.session.fs_token);
    }
  } catch(e){ 
    return next(e);
  }
  
  next();
};