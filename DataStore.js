var R = require('ramda');
var util = require('util');

var DataStore = function() { this._d = {}; };

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

function process(ramdaFuncName) {
    return function(k, defaultValueInput) {

        var that = this,
            defaultValue = { v: 0, d: defaultValueInput },
            args = Array.prototype.slice.call(arguments, 2),
            func = R[ramdaFuncName];

        return that._getStored(k, defaultValueInput._v)
            .then(function(storedValue) {
                if (storedValue.d === undefined) {
                    return defaultValue;
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
                    k,
                    hopefullyNewValue.d,
                    hopefullyNewValue.v
                );
            })
            .then(function(isStored) {
                return R.merge(isStored.d, { _v: isStored.v, _k: k });
            });

    };
}

DataStore.prototype._getStored = function(k, version) {
    var that = this;
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            var d = R.defaultTo({v: 0}, that._d[k]);
            if ((version !== undefined) && (d.v != version)) {
                return reject(new VersionError("Version " + version + " != " + d.v));
            }
            resolve(d);
        }, 25);
    });
};

DataStore.prototype._setStored = function(k, v, version) {
    var that = this;
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            var d = R.defaultTo({v: 0}, that._d[k]);
            if ((version !== undefined) && (d.v != version)) {
                return reject(new VersionError("Version " + version + " != " + d.v));
            }
            d.v = parseInt(version, 10) + 1;
            d.d = v;
            that._d[k] = d;
            resolve(that._d[k]);
        }, 25);
    });
};

Object.keys(R).forEach(function(ramdaFuncName) {
    DataStore.prototype[ramdaFuncName] = process(ramdaFuncName);
});
DataStore.Errors = {
    VersionError: VersionError,
    RamdaParamsError: RamdaParamsError
};

module.exports = DataStore;

