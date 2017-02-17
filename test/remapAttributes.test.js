'use strict'

const test = require('tap').test
const plugin = require('../')

test('remaps attributes according to supplied map', (t) => {
  t.plan(8)
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

  t.type(result, Object)
  t.is(result.hasOwnProperty('foo'), true)
  t.is(result.foo, 'foo')
  t.is(result.hasOwnProperty('foobar'), true)
  t.is(result.foobar, 'bar')
  t.is(result.hasOwnProperty('same'), true)
  t.is(result.same, 'same')
  t.is(result.hasOwnProperty('groups'), false)
})
