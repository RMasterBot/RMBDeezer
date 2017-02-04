/**
 * User Model
 * @class User
 * @param {User~Json} User json of the User
 * @constructor
 */
function User(User) {
  this.user = User;
}

/**
 * @return {User~Json|*}
 */
User.prototype.getJson = function() {
  return this.user;
};

User.prototype.getName = function () {
  return this.user.name;
};

User.prototype.getLastName = function () {
  return this.user.lastname;
};

User.prototype.getFirstName = function () {
  return this.user.firstname;
};

User.prototype.getEmail = function () {
  return this.user.email;
};

module.exports = User;

/**
 * User Json
 * @typedef {Object} User~Json
 * @property {string} id
 */