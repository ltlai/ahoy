/**
 * SecretController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
  create: function(req, res) {
    // Replace all non-alphanumeric characters with '+' to form query string
    var location = req.body['location'].replace(/\W+/g, '+');
    var params = location + "&key=#{sails.config.geo_api_key}";
    var GEOCODING_DOMAIN = 'maps.googleapis.com'
    var https = require('https')

    var options = {
      hostname: GEOCODING_DOMAIN, // Needs to be bare domain name
      path: '/maps/api/geocode/json?address=' + params,
      port: 443 // The API requires https, so that's port 443
    };

    var geoData = '';

    https.get(options, function(response) {
      sails.log('response ' + response.statusCode);
      response.on('error', function(e) { res.send(e.message) });
      response.on('data', function(chunk) { geoData += chunk });
      response.on('end', function() {
        var coordinates = JSON.parse(geoData).results[0].geometry.location;
        createSecret(coordinates);
      });
    });

    function createSecret(coordinates) {
      Secret.create({
        text: req.body['text'],
        location: coordinates,
      }).done(function(err, secret) {
        if (err) {
          res.send(err);
        }
        else {
          res.redirect('/secret/' + secret.id); // is there a better way to do this?
        }
      });
    }
  },



  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to SecretController)
   */
  _config: {}

  
};
