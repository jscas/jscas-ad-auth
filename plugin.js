'use strict'

const Promise = require('bluebird')
require('bluebird-co')

const Joi = require('joi')
let AD
let ad
let config
let log

const configSchema = Joi.object().keys({
  ad: Joi.object().keys({
    searchUser: Joi.string().required(),
    searchUserPass: Joi.string().required(),
    ldapjs: Joi.object().keys({
      url: Joi.string().uri({scheme: ['ldap', 'ldaps']}).required(),
      scope: Joi.string().allow(['base', 'one', 'sub']).default('sub'),
      searchBase: Joi.string(),
      attributes: Joi.array().optional()
    })
  }).required(),
  attributesMap: Joi.object().keys({
    user: Joi.object().optional(),
    group: Joi.object().optional()
  })
})

function remapAttributes (map, user) {
  const result = {}
  for (let k of Object.keys(user)) {
    if (map.hasOwnProperty(k)) {
      result[map[k]] = user[k]
    } else if (k !== 'groups') {
      result[k] = user[k]
    }
  }
  return result
}

function remapGroupNames (map, groups) {
  const result = []
  const _groups = groups.slice(0)
  for (let k of Object.keys(map)) {
    if (_groups.indexOf(k) !== -1) {
      result.push(map[k])
      _groups.splice(_groups.indexOf(k), 1)
    }
  }
  return result.concat(_groups)
}

function validate (username, password) {
  log.trace('validating user: %s', username)
  return Promise.coroutine(function * validator () {
    ad = new AD(config.ad)
    yield ad.bind()
    const isValid = yield ad.authenticate(username, password)
    log.trace('credential validation result: %s', isValid)
    yield ad.unbind()
    return isValid
  })()
}

function userAttributes (user) {
  function * getAttributes () {
    ad = new AD(config.ad)
    yield ad.bind()
    const adUser = yield ad.findUser(user)
    yield ad.unbind()
    log.trace('got user: %j', adUser)
    if (!adUser) {
      log.error('could not get attributes for user')
      return {extraAttributes: {}}
    }

    let result = {extraAttributes: {}}
    if (config.hasOwnProperty('attributesMap')) {
      log.trace('processing attributesMap setting')
      // rename attributes as per configuration
      if (config.attributesMap.hasOwnProperty('user')) {
        log.trace('remapping attributes')
        result = Object.assign(
          remapAttributes(config.attributesMap.user, adUser)
        )
      }

      // rename groups as per configuration
      if (config.attributesMap.hasOwnProperty('group') && adUser.hasOwnProperty('memberOf')) {
        log.trace('remapping groups')
        result.memberOf =
          remapGroupNames(config.attributesMap.group, adUser.memberOf)
      }
    }

    log.trace('user attributes: %j', result)
    return {extraAttributes: result}
  }

  return Promise.coroutine(getAttributes)()
}

module.exports.name = 'adauth'
module.exports.plugin = function plugin (conf, context) {
  log = context.logger
  AD = require('adldap')(log)
  const joiResult = Joi.validate(conf, configSchema)
  if (joiResult.error) {
    log.error('invalid config: %s', joiResult.error.message)
    return joiResult.error
  }

  config = joiResult.value
  log.info('adauth loaded')
  return {validate}
}

module.exports.postInit = function postInit (context) {
  return Promise.resolve({
    hooks: {userAttributes}
  })
}

// for unit testing
module.exports.internals = {remapAttributes, remapGroupNames}
