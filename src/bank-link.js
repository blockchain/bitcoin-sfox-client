var assert = require('assert');

class BankLink {
  constructor (api) {
    this._api = api;
  }

  getAccounts (token) {
    assert(token, 'Public token required');
    const filterAccounts = (bankAccounts) => {
      return bankAccounts.accounts.filter((a) => ['checking', 'savings'].indexOf(a.subtype) > -1);
    };

    const getAccounts = (token) => {
      return this._api.authPOST('payment-methods/plaid/list', {
        public_token: token
      });
    };

    return getAccounts(token).then(filterAccounts);
  }

  setAccount (obj) {
    return this._api.authPOST('payment-methods/plaid/link', {
      public_token: obj.token,
      firstname: obj.firstname,
      lastname: obj.lastname,
      _id: obj.id
    });
  }
}

module.exports = BankLink;
