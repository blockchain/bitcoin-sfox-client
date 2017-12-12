var Exchange = require('bitcoin-exchange-client');
var PaymentMethod = require('./payment-medium');
var Trade = require('./trade');

var { toSatoshi } = Exchange.Helpers;
var isBTC = (c) => c === 'BTC';
var flipCurrency = (c) => isBTC(c) ? 'USD' : 'BTC';

class Quote extends Exchange.Quote {
  constructor (obj, baseCurrency, api, delegate, debug) {
    super(api, delegate, Trade, PaymentMethod, debug);

    var expiresAt = new Date(obj.expires_on);
    var timeOfRequest = new Date(obj.current_time);
    var btcAmount = toSatoshi(obj.base_amount);
    var usdAmount = obj.quote_amount;

    this._id = obj.quote_id;
    this._expiresAt = expiresAt;
    this._timeOfRequest = timeOfRequest;
    this._rate = obj.rate;

    this._baseCurrency = baseCurrency.toUpperCase();
    this._baseAmount = isBTC(this._baseCurrency) ? btcAmount : parseFloat(usdAmount).toFixed(2);

    this._quoteCurrency = flipCurrency(this._baseCurrency);
    this._quoteAmount = isBTC(this._quoteCurrency) ? btcAmount : parseFloat(usdAmount).toFixed(2);

    this._feeAmount = obj.fee_amount;
    this._feeCurrency = obj.fee_currency.toUpperCase();
  }

  get rate () {
    return this._rate;
  }

  get feeAmount () {
    return this._feeAmount;
  }

  get feeCurrency () {
    return this._feeCurrency;
  }

  static getQuote (api, delegate, amount, baseCurrency, quoteCurrency, debug) {
    const processQuote = (quote) => {
      let q = new Quote(quote, baseCurrency, api, delegate);
      q.debug = debug;
      return q;
    };

    const getQuote = (_baseAmount) => {
      let action = _baseAmount > 0 ? 'buy' : 'sell';

      return api.POST('quote/', {
        action: action,
        base_currency: 'btc',
        quote_currency: 'usd',
        amount: Math.abs(_baseAmount),
        amount_currency: baseCurrency.toLowerCase()
      }, 'v1', 'quotes');
    };

    return super
      .getQuote(-amount, baseCurrency, quoteCurrency, ['BTC', 'EUR', 'GBP', 'USD', 'DKK'], debug)
      .then(getQuote)
      .then(processQuote);
  }
}

module.exports = Quote;
