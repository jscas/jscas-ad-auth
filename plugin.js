'use strict'

const Promise = require('bluebird')
require('bluebird-co')

const Joi = require('joi')
let AD
let config
let log = require('abstract-logging')

const configSchema = Joi.object().keys({
  allowEmptyPass: Joi.boolean().default(false),
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
  log.trace('remapping attributes: %j', user)
  const result = {}
  for (let k of Object.keys(user)) {
    if (map.hasOwnProperty(k)) {
      result[map[k]] = user[k]
    } else if (k !== 'groups') {
      result[k] = user[k]
    }
  }
  log.trace('remapped attributes: %j', result)
  return result
}

function remapGroupNames (map, groups) {
  log.trace('remapping groups: %j', groups)
  const result = []
  const _groups = (Array.isArray(groups)) ? groups.slice(0) : [groups]
  for (let k of Object.keys(map)) {
    if (_groups.indexOf(k) !== -1) {
      result.push(map[k])
      _groups.splice(_groups.indexOf(k), 1)
    }
  }
  log.trace('remapped groups: %j', _groups)
  return result.concat(_groups)
}

function validate (username, password) {
  log.trace('validating user: %s', username)
  return Promise.coroutine(function * validator () {
    if (config.allowEmptyPass === false) {
      if (password === null || password === undefined) return false
      if (password.length === 0) return false
    }
    try {
      const ad = new AD(config.ad)
      yield ad.bind()
      const isValid = yield ad.authenticate(username, password)
      log.trace('credentials validation result: %s', isValid)
      yield ad.unbind()
      return isValid
    } catch (e) {
      log.error('could not validate credentials: %s', e.message)
      log.debug(e.stack)
      throw e
    }
  })()
}

function * findUserGenerator (username) {
  log.trace('finding user: %s', username)
  const ad = new AD(config.ad)
  yield ad.bind()
  const adUser = yield ad.findUser(username)
  yield ad.unbind()
  log.trace('find user result: %j', adUser)
  return adUser
}
const findUser = Promise.coroutine(findUserGenerator)

function processAttributes (user) {
  const result = {extraAttributes: {}, standardAttributes: {}}
  const _user = Object.assign({}, user)
  let memberOf = _user.memberOf || []
  _user.memberOf = undefined
  if (Array.isArray(memberOf) === false) memberOf = [memberOf]
  result.standardAttributes.memberOf = memberOf

  if (!config.hasOwnProperty('attributesMap')) {
    log.trace('no attributesMap supplied, returning AD object as extra attributes')
    result.extraAttributes = _user
  } else {
    log.trace('attributesMap supplied, processing AD object')

    if (config.attributesMap.hasOwnProperty('user')) {
      log.trace('processing user attributes mappings')
      result.extraAttributes = remapAttributes(config.attributesMap.user, _user)
    } else {
      result.extraAttributes = Object.assign({}, _user)
    }

    if (config.attributesMap.hasOwnProperty('group') && _user.hasOwnProperty('memberOf')) {
      log.trace('processing group attributes mappings')
      result.standardAttributes.memberOf = remapGroupNames(
        config.attributesMap.group,
        result.standardAttributes.memberOf
      )
    }
  }

  log.trace('processed user attributes: %j', result)
  return result
}

function userAttributes (user) {
  function * doWork () {
    const adUser = yield findUser(user)
    if (!adUser) {
      log.trace('could not get attributes for user: %s', user)
      return {extraAttributes: {}, standardAttributes: {}}
    }
    return processAttributes(adUser)
  }
  return Promise.coroutine(doWork)()
}

module.exports.name = 'adauth'
module.exports.plugin = function plugin (conf, context) {
  log = context.logger || log
  if (!log.child) log.child = () => log
  log.child({module: 'jscas-ad-auth'})

  AD = require('adldap')(log)
  const joiResult = Joi.validate(conf, configSchema)
  if (joiResult.error) {
    log.error('invalid config: %s', joiResult.error.message)
    return Promise.reject(joiResult.error)
  }

  config = joiResult.value
  log.info('adauth loaded')
  return Promise.resolve({validate})
}

module.exports.postInit = function postInit (context) {
  return Promise.resolve({
    hooks: {userAttributes}
  })
}

// for unit testing
module.exports.internals = {remapAttributes, remapGroupNames, processAttributes}
