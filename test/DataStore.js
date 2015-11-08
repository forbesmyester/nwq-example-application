import {expect} from "chai";
import D from "../DataStore";

describe('DataStore', function() {

    it('can store data, if versions match', function(done) {
        var d = new D();
        var secondWriteDone = false;
        d.assocPath('a', {a: 1}, ['b', 'c'], 3)
            .then(function(result) {
                expect(result).to.eql({_k: 'a', _v: 1, a: 1, b: { c: 3 } });
            })
            .then(function() {
                return d.assocPath('a', {_v: 1}, ['b', 'c'], 3);
            })
            .then(function() {
                secondWriteDone = true;
            })
            .then(function() {
                return d.assocPath('a', {_v: 9}, ['b', 'c'], 3);
            })
            .catch(function(err) {
                expect(err).to.be.instanceof(D.Errors.VersionError);
                expect(secondWriteDone).to.equal(true);
                done();
            });
    });

});

