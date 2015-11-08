import {expect} from "chai";
import fs from 'fs';
import prominentWords from '../prominentWords';

describe('server can find prominent words', function() {

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

    it('with dupes', function(done) {

        prominentWords(deps, {haiku: 'I like dictionary dictionary'})
            .then(({resolution, payload: { prominentWords: pw, haiku }}) => {
                expect(resolution).to.eql('success');
                expect(haiku).to.eql('I like dictionary dictionary');
                expect(pw).to.eql(['dictionary']);
            })
            .then(done).catch(done);

    });

    it('if there are none!', function(done) {

        prominentWords(deps, {haiku: 'I like'})
            .then((message) => {
                return message;
            })
            .then(({resolution, payload: { prominentWords: pw, haiku }}) => {
                expect(resolution).to.eql('success');
                expect(haiku).to.eql('I like');
                expect(pw).to.eql([]);
            })
            .then(done).catch(done);

    });

});

