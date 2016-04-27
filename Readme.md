# jscas-ad-auth

This module is an authentication plugin for [cas-server][cs]. It provides a
means to authenticate users against an Active Directory instance.

[cs]: https://github.com/jscas/cas-server/

## Configuration

The module requires a configuration object matching:

```javascript
{
  ad: { // required
    searchUser: 'cn=jsmith,ou=users,dc=example,dc=com', // required
    searchPass: 'jsmith_password', // required
    ldapjs: {
      url: '(ldap|ldaps)://active.directory.server', // required
      searchBase: 'dc=example,dc=com', // required
      scope: 'base', // 'base', 'one', 'sub' default: 'sub'
      attributes: [ 'dn', 'cn', 'sn', 'givenName', 'mail', 'memberOf' ] // optional
      }
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

#### ad.searchUser

The username the AD module will use to bind to the server for search operations.

#### ad.searchUserPass

The password for `ad.searchUser`.

#### ad.ldapjs.url

An LDAP URL pointing to your Active Directory server. This property is
required.

#### ad.ldapjs.searchBase

The DN under which all search queries will be performed. This includes
authentications.

#### ad.ldapjs.scope

The search method to use. This module's default is `'sub'`.

#### ad.ldapjs.attributes

An array of attributes to include in search results. These will
be used by *cas-server* as extra attributes during CAS 3.0 authentication. The
default attribute set is:

```javascript
[ 'dn', 'cn', 'sn', 'givenName', 'mail', 'memberOf' ]
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
