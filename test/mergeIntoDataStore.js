import {expect} from "chai";
import mergeIntoDataStore from '../mergeIntoDataStore';
import D from "../lib/DataStore";

describe('mergeIntoDataStore', function() {

    it('can merge', function(done) {
        var d = new D();

        return d.setStored({}, 'a', {a: 1, b: 3})
            .then(function() {
                return mergeIntoDataStore(d, 'a', {b: 2, c: 3});
            })
            .then(function() {
                return d.getStored({}, 'a');
            })
            .then(function(stored) {
                expect(stored).to.eql({
                    _k: 'a',
                    _v: 2,
                    a: 1,
                    b: 2,
                    c: 3
                });
            })
            .then(done, done);
    });

});


