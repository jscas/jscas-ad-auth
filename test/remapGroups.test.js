'use strict'

const test = require('tap').test
const plugin = require('../')

test('remaps group names according to supplied map', (t) => {
  t.plan(6)
  const input = [ 'foo', 'bar', 'baz' ]
  const map = {
    foo: 'foobar',
    bar: 'barfoo'
  }
  const result = plugin.internals.remapGroupNames(map, input)

  t.type(result, Array)
  t.is(result.includes('foobar'), true)
  t.is(result.includes('barfoo'), true)
  t.is(result.includes('baz'), true)
  t.is(result.includes('foo'), false)
  t.is(result.includes('bar'), false)
})

test('remaps groups if member of only one group', (t) => {
  t.plan(2)
  const input = 'foo'
  const map = { foo: 'foobar' }
  const result = plugin.internals.remapGroupNames(map, input)

  t.type(result, Array)
  t.is(result.includes('foobar'), true)
})
