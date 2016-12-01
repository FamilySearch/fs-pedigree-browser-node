/**
 * Middleware that ensures a user is authenticated with FS and that the current
 * user has been loaded and saved in the session.
 */
module.exports = function(req, res, next){
  if(req.session.fs_token){
    if(!req.session.user){
      req.fs.get('/platform/users/current', function(error, userResponse){
        if(userResponse.statusCode === 200){
          req.session.user = userResponse.data.users[0];
        } else {
          console.log(`Unexpected current user response: ${userResponse.statusCode} ${userResponse.statusText}`);
        }
        next();
      });
      return;
    }
    next();
  } else {
    res.redirect('/');
  }
};