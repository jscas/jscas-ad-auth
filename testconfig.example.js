module.exports = {
  user: { // to query for
    username: 'some_user',
    password: 'super_secret'
  },
  plugin: {
    ad: {
      searchUser: 'CN=Directory Reader,cn=Users,DC=example,DC=com',
      searchUserPassword: 'reall_super_secret',
      ldapjs: {
        url: 'ldap://ldap.example.com',
        searchBase: 'dc=example,dc=com',
        scope: 'sub',
        attributes: ['dn', 'givenName', 'sn', 'sAMAccountName', 'mail']
      }
    },
    attributesMap: {
      user: {
        givenName: 'firstName',
        sn: 'lastName'
      }
    }
  }
};
