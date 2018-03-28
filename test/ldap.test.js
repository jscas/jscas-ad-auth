'use strict'

const test = require('tap').test
const mockquire = require('mock-require')
const fastify = require('fastify')
const plugin = require('../')

const config = {
  ad: {
    searchUser: 'foo',
    searchUserPass: '123456',
    ldapjs: {
      url: 'ldaps://ldap.example.com',
      searchBase: 'dc=ldap,dc=example,dc=com'
    }
  }
}

test('credential validations', (t) => {
  const adldap = {
    authenticate: async function () {},
    bind: async () => {},
    unbind: async () => {}
  }
  mockquire('adldap', function () {
    return () => adldap
  })

  t.tearDown(() => mockquire.stopAll())

  const server = fastify()
  server
    .decorate('jscasPlugins', {auth: []})
    .decorate('registerAuthenticator', function (obj) {
      this.jscasPlugins.auth.push(obj)
    })
    .register(plugin, config)

  return server.listen(0)
    .then(() => {
      server.server.unref()

      t.test('successful validation', (t) => {
        adldap.authenticate = async function (username, password) {
          t.is(username, 'foo')
          t.is(password, '654321')
          return true
        }
        server.jscasPlugins.auth[0].validate('foo', '654321')
          .then((result) => {
            t.is(result, true)
            t.end()
          })
          .catch(t.threw)
      })

      t.test('returns false for blank password', (t) => {
        adldap.authenticate = async function (username, password) {
          t.fail('should not be invoked')
        }
        server.jscasPlugins.auth[0].validate('foo', '')
          .then((result) => {
            t.is(result, false)
            t.end()
          })
          .catch(t.threw)
      })

      t.test('returns false for null password', (t) => {
        adldap.authenticate = async function (username, password) {
          t.fail('should not be invoked')
        }
        server.jscasPlugins.auth[0].validate('foo', null)
          .then((result) => {
            t.is(result, false)
            t.end()
          })
          .catch(t.threw)
      })

      t.test('returns false for missing user', (t) => {
        adldap.authenticate = async function (username, password) {
          if (username === 'nope') return false
          return true
        }
        server.jscasPlugins.auth[0].validate('nope', '123456')
          .then((result) => {
            t.is(result, false)
            t.end()
          })
          .catch(t.threw)
      })
    })
    .catch(t.threw)
})
