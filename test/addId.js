import {expect} from "chai";
import addId from '../addId';

describe('addId', function() {

    it('will Add an Id', function() {

        var deps = {
                generateId: function() {
                    return 'abc213';
                }
            };

        var data = {
            prominentWords: ['dictionary', 'frog'],
            haiku: 'Frog likes dictionary dictionary'
        };

        var result = addId(deps, data);

        expect(result.resolution).to.eql('success');
        expect(result.payload).to.eql({
            prominentWords: ['dictionary', 'frog'],
            haiku: 'Frog likes dictionary dictionary',
            id: 'abc213'
        });

    });

});

