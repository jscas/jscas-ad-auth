# jscas-ad-auth

This module is an authentication plugin for [JSCAS server][cs]. It provides a
means to authenticate users against an Active Directory instance.

[cs]: https://github.com/jscas/jscas-server/

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
      scope: 'base' // 'base', 'one', 'sub' default: 'sub'
      }
    }
  },
  allowEmptyPass: false, // ldap returns "true" by default if a password is empty
}
```

### ad

The `ad` property defines the configuration that will be passed to the
underlying [adldap module][admod]. This configuration is supplied
to the `adldap` module as-is.

[admod]: https://www.npmjs.com/package/adldap

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

#### allowEmptyPass

The LDAP protocol allows empty passwords by default. In the case of empty
password it will return a "success" response for the `bind` operation. In almost
all cases, you **do not** want this to happen. But there may be a rare case
that you do, so this is left as an option.

## License

[MIT License](http://jsumners.mit-license.org/)
