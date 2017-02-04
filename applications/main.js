var Bot = require(require('path').join('..','..','core','bot.js'));

/**
 * Deezer Bot
 * @class Deezer
 * @augments Bot
 * @param {string} name
 * @param {string} folder
 * @param {Deezer~Configuration[]} allConfigurations
 * @constructor
 */
function Deezer(name, folder, allConfigurations){
  Bot.call(this, name, folder, allConfigurations);

  this.defaultValues.hostname = 'api.deezer.com';
  
  this.defaultValues.httpModule = 'https';
  this.defaultValues.port = 443;
  this.defaultValues.scopes = 'basic_access,email,offline_access,manage_library,manage_community,delete_library,listening_history';
  
  this.defaultValues.defaultRemainingRequest = 50;
  this.defaultValues.defaultRemainingTime = 5;
}

Deezer.prototype = new Bot();
Deezer.prototype.constructor = Deezer;

/**
 * Prepare and complete parameters for request
 * @param {Bot~doRequestParameters} parameters
 * @param {Bot~requestCallback|*} callback
 */
Deezer.prototype.prepareRequest = function(parameters, callback) {
  this.addQueryAccessToken(parameters);

  this.doRequest(parameters, callback);
};

/**
 * API user/me
 * @param {Deezer~requestCallback} callback
 */
Deezer.prototype.me = function(callback) {
  var params = {
    method: 'GET',
    path: 'user/me',
    output: {
      model: 'User'
    }
  };

  this.prepareRequest(params, callback);
};


/**
 * Add access token to query parameters
 * @param {Bot~doRequestParameters} parameters
 */
Deezer.prototype.addQueryAccessToken = function(parameters) {
  if(parameters.get === undefined) {
    parameters.get = {};
  }

  parameters.get.access_token = this.accessToken.access_token;
};

/**
 * Get remaining requests from result 
 * @param {Request~Response} resultFromRequest
 * @return {Number}
 */
Deezer.prototype.getRemainingRequestsFromResult = function(resultFromRequest) {
  //todo do the rate limit by myself, servers don't send it
  return this.defaultValues.defaultRemainingRequest - 1;
};

/**
 * Get url for Access Token when you have to authorize an application
 * @param {string} scopes
 * @param {*} callback
 */
Deezer.prototype.getAccessTokenUrl = function(scopes, callback) {
  var url = 'https://connect.deezer.com/oauth/auth.php?'
    + 'app_id=' + this.currentConfiguration.app_id + '&'
    + 'redirect_uri=' + this.currentConfiguration.redirect_uri + '&'
    + 'perms=' + this.getScopeForAccessTokenServer(scopes);

  callback(url);
};

/**
 * Extract response in data for Access Token
 * @param {Object} req request from local node server
 * @return {*} code or something from response
 */
Deezer.prototype.extractResponseDataForAccessToken = function(req) {
  var query = require('url').parse(req.url, true).query;

  if(query.code === undefined) {
    return null;
  }

  return query.code;
};

/**
 * Request Access Token after getting code
 * @param {string} responseData
 * @param {Bot~requestAccessTokenCallback} callback
 */
Deezer.prototype.requestAccessToken = function(responseData, callback) {
  var params = {
    hostname: 'connect.deezer.com',
    method: 'GET',
    path: '/oauth/access_token.php',
    get : {
      app_id: this.currentConfiguration.app_id,
      secret: this.currentConfiguration.app_secret,
      code: responseData,
      output: 'json'
    }
  };

  this.request(params, function(error, result){
    if(error) {
      callback(error, null);
      return;
    }

    if(result.statusCode === 200) {
      callback(null, JSON.parse(result.data));
    }
    else {
      callback(JSON.parse(result.data), null);
    }
  });
};

/**
 * getAccessTokenFromAccessTokenData
 * @param {*} accessTokenData
 * @return {*}
 */
Deezer.prototype.getAccessTokenFromAccessTokenData = function(accessTokenData) {
  return accessTokenData.access_token;
};

/**
 * getTypeAccessTokenFromAccessTokenData
 * @param {*} accessTokenData
 * @return {*}
 */
Deezer.prototype.getTypeAccessTokenFromAccessTokenData = function(accessTokenData) {
  return '';
};

/**
 * getUserForNewAccessToken
 * @param {*} formatAccessToken
 * @param {Bot~getUserForNewAccessTokenCallback} callback
 */
Deezer.prototype.getUserForNewAccessToken = function(formatAccessToken, callback) {
  var that = this;

  that.setCurrentAccessToken(formatAccessToken.access_token);
  that.verifyAccessTokenScopesBeforeCall = false;
  this.me(function(err, user){
    that.verifyAccessTokenScopesBeforeCall = true;
    if(err) {
      callback(err, null);
    }
    else {
      var username = (user !== null) ? user.getName() : null;
      callback(null, username);
    }
  });
};

Deezer.prototype.extractDataFromRequest = function(data) {
  return data;
};

module.exports = Deezer;

/**
 * Deezer Configuration
 * @typedef {Object} Deezer~Configuration
 * @property {string} name
 * @property {string} consumer_key
 * @property {string} consumer_secret
 * @property {string} access_token
 * @property {string} callback_url
 * @property {string} scopes
 */
/**
 * Request callback
 * @callback Deezer~requestCallback
 * @param {Error|string|null} error - Error
 * @param {*} data
 */
