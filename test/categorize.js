import {expect} from "chai";
import categorize from '../categorize';
import DataStore from '../DataStore';

describe('server', function() {

    it('can store and then retrieve', function(done) {

        var ds = new DataStore(),
            deps = {
                dataStore: ds
            };

        var data = {
            prominentWords: ['dictionary', 'frog'],
            haiku: 'Frog likes dictionary dictionary',
            id: 'a123'
        };


        categorize(deps, data)
            .then((message) => {
                expect(message.resolution).to.eql('success');
                expect(message.payload).to.eql(data);
                return message;
            })
            .then(function(message) {
                return Promise.all([
                    ds._getStored('c.dictionary'),
                    ds._getStored('c.frog'),
                    ds._getStored('h.a123')
                ]);
            })
            .then(function([dictionaryIndex, frogIndex, myData]) {
                expect(frogIndex).to.eql({v: 1, d: ['a123']});
                expect(dictionaryIndex).to.eql({v: 1, d: ['a123']});
                expect(myData).to.eql({v: 1, d: data});
            })
            .then(done).catch(done);

    });

});

