module.exports = {
  user: { // to query for
    username: 'some_user',
    junkname: 'some_user_with_junk_appended',
    password: 'super_secret'
  },
  plugin: {
    ad: {
      searchUser: 'CN=Directory Reader,cn=Users,DC=example,DC=com',
      searchUserPass: 'really_super_secret',
      ldapjs: {
        url: 'ldap://ldap.example.com',
        searchBase: 'dc=example,dc=com',
        scope: 'sub',
        attributes: ['dn', 'givenName', 'sn', 'sAMAccountName', 'mail', 'memberOf']
      }
    },
    attributesMap: {
      user: {
        givenName: 'firstName',
        sn: 'lastName'
      }
    }
  }
}
