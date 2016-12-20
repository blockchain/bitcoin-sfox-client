var assert = require('assert');
var Exchange = require('bitcoin-exchange-client');

class API extends Exchange.API {
  constructor () {
    super();
    this._apiKey = null;
    this._partnerId = 'blockchain';
    this._accountToken = null;
  }

  get apiKey () { return this._apiKey; }
  set apiKey (value) { this._apiKey = value; }

  set production (value) {
    assert(Exchange.Helpers.isBoolean(value), 'Boolean expected');
    this._production = value;
  }

  get partnerId () { return this._partnerId; }
  set partnerId (value) { this._partnerId = value; }

  get accountToken () { return this._accountToken; }

  get hasAccount () { return Boolean(this.accountToken); }

  _url (subdomain, version, endpoint, partner) {
    assert(endpoint, 'endpoint required');
    version = version || 'v2';
    subdomain = subdomain || 'api';
    partner = partner === null ? null : true;

    return `https://${subdomain}${this._production ? '' : '.staging'}.sfox.com/${version}${partner ? '/partner/'+this._partnerId : ''}/${endpoint}`;
  }

  GET (endpoint, data, version, subdomain, partner) {
    return this._request('GET', endpoint, version, subdomain, data, partner);
  }

  authGET (endpoint, data, version, subdomain, partner) {
    return this._request('GET', endpoint, version, subdomain, data, partner, true);
  }

  POST (endpoint, data, version, subdomain, partner) {
    return this._request('POST', endpoint, version, subdomain, data, partner);
  }

  authPOST (endpoint, data, version, subdomain, partner) {
    return this._request('POST', endpoint, version, subdomain, data, partner, true);
  }

  PATCH (endpoint, data, version, subdomain, partner) {
    return this._request('PATCH', endpoint, version, subdomain, data, partner);
  }

  authPATCH (endpoint, data, version, subdomain, partner) {
    return this._request('PATCH', endpoint, version, subdomain, data, partner, true);
  }

  _request (method, endpoint, version, subdomain, data, partner, authorized) {
    assert(this._apiKey, 'API key required');
    assert(!authorized || this.hasAccount, "Can't make authorized request without an account");

    var url = this._url(subdomain, version, endpoint, partner);

    var headers = {};

    if (subdomain !== 'quotes') {
      headers['X-SFOX-PARTNER-ID'] = this._apiKey;
    }

    if (authorized) {
      headers['Authorization'] = 'Bearer ' + this._accountToken;
    }

    return super._request(method, url, data, headers);
  }
}

module.exports = API;
