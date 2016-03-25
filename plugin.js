'use strict';

const Joi = require('joi');
const AD = require('activedirectory2').promiseWrapper;
const ty = require('then-yield');
let ad;
let config;
let log;

const configSchema = Joi.object().keys({
  ad: Joi.object().keys({
    url: Joi.string().uri({scheme: ['ldap', 'ldaps']}).required(),
    baseDN: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    scope: Joi.string().allow(['base', 'one', 'sub']).default('sub'),
    includeMembership: Joi.array().items(['user', 'group', 'all'])
      .optional(),
    attributes: Joi.object().keys({
      user: Joi.array().items(Joi.string()).optional(),
      group: Joi.array().items(Joi.string()).optional()
    }).optional()
  }).required(),
  attributesMap: Joi.object().keys({
    user: Joi.object().optional(),
    group: Joi.object().optional()
  })
});

function remapAttributes(map, user) {
  const result = {};
  for (let k of Object.keys(user)) {
    if (map.hasOwnProperty(k)) {
      result[map[k]] = user[k];
    } else if (k !== 'groups') {
      result[k] = user[k];
    }
  }
  return result;
}

function remapGroupNames(map, groups) {
  const result = [];
  const _groups = groups.slice(0);
  for (let k of Object.keys(map)) {
    if (_groups.indexOf(k) !== -1) {
      result.push(map[k]);
      _groups.splice(_groups.indexOf(k), 1);
    }
  }
  return result.concat(_groups);
}

function validate(username, password) {
  log.debug('validating user: %s', username);
  return ty.spawn(function* validator() {
    const user = yield ad.findUser({attributes: ['dn']}, username);
    log.debug('user dn: %j', user);
    if (!user) {
      log.error('could not find user: %s', username);
      return false;
    }

    const isValid = yield ad.authenticate(user.dn, password);
    log.debug('credential validation result: %s', isValid);
    return isValid;
  });
}

function userAttributes(user) {
  function* getAttributes() {
    const adUser = yield ad.findUser(
      {
        includeMembership: config.ad.includeMembership
      },
      user
    );
    log.debug('got user: %j', adUser);
    if (!adUser) {
      log.error('could not get attributes for user');
      return {extraAttributes: {}};
    }

    let result = {extraAttributes: {}};
    const updateGroups = () => {
      log.debug('checking for groups');
      if (adUser.hasOwnProperty('groups')) {
        // CAS users 'memberOf' instead of 'groups'
        log.debug('re-assigning groups to memberOf');
        result.memberOf = adUser.groups;
        delete adUser.groups;
      }
      result = Object.assign(result, adUser);
    };


    if (config.hasOwnProperty('attributesMap')) {
      log.debug('processing attributesMap setting');
      // rename attributes as per configuration
      if (config.attributesMap.hasOwnProperty('user')) {
        log.debug('remapping attributes');
        result = Object.assign(
          remapAttributes(config.attributesMap.user, adUser)
        );
      }

      // rename groups as per configuration
      if (config.attributesMap.hasOwnProperty('group') &&
        adUser.hasOwnProperty('groups'))
      {
        log.debug('remapping groups');
        result.memberOf =
          remapGroupNames(config.attributesMap.group, adUser.groups);
      } else {
        updateGroups();
      }
    } else {
      updateGroups();
    }

    log.debug('user attributes: %j', result);
    return {extraAttributes: result};
  }

  return ty.spawn(getAttributes);
}

module.exports.name = 'adauth';
module.exports.plugin = function plugin(conf, context) {
  log = context.logger;
  const joiResult = Joi.validate(conf, configSchema);
  if (joiResult.error) {
    log.error('invalid config: %s', joiResult.error.message);
    return joiResult.error;
  }

  config = joiResult.value;
  ad = new AD(config.ad);
  log.info('adauth loaded');
  return {validate};
};

module.exports.postInit = function postInit(context) {
  return Promise.resolve({
    hooks: {userAttributes}
  });
};

// for unit testing
module.exports.internals = {remapAttributes, remapGroupNames};
