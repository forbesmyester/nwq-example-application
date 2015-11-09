import {expect} from "chai";
import join from '../join';
import DataStore from '../lib/DataStore';

describe('server', function() {

    it('can join the streams', function(done) {
        var ds = new DataStore(),
            deps = {
                dataStore: ds
            };

        join(deps, ['a', 'b'], {id: 'z', a: 1, completedTask: 'a'})
            .then((result) => {
                expect(result.resolution).to.eql('waiting');
                expect(result.payload).to.eql({id: 'z', a: 1});
            })
            .then(() => {
                return join(deps, ['a', 'b'], {id: 'z', b: 2, completedTask: 'b'});
            })
            .then((result) => {
                expect(result.resolution).to.eql('success');
                expect(result.payload).to.eql({id: 'z', a: 1, b: 2});
            })
            .then(done, done);

    });

});

