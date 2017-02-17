'use strict'

const path = require('path')
const test = require('tap').test

const config = require(path.join(__dirname, '..', 'testconfig'))
const adauth = require(path.join(__dirname, '..', 'plugin'))

test('validates credentials', (t) => {
  t.plan(1)
  adauth.plugin(config.plugin, {})
    .then((plugin) => {
      plugin.validate(config.user.username, config.user.password)
        .then((result) => {
          t.is(result, true)
        })
        .catch((err) => t.threw(err))
    })
  .catch((err) => t.threw(err))
})

test('returns false for blank password', (t) => {
  t.plan(1)
  adauth.plugin(config.plugin, {})
    .then((plugin) => {
      plugin.validate(config.user.username, '')
        .then((result) => {
          t.is(result, false)
        })
        .catch((err) => t.threw(err))
    })
    .catch((err) => t.threw(err))
})

test('returns false for null password', (t) => {
  t.plan(1)
  adauth.plugin(config.plugin, {})
    .then((plugin) => {
      plugin.validate(config.user.username, null)
        .then((result) => {
          t.is(result, false)
        })
        .catch((err) => t.threw(err))
    })
    .catch((err) => t.threw(err))
})

test('returns false for missing user', (t) => {
  t.plan(1)
  adauth.plugin(config.plugin, {})
    .then((plugin) => {
      plugin.validate('nope', '123456')
        .then((result) => {
          t.is(result, false)
        })
        .catch((err) => t.threw(err))
    })
    .catch((err) => t.threw(err))
})

test('returns false for invalid username', (t) => {
  t.plan(1)
  adauth.plugin(config.plugin, {})
    .then((plugin) => {
      plugin.validate(config.user.junkname, config.user.password)
        .then((result) => {
          t.is(result, false)
        })
        .catch((err) => t.threw(err))
    })
    .catch((err) => t.threw(err))
})

test('gets attributes for a user', (t) => {
  t.plan(7)
  adauth.plugin(config.plugin, {})
    .then(() => {
      adauth.postInit()
        .then((res) => {
          res.hooks.userAttributes(config.user.username)
            .then((res) => {
              t.type(res, Object)
              t.is(res.hasOwnProperty('extraAttributes'), true)
              t.is(res.extraAttributes.hasOwnProperty('dn'), true)
              t.is(res.extraAttributes.dn.indexOf(config.user.username) > -1, true)
              t.is(res.standardAttributes.hasOwnProperty('memberOf'), true)
              t.type(res.standardAttributes.memberOf, Array)
              t.is(res.standardAttributes.memberOf.length > 0, true)
            })
            .catch((err) => t.threw(err))
        })
        .catch((err) => t.threw(err))
    })
    .catch((err) => t.threw(err))
})
