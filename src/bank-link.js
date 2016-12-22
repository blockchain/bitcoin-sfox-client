var assert = require('assert');

class BankLink {
  constructor (api) {
    this._api = api;
  }

  get api () { return this._api; }

  getAccounts (token) {
    const filterAccounts = (bankAccounts) => {
      return bankAccounts.filter((a) => ['checking', 'savings'].indexOf(a.subtype) > -1)
    };

    const getAccounts = (token) => {
      return this.api.authPOST('user/bankEnumerate', {
        public_token: token
      }, 'v1');
    };

    return getAccounts(token).then(filterAccounts);
  }

  setAccount (obj) {
    return this.api.authPOST('user/bankToken', {
      name: ' ',
      firstname: obj.firstName,
      lastname: obj.lastName,
      public_token: obj.token,
      _id: obj.id
    }, 'v1');
  }
}

module.exports = BankLink;
