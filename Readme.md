# jscas-ad-auth

This module is an authentication plugin for [cas-server][cs]. It provides a
means to authenticate users against an Active Directory instance.

[cs]: https://github.com/jscas/cas-server/

## Configuration

The module requires a configuration object matching:

```javascript
{
  ad: { // required
    url: '(ldap|ldaps)://active.directory.server', // required
    baseDN: 'dc=example,dc=com', // required
    username: 'cn=jsmith,ou=users,dc=example,dc=com', // required
    password: 'jsmith_password', // required
    scope: 'base', // 'base', 'one', 'sub' default: 'sub'
    includeMembership: ['user', 'group', 'all'], // optional, default: not set
    attributes: { // optional
      user: [], // optional
      group: [] // optional
    }
  },
  attributesMap: { // optional
    user: {}, // optional
    group: {} // optional
  }
}
```

### ad

The `ad` property defines the configuration that will be passed to the
underlying [Active Directory module][admod]. This configuration is supplied
to the AD module as-is.

[admod]: https://www.npmjs.com/package/activedirectory

#### ad.url

An LDAP URL pointing to your Active Directory server. This property is
required.

#### ad.baseDN

The DN under which all search queries will be performed. This includes
authentications.

#### ad.username

The username the AD module will use to bind to the server for search operations.

#### ad.password

The password for `ad.username`.

#### ad.scope

The search method to use. This module's default is `'sub'`.

#### ad.includeMembership

Enables returning groups in user searches. Without this option set you will
not get a `memberOf` property back. A sensible default is `['group']`.

#### ad.attributes.user

An array of attributes to include in search results for a user. These will
be used by *cas-server* as extra attributes during CAS 3.0 authentication. The
default attribute set is:

```javascript
[
  userPrincipalName, sAMAccountName, mail, lockoutTime, whenCreated, pwdLastSet,
  userAccountControl, employeeID, sn, givenName, initials, cn, displayName,
  comment, description
]
```

#### ad.attributes.group

An array of group names (the AD "memberOf" attribute) to return in search
results for a user. These will be used by *cas-server* as the `memberOf`
extra attribute during CAS 3.0 authentication. The default group set is:

```javascript
[
  distinguishedName, objectCategory, cn, description
]
```

#### attributesMap.user

Allows you to rename the attributes returned in user searches. It should be
an object where keys are the AD names and values are the new names. For example:

```javascript
{
  sAMAccountName: 'firstName'
}
```

will rename the `sAMAccountName` property to `firstName` and leave all other
property names alone.

#### attributesMap.group

Same as `attributesMap.user` but for group names.

## License

[MIT License](http://jsumners.mit-license.org/)
