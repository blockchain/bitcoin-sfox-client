var assert = require('assert');

class BankLink {
  constructor (api) {
    this._api = api;
  }

  get api () { return this._api; }

  get accounts () { return this._accounts; }

  getAccounts (token) {
    return this.api.authPOST('user/bankEnumerate', {
      public_token: token
    }, 'v1', 'api', null);
  }

  setAccount (obj) {
    console.log(obj);
    return this.api.authPOST('user/bankToken', {
      firstname: obj.firstName,
      lastname: obj.lastName,
      public_token: obj.token,
      _id: obj.id
    }, 'v1', 'api', null);
  }
}

module.exports = BankLink;
