var express = require('express');
var router = express.Router();
var restError = require('../lib/rest-error');
var async = require('async');

// Setup the FS sdk client before handling any requests on this router.
router.use(require('../middleware/fs-client'));

// Make sure the user is signed in before handling any requests on this router.
router.use(require('../middleware/fs-session'));

// When /pedigree is requested, get the user's personId from the session
// and redirect to /pedigree/[personId]. Not only does this allow us to have
// only one route handler for the pedigree but it also makes the URL easier
// for the user to understand and share.
router.get('/', function(req, res){
  res.redirect('/pedigree/' + req.session.user.personId);
});

// Download a person's 2-generation pedigree and a list of their children. Then
// fetch portrait URLs for all those people.
router.get('/:personId', function(req, res, next) {
  
  var fs = req.fs,
      personId = req.params.personId;
  
  // http://caolan.github.io/async/docs.html#autoInject
  // async.autoInject is an easy way for us to specify and manage dependencies
  // between asynchronous tasks.
  async.autoInject({
    
    // Fetch the person's ancestry. We ask for 2 generations which includes the
    // root person, their parents, and their grandparents (meaning the generations
    // parameter doesn't count the root person as a generation).
    ancestry: function(callback){
      
      // https://familysearch.org/developers/docs/api/tree/Ancestry_resource
      fs.get('/platform/tree/ancestry?generations=2&person=' + personId, function(error, response){
        
        // When requesting a person's ancestry, anything other than an HTTP 200
        // is unexpected and thus we treat it as an error.
        //
        // When `error` is set we won't have a response but the code below will
        // work regardless due to short-circuit evaluation.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_Operators#Short-circuit_evaluation
        if(error || response.statusCode !== 200){
          return callback(error || restError(response));
        }
        
        // Persons returned by the Ancestry resource will include an
        // ascendancyNumber number in their display block. This is an ahnentafel
        // number (Google it) that tells us the person's position in the
        // pedigree. To make the pedigree display easy and fast, we add the 
        // people to a map keyed by that ahnentafel number. Then the pedigree 
        // template can quickly load a person for a position by looking to see
        // if that position's number exists as a key in the ancestry map.
        // This is a O(n) operation.
        //
        // Alternatives include looping through the list each time you want to
        // load a person for a given position, wich is O(n^2), or assembling
        // the pedigree in memory in a nested structure and then recursively
        // traversing that structure in the template (it's as complicated as it
        // sounds).
        var ancestry = {};
        response.data.persons.forEach(function(person){
          ancestry[person.display.ascendancyNumber] = person;
        });
        
        // Notify async.autoInject that we're done with this task and give it
        // the ancestry data so that the data is available for later tasks.
        callback(null, ancestry);
      });
    },
    
    
    // Fetch the person's children.
    children: function(callback){
      
      // https://familysearch.org/developers/docs/api/tree/Children_of_a_Person_resource
      fs.get(`/platform/tree/persons/${personId}/children`, function(error, response){
        
        // Error handling. 
        if(error || response.statusCode >= 400){
          return callback(error || restError(response));
        }
        
        // If a person has no children then the API will reply with an HTTP 204
        // and an empty body so we check for that case and default to an empty
        // array.
        callback(null, response.data ? response.data.persons : []);
      });
    },
    
    // Fetch the persons' portraits. Notice there are three parameters in the
    // function definition for this task as opposed to one parameter being used
    // in the tasks above. The additional `ancestry` and `children` parameters
    // establish a dependency on those tasks and make the data returned by
    // them available to this task.
    portraits: function(ancestry, children, autoCallback){
      
      // The portraits must be fetched one at a time so we use a queue.
      // http://caolan.github.io/async/docs.html#queue
      var q = async.queue(function(person, queueCallback){
        
        // https://familysearch.org/developers/docs/api/tree/Person_Memories_Portrait_resource
        fs.get('/platform/tree/persons/' + person.id + '/portrait', function(error, response){
          
          // We don't handle errors here because missing the portrait is not fatal.
          // We just check to see if a response is available and whether a
          // portrait URL exists.
          //
          // If missing the portrait is a fatal condition for your app then you 
          // would need to handle the error. At the very least you may choose to
          // log the error.
          if(response && response.headers.location){
            
            // We chose to store the portrait URL in the person's display
            // properties because the person objects are already available in the
            // template and because the portrait is only used for display.
            person.display.portrait = response.headers.location;
          }
          
          // Notify the queue that we're done fetching this portrait
          queueCallback();
        });
      });
      
      // When the queue is drained (all tasks have been handled) we notify
      // async.autoInject that we're done by calling the callback it provided.
      q.drain = function(){
        autoCallback();
      };
      
      // Now that our queue is configured we can load it up with tasks. Tasks can
      // be anything. We have chosen here to use the person objects because they
      // include the person Id, which is required for portrait requests, and
      // because we will store the portrait URL in the person's display properties.
      
      // Remember ancestors are stored in a map so we iterate over them and add
      // ancestors one at a time.
      for(var a in ancestry){
        q.push(ancestry[a]);
      }
      
      // Children are stored in an array and q.push() accepts arrays for bulk
      // enqueuing so we add all of the children at once.
      q.push(children);
    }
    
  }, function(error, results){
    
    // At this point async.autoInject has finished processing the tasks.
    // If there's an error we pass it on to express which will display the error
    // on the error page. If we successfully retrieved all the data then we
    // pass the data on to the template. The results object will have the
    // properties {ancestry, children} which are the results of the relative
    // tasks above.
    if(error){
      next(error);
    } else {
      res.render('pedigree', results);
    }
  });
});

module.exports = router;
