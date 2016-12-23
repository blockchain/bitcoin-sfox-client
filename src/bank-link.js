var assert = require('assert');

class BankLink {
  constructor (api) {
    this._api = api;
  }

  getAccounts (token) {
    assert(token, 'Public token required');
    const filterAccounts = (bankAccounts) => {
      return bankAccounts.filter((a) => ['checking', 'savings'].indexOf(a.subtype) > -1);
    };

    const getAccounts = (token) => {
      return this._api.authPOST('account/bankEnumerate', {
        public_token: token
      });
    };

    return getAccounts(token).then(filterAccounts);
  }

  setAccount (obj) {
    return this._api.authPOST('account/bankToken', {
      name: ' ',
      firstname: obj.firstName,
      lastname: obj.lastName,
      public_token: obj.token,
      _id: obj.id
    });
  }
}

module.exports = BankLink;
