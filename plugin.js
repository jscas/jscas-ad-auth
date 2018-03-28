'use strict'

const fp = require('fastify-plugin')
const conflate = require('conflate')

const defaultConfig = {
  allowEmptyPass: false,
  ad: {
    searchUser: undefined,
    searchUserPass: undefined,
    ldapjs: {
      url: undefined,
      scope: 'sub',
      searchBase: undefined
    }
  }
}

function isObject (obj) {
  return Object.prototype.toString.apply(obj) === '[object Object]'
}

function validateConfig (config) {
  if (!config.hasOwnProperty('ad') || !isObject(config.ad)) {
    throw Error('missing adldap config object')
  }
  if (!config.ad.ldapjs || !isObject(config.ad.ldapjs)) {
    throw Error('missing ldapjs config object')
  }
  if (!config.ad.searchUser || !config.ad.searchUserPass) {
    throw Error('missing search user credentials')
  }
  if (!config.ad.ldapjs.url) {
    throw Error('missing ldapjs url')
  }
  if (!config.ad.ldapjs.searchBase) {
    throw Error('missing ldapjs search base')
  }
}

module.exports = fp(function adldapPlugin (server, options, next) {
  const log = server.log
  let config
  try {
    if (!options || !isObject(options)) throw Error('missing configuration object')
    validateConfig(options)
    config = conflate({}, defaultConfig, options)
  } catch (e) {
    log.error('jscas-ad-auth: invalid configuration: %s', e.message)
    log.debug(e.stack)
    return next(e)
  }

  const adldapFactory = require('adldap')(log)
  const authenticator = {
    validate: async function (username, password) {
      if (config.allowEmptyPass === false) {
        if (password === null || password === undefined) return false
        if (password.length === 0) return false
      }
      try {
        const ad = adldapFactory(config.ad)
        await ad.bind()
        const isValid = await ad.authenticate(username, password)
        log.trace('credentials validation result: %s', isValid)
        await ad.unbind()
        return isValid
      } catch (e) {
        log.error('could not validate credentials: %s', e.message)
        log.debug(e.stack)
        throw e
      }
    }
  }
  server.registerAuthenticator(authenticator)

  next()
})

module.exports.pluginName = 'adauth'
