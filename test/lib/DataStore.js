import {expect} from "chai";
import D from "../../lib/DataStore";

describe('DataStore', function() {

    it('can store data, if versions match using get/set Stored functions', function(done) {
        var d = new D(),
            thru = [false, false];
        d.setStored({}, 'a', {a: 1})
            .then(function(result) {
                expect(result).to.eql({_k: 'a', _v: 1, a: 1 });
            })
            .then(function() {
                return d.getStored({}, 'a');
            })
            .then(function(result) {
                expect(result).to.eql({_k: 'a', _v: 1, a: 1 });
            })
            .then(function() {
                thru[0] = true;
                return d.setStored({ version: 3 }, 'a', {z: 1});
            })
            .catch(function(err) {
                expect(err).to.be.instanceof(D.Errors.VersionError);
                return d.getStored({}, 'a');
            })
            .then(function(stored) {
                expect(stored).to.eql({_k: 'a', _v: 1, a: 1 });
                thru[1] = true;
                return d.getStored({ version: 3 }, 'a');
            })
            .catch(function(err) {
                expect(err).to.be.instanceof(D.Errors.VersionError);
                expect(thru).to.eql([true, true]);
            })
            .then(done, done);
    });

    it('can store data, if versions match using ramda functions', function(done) {
        var d = new D();
        var secondWriteDone = false;
        d.assocPath({ defaultValue: {a: 1} }, 'a', ['b', 'c'], 3)
            .then(function(result) {
                expect(result).to.eql({_k: 'a', _v: 1, a: 1, b: { c: 3 } });
            })
            .then(function() {
                return d.getStored({}, 'a');
            })
            .then(function(stored) {
                expect(stored).to.eql({_k: 'a', _v: 1, a: 1, b: { c: 3 } });
            })
            .then(function() {
                return d.assocPath({version: 1}, 'a', ['b', 'c'], 3);
            })
            .then(function() {
                secondWriteDone = true;
            })
            .then(function() {
                return d.assocPath({version: 9}, 'a', ['b', 'c'], 3);
            })
            .catch(function(err) {
                expect(err).to.be.instanceof(D.Errors.VersionError);
                expect(secondWriteDone).to.equal(true);
                done();
            });
    });

});

