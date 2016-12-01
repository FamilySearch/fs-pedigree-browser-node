/**
 * Convert an API response into a JS error
 */
module.exports = function(response){
  var error = new Error(response.statusText);
  error.status = response.statusCode;
  error.body = response.body;
  return error;
};