'use strict';

var Exchange = require('bitcoin-exchange-client');
var { toSatoshi } = Exchange.Helpers;

class Trade extends Exchange.Trade {
  constructor (obj, api, delegate) {
    super(obj, api, delegate);

    if (obj !== null) {
      this._id = obj.id.toLowerCase();
      this.set(obj);
    }
  }

  get isBuy () { return this._is_buy; }

  get expectedDelivery () { return this._expectedDelivery; }

  setFromAPI (obj) {
    if ([
      'pending',
      'failed',
      'rejected',
      'completed',
      'ready'
    ].indexOf(obj.status) === -1) {
      console.warn('Unknown status:', obj.status);
    }

    this._sfox_status = obj.status;

    switch (obj.status) {
      case 'pending':
      case 'ready':
        this._state = 'processing';
        break;
      default:
        this._state = obj.status;
    }

    this._is_buy = obj.action === 'buy';
    this._feeAmount = obj.fee_amount;
    this._expectedDelivery = obj.expected_delivery;
    this._inCurrency = this._is_buy ? obj.quote_currency.toUpperCase() : obj.base_currency.toUpperCase();
    this._outCurrency = this._is_buy ? obj.base_currency.toUpperCase() : obj.quote_currency.toUpperCase();

    if (this._inCurrency === 'BTC') {
      this._inAmount = toSatoshi(obj.base_amount);
      this._sendAmount = toSatoshi(obj.base_amount);
      this._feeCurrency = obj.fee_currency;
      this._receiveAmount = obj.quote_amount;
    } else {
      this._inAmount = toSatoshi(obj.quote_amount);
      this._sendAmount = toSatoshi(obj.quote_amount);
      this._receiveAmount = obj.base_amount;
    }

    /* istanbul ignore if */
    if (this.debug) {
      console.info('Trade ' + this.id + ' from API');
    }
    this._createdAt = new Date(obj.created_at);

    if (!this.id) {
      this._id = obj.id;
    }

    this._receiveAddress = obj.address;
    this._txHash = obj.blockchain_tx_hash || (!this._is_buy ? this._txHash : null);
  }

  setFromJSON (obj) {
    /* istanbul ignore if */
    if (this.debug) {
      console.info('Trade ' + this.id + ' from JSON');
    }
    this._state = obj.state;
    this._is_buy = obj.is_buy;
    this._delegate.deserializeExtraFields(obj, this);
    this._receiveAddress = this._delegate.getReceiveAddress(this);
    this._confirmed = obj.confirmed;
    this._txHash = obj.tx_hash;
  }

  set (obj) {
    if (Array.isArray(obj)) {
      obj = obj[0];
    }
    if (obj.status) {
      this.setFromAPI(obj);
    } else {
      this.setFromJSON(obj);
    }
    this._medium = 'ach';

    return this;
  }

  static fetchAll (api) {
    return api.authGET('transaction');
  }

  refresh () {
    /* istanbul ignore if */
    if (this.debug) {
      console.info('Refresh ' + this.state + ' trade ' + this.id);
    }
    return this._api.authGET('transaction/' + this._id)
            .then(this.set.bind(this))
            .then(this._delegate.save.bind(this._delegate));
  }

  // QA Tool
  fakeStatus (status) {
    let options = { id: this.id, status: status };
    return this._api.authPOST('testing/changestatus', options)
      .then(this.set.bind(this))
      .then(this._delegate.save.bind(this._delegate));
  }

  toJSON () {
    var serialized = {
      id: this._id,
      state: this._state,
      tx_hash: this._txHash,
      confirmed: this.confirmed,
      is_buy: this.isBuy
    };

    this._delegate.serializeExtraFields(serialized, this);

    return serialized;
  }

  static filteredTrades (trades) {
    return trades.filter(function (trade) {
      // Only consider transactions that are complete or that we're still
      // expecting payment for:
      return [
        'awaiting_transfer_in',
        'processing',
        'completed',
        'completed_test'
      ].indexOf(trade.state) > -1;
    });
  }

  static buy (quote, medium, paymentMethodId) {
    const request = (receiveAddress) => {
      return quote.api.authPOST('transaction', {
        quote_id: quote.id,
        destination: {
          type: 'address',
          address: receiveAddress
        },
        payment_method_id: paymentMethodId
      });
    };
    return super.buy(quote, medium, request);
  }

  static sell (quote, paymentMethodId) {
    const request = () => {
      return quote.api.authPOST('transaction', {
        quote_id: quote.id,
        destination: {
          type: 'payment_method',
          payment_method_id: paymentMethodId
        }
      });
    };
    return super.sell(quote, '', request);
  }

  static idFromAPI (obj) {
    return obj.id;
  }
}

module.exports = Trade;
