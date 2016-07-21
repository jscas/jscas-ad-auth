'use strict'
/* eslint-env node, mocha */

const path = require('path')
const expect = require('chai').expect
const plugin = require(path.join(__dirname, '..', 'plugin'))
const cntxt = {
  logger: {
    debug: console.debug,
    error: console.error
  }
}

suite('plugin', function () {
  test('rejects if no configuration', function noconfig (done) {
    const result = plugin.plugin(null, cntxt)
    expect(result).to.be.an.instanceof(Error)
    expect(result.message).to.contain('must be an object')
    done()
  })

  test('rejects if missing required config properties', function missing (done) {
    const conf = {
      ad: {
        baseDn: 'foo'
      }
    }
    const result = plugin.plugin(conf, cntxt)
    expect(result).to.be.an.instanceof(Error)
    expect(result.message).to.contain('is required')
    done()
  })

  suite('internals', function () {
    test('remaps attribute names', function remapattrs (done) {
      const input = {
        foo: 'bar',
        baz: 'foo',
        same: 'same',
        groups: []
      }
      const map = {
        foo: 'foobar',
        baz: 'foo'
      }
      const result = plugin.internals.remapAttributes(map, input)

      expect(result).to.be.an.object
      expect(result.foo).to.exist
      expect(result.foo).to.equal('foo')
      expect(result.foobar).to.exist
      expect(result.foobar).to.equal('bar')
      expect(result.same).to.exist
      expect(result.same).to.equal('same')
      expect(result.groups).to.not.exist
      done()
    })

    test('remaps group names', function remapgroups (done) {
      const input = [ 'foo', 'bar', 'baz' ]
      const map = {
        foo: 'foobar',
        bar: 'barfoo'
      }
      const result = plugin.internals.remapGroupNames(map, input)

      expect(result).to.be.an.array
      expect(result).to.contain('foobar')
      expect(result).to.contain('barfoo')
      expect(result).to.contain('baz')
      expect(result).to.not.contain('foo')
      expect(result).to.not.contain('bar')
      done()
    })
  })
})
