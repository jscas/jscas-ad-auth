'use strict'

const test = require('tap').test
const plugin = require('../')

const nullConfig = {
  ad: {
    searchUser: 'foo',
    searchUserPass: 'bar'
  }
}

test('builds an attributes object that conforms to the spec', (t) => {
  t.plan(9)
  const input = {
    sAMAccountName: 'username',
    memberOf: ['foo', 'bar']
  }
  plugin.plugin(nullConfig, {})
    .then(() => {
      const result = plugin.internals.processAttributes(input)

      t.type(result, Object)
      t.is(result.hasOwnProperty('standardAttributes'), true)
      t.is(result.standardAttributes.hasOwnProperty('memberOf'), true)
      t.type(result.standardAttributes.memberOf, Array)
      t.is(result.standardAttributes.memberOf.includes('foo'), true)
      t.is(result.standardAttributes.memberOf.includes('bar'), true)
      t.is(result.hasOwnProperty('extraAttributes'), true)
      t.is(result.extraAttributes.hasOwnProperty('sAMAccountName'), true)
      t.is(result.extraAttributes.sAMAccountName, 'username')
    })
    .catch((err) => t.threw(err))
})

test('remaps attribute names', (t) => {
  t.plan(4)
  const input = {
    sAMAccountName: 'username',
    same: 'same'
  }
  const config = {
    attributesMap: {
      user: {
        sAMAccountName: 'username'
      }
    }
  }

  plugin.plugin(Object.assign({}, nullConfig, config), {})
    .then(() => {
      const result = plugin.internals.processAttributes(input)
      t.is(result.extraAttributes.hasOwnProperty('username'), true)
      t.is(result.extraAttributes.hasOwnProperty('same'), true)
      t.is(result.extraAttributes.username, 'username')
      t.is(result.extraAttributes.same, 'same')
    })
    .catch((err) => t.threw(err))
})

test('remaps group names', (t) => {
  t.plan(7)
  const input = {
    same: 'same',
    memberOf: ['foo', 'bar']
  }
  const config = {
    attributesMap: {
      group: {
        foo: 'foobar',
        bar: 'baz'
      }
    }
  }

  plugin.plugin(Object.assign({}, nullConfig, config), {})
    .then(() => {
      const result = plugin.internals.processAttributes(input)
      t.is(result.extraAttributes.hasOwnProperty('same'), true)
      t.is(result.extraAttributes.same, 'same')
      t.is(result.standardAttributes.hasOwnProperty('memberOf'), true)
      t.is(result.standardAttributes.memberOf.includes('foobar'), true)
      t.is(result.standardAttributes.memberOf.includes('baz'), true)
      t.is(result.standardAttributes.memberOf.includes('foo'), false)
      t.is(result.standardAttributes.memberOf.includes('bar'), false)
    })
    .catch((err) => t.threw(err))
})

test('remaps attribute names and group names', (t) => {
  t.plan(9)
  const input = {
    sAMAccountName: 'username',
    same: 'same',
    memberOf: ['foo', 'bar']
  }
  const config = {
    attributesMap: {
      user: {
        sAMAccountName: 'username'
      },
      group: {
        foo: 'foobar',
        bar: 'baz'
      }
    }
  }

  plugin.plugin(Object.assign({}, nullConfig, config), {})
    .then(() => {
      const result = plugin.internals.processAttributes(input)
      t.is(result.extraAttributes.hasOwnProperty('same'), true)
      t.is(result.extraAttributes.same, 'same')
      t.is(result.extraAttributes.hasOwnProperty('username'), true)
      t.is(result.extraAttributes.username, 'username')
      t.is(result.standardAttributes.hasOwnProperty('memberOf'), true)
      t.is(result.standardAttributes.memberOf.includes('foobar'), true)
      t.is(result.standardAttributes.memberOf.includes('baz'), true)
      t.is(result.standardAttributes.memberOf.includes('foo'), false)
      t.is(result.standardAttributes.memberOf.includes('bar'), false)
    })
    .catch((err) => t.threw(err))
})

test('processes "groups" that are a string (i.e. a single group membership)', (t) => {
  t.plan(3)
  const input = {
    memberOf: 'foo'
  }

  plugin.plugin(nullConfig, {})
    .then(() => {
      const result = plugin.internals.processAttributes(input)
      t.type(result.standardAttributes.memberOf, Array)
      t.is(result.standardAttributes.memberOf.length, 1)
      t.is(result.standardAttributes.memberOf.includes('foo'), true)
    })
    .catch((err) => t.threw(err))
})

test('processes "groups" that are a string and remaps them', (t) => {
  t.plan(4)
  const input = {
    memberOf: 'foo'
  }
  const config = {
    attributesMap: {
      group: {
        foo: 'foobar'
      }
    }
  }

  plugin.plugin(Object.assign({}, nullConfig, config), {})
    .then(() => {
      const result = plugin.internals.processAttributes(input)
      t.type(result.standardAttributes.memberOf, Array)
      t.is(result.standardAttributes.memberOf.length, 1)
      t.is(result.standardAttributes.memberOf.includes('foo'), false)
      t.is(result.standardAttributes.memberOf.includes('foobar'), true)
    })
    .catch((err) => t.threw(err))
})
