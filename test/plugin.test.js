'use strict'

const test = require('tap').test
const plugin = require('../')

test('constructor rejects if no configuration', (t) => {
  t.plan(2)
  plugin.plugin(null, {})
    .then(() => t.fail('should not happen'))
    .catch((err) => {
      t.type(err, Error)
      t.notEqual(err.message.match(/must be an object/), null)
    })
})

test('constructor rejects if missing required properties', (t) => {
  t.plan(2)
  const conf = {
    ad: {
      baseDn: 'foo'
    }
  }

  plugin.plugin(conf, {})
    .then(() => t.fail('should not happen'))
    .catch((err) => {
      t.type(err, Error)
      t.notEqual(err.message.match(/is required/), null)
    })
})
