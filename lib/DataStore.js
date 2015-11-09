var R = require('ramda');
var util = require('util');

var DataStore = function() { this._d = {}; };

/**
 * # usage:
 *
 * API usage like this:
 *
 *     var dataStore = new DataStore();
 *     dataStore.[ramdaFunction](options, k, v)
 *     dataStore.setStored(options, k, v)
 *     dataStore.getStored(options, k)
 *
 * options introduces the following keys:
 *
 *  * `version` which introduces the requirement that the stored version
 *    must be of that version to act.
 *  * `defaultValue` will be used if the item is not found (ie version 0).
 */

function RamdaParamsError(msg, data) {
  Error.call(this);
  this.message = msg;
  this.data = data;
}
util.inherits(RamdaParamsError, Error);

function VersionError(msg) {
  Error.call(this);
  this.message = msg;
}
util.inherits(VersionError, Error);

function present(k) {
    return function(isStored) {
        return R.merge(isStored.d, { _v: isStored.v, _k: k });
    };
}

function process(ramdaFuncName) {
    return function(options, k) {

        var that = this,
            defaultValue = options.defaultValue,
            version = options.version,
            defaultSet = { v: 0, d: defaultValue },
            args = Array.prototype.slice.call(arguments, 2),
            func = R[ramdaFuncName];

        return that._getStored(options, k)
            .then(function(storedValue) {
                if (storedValue.d === undefined) {
                    return defaultSet;
                }
                return storedValue;
            })
            .then(function(currentValue) {
                var a = R.concat(R.clone(args), [currentValue.d]),
                    d = R.apply(func, a);

                if (typeof d == 'function') {
                    throw new RamdaParamsError(
                        "Ramda call resulted in functoin result",
                        {func: func, args: a, result: d}
                    );
                }

                return {
                    v: currentValue.v,
                    d: d
                };
            })
            .then(function(hopefullyNewValue) {
                return that._setStored(
                    { version: version },
                    k,
                    hopefullyNewValue.d
                );
            })
            .then(present(k));

    };
}

DataStore.prototype._getStored = function({ version, defaultValue }, k) {

    if ((typeof k != 'string') || (k.length == 0)) {
        throw new Error("Invalid DataStore Key");
    }

    var that = this;
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            var d = R.defaultTo({v: 0, d: defaultValue}, that._d[k]);
            if ((version !== undefined) && (d.v != version)) {
                return reject(new VersionError("Version " + version + " != " + d.v));
            }
            resolve(d);
        }, 25);
    });
};

DataStore.prototype._setStored = function({ version, defaultValue }, k, v) {

    if ((typeof k != 'string') || (k.length == 0)) {
        throw new Error("Invalid DataStore Key");
    }

    var that = this;
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            var d = R.defaultTo({v: 0}, that._d[k]);
            if ((version !== undefined) && (d.v != version)) {
                return reject(new VersionError("Version " + version + " != " + d.v));
            }
            d.v = d.v + 1;
            d.d = v;
            that._d[k] = d;
            resolve(that._d[k]);
        }, 25);
    });
};

DataStore.prototype.setStored = function(options, k, v) {
    return this.identity(options, k, v);
};

DataStore.prototype.getStored = function(options, k) {
    return this._getStored(options, k)
        .then(present(k));
};

Object.keys(R).forEach(function(ramdaFuncName) {
    DataStore.prototype[ramdaFuncName] = process(ramdaFuncName);
});
DataStore.Errors = {
    VersionError: VersionError,
    RamdaParamsError: RamdaParamsError
};

module.exports = DataStore;

