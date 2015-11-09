import {expect} from "chai";
import categorize from '../storeProminentWordsAsCategories';
import DataStore from '../lib/DataStore';

describe('server', function() {

    it('can categorize', function(done) {

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
            .then(function() {
                return Promise.all([
                    ds._getStored({}, 'c.dictionary'),
                    ds._getStored({}, 'c.frog')
                ]);
            })
            .then(function([dictionaryIndex, frogIndex]) {
                expect(frogIndex).to.eql({v: 1, d: ['a123']});
                expect(dictionaryIndex).to.eql({v: 1, d: ['a123']});
            })
            .then(done).catch(done);

    });

});

