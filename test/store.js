import {expect} from "chai";
import store from '../store';
import DataStore from '../lib/DataStore';

describe('server', function() {

    it('can store and then retrieve', function(done) {

        var ds = new DataStore(),
            deps = {
                dataStore: ds
            };

        var data = {
            prominentWords: ['dictionary', 'frog'],
            haiku: 'Frog likes dictionary dictionary',
            id: 'h.a123'
        };

        store(deps, data)
            .then((message) => {
                expect(message.resolution).to.eql('success');
                expect(message.payload).to.eql(data);
                return message;
            })
            .then(function() {
                return ds._getStored({}, 'h.a123');
            })
            .then(function(myData) {
                expect(myData).to.eql({v: 1, d: data});
            })
            .then(done).catch(done);

    });

});
