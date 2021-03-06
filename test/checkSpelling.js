import {expect} from "chai";
import fs from 'fs';
import checkSpelling from '../checkSpelling';

describe('server can check spellings', function() {

    var answers = {
        'I': JSON.parse(fs.readFileSync('test/data/spelling_results/I.json')),
        'lke': JSON.parse(fs.readFileSync('test/data/spelling_results/lke.json')),
        'like': JSON.parse(fs.readFileSync('test/data/spelling_results/like.json')),
        'dictionary': JSON.parse(fs.readFileSync('test/data/spelling_results/dictionary.json'))
    };

    var deps = {
        retreiveJson: function(url) {
            return new Promise((resolve) => {
                resolve([200, answers[url.replace(/.*=/, '')]]);
            });
        }
    };

    it('correct words', function(done) {

        checkSpelling(deps, {haiku: 'I dictionary'})
            .then(({resolution, payload: { haiku }}) => {
                expect(resolution).to.eql('success');
                expect(haiku).to.eql('I dictionary');
            })
            .then(done).catch(done);

    });

    it('incorrect words', function(done) {

        checkSpelling(deps, {haiku: 'I lke dictionary'})
            .then(({resolution, payload: { haiku }}) => {
                expect(resolution).to.eql('spelling-error');
                expect(haiku).to.eql('I lke dictionary');
            })
            .then(done).catch(done);

    });

});
