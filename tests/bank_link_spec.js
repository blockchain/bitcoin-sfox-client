let proxyquire = require('proxyquireify')(require);

describe('SFOX Bank Link', function () {
  let stubs = {
  };

  let BankLink = proxyquire('../src/bank-link', stubs);

  let b;
  let bl;
  let api;
  let obj;

  beforeEach(function () {
    JasminePromiseMatchers.install();

    api = {};
    b = {
      'institution_type': 'fake_institution',
      'subtype': 'checking',
      'meta': {
        'name': 'Plaid Savings',
        'number': '9606'
      },
      'balance': {
        'current': 1274.93,
        'available': 1203.42
      }
    };
    obj = {
      firstName: 'Banky',
      lastName: 'McBankface',
      token: '12345',
      id: '123'
    };

    api = {
      authPOST (method, params) {
        return Promise.resolve([b]);
      }
    };

    bl = new BankLink(api);
  });

  describe('getAccounts', function () {
    it('should return a list of bank accounts', function (done) {
      let testCalls = (res) => {
        expect(res).toEqual([b]);
      };

      bl.getAccounts('12345').then(testCalls).catch(fail).then(done);
    });
  });

  describe('setAccount', function () {
    it('should submit an account', function (done) {
      spyOn(api, 'authPOST').and.callThrough();

      let testCalls = () => {
        expect(api.authPOST).toHaveBeenCalled();
        expect(api.authPOST.calls.argsFor(0)[0]).toEqual('account/bankToken');
      };

      bl.setAccount(obj).then(testCalls).catch(fail).then(done);
    });
  });

  afterEach(() => {
    JasminePromiseMatchers.uninstall();
  });
});
