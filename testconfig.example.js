module.exports = {
  user: { // to query for
    username: 'some_user',
    password: 'super_secret'
  },
  plugin: {
    ad: {
      url: 'ldap://ldap.example.com',
      baseDN: 'dc=example,dc=com',
      username: 'CN=Directory Reader,cn=Users,DC=example,DC=com',
      password: 'reall_super_secret',
      scope: 'sub',
      includeMembership: ['all'],
      attributes: {
        user: ['dn', 'givenName', 'sn', 'sAMAccountName', 'mail']
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
