'use strict'
/* eslint-env node, mocha */

const path = require('path')
const expect = require('chai').expect

const config = require(path.join(__dirname, '..', 'testconfig'))
const adauth = require(path.join(__dirname, '..', 'plugin'))

function noop () {}
const logger = {
  trace: noop,
  debug: noop,
  error: noop,
  info: noop
}
logger.child = () => logger
const plugin = adauth.plugin(config.plugin, {logger})

suite('integration', function () {
  test('validate credentials', function find (done) {
    plugin.validate(config.user.username, config.user.password)
      .then((result) => {
        expect(result).to.be.true
        done()
      })
      .catch(done)
  })

  test('missing user', function missing (done) {
    plugin.validate('nope', '123456')
      .then((result) => {
        expect(result).to.be.false
        done()
      })
      .catch(done)
  })

  test('invalid username', function invalidUsername (done) {
    plugin.validate(config.user.junkname, config.user.password)
      .then((result) => {
        expect(result).to.be.false
        done()
      })
      .catch(done)
  })

  test('get attributes', function attrs (done) {
    adauth.postInit()
      .then((res) => {
        res.hooks.userAttributes(config.user.username)
          .then((res) => {
            expect(res).to.be.an.object
            expect(res.extraAttributes).to.exist

            const attrs = res.extraAttributes
            expect(attrs.dn).to.contain(config.user.username)
            expect(attrs.memberOf).to.exist
            expect(attrs.memberOf).to.be.an.array
            expect(attrs.memberOf.length).to.be.gt(0)

            done()
          })
          .catch(done)
      })
      .catch(done)
  })
})
