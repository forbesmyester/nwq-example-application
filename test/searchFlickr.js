import {expect} from "chai";
import fs from 'fs';
import searchFlickr from '../searchFlickr';

describe('can get picture urls', function() {

    var answers = {
        'frog%2Bpond': JSON.parse(fs.readFileSync('test/data/flickr_result/frog_pond.json')),
        'not_found': JSON.parse(fs.readFileSync('test/data/flickr_result/not_found.json'))
    };

    // license 1,2,3,4,5,6

    function getDeps(expectedUrl) {
        return {
            env: { FLICKR_API_KEY: 'XXX' },
            retreiveJson: function(url) {
                expect(url).to.eql(expectedUrl);
                return new Promise((resolve) => {
                    resolve([200, answers[url.replace(/.*=/, '')]]);
                });
            }
        };
    }

    it('where there are flickr results', function(done) {

        var deps = getDeps('https://api.flickr.com/services/rest/?api_key=XXX&method=flickr.photos.search&extras=original_format&format=json&nojsoncallback=1&text=frog%2Bpond');
        searchFlickr(deps, {prominentWords: ['pond', 'frog']})
            .then(({resolution, payload: { image }}) => {
                expect(resolution).to.eql('success');
                expect(image).to.eql({
                    "isfamily": 0,
                    "id": "22268643413",
                    "owner": "21504394@N05",
                    "secret": "50162cb43a",
                    "server": "5703",
                    "farm": 6,
                    "title": "frog face",
                    "ispublic": 1,
                    "isfriend": 0,
                    "url": 'https://farm6.staticflickr.com/5703/22268643413_50162cb43a.jpg'
                }

                );
            })
            .then(done).catch(done);

    });

    it('where there are no flickr results', function(done) {

        var deps = getDeps('https://api.flickr.com/services/rest/?api_key=XXX&method=flickr.photos.search&extras=original_format&format=json&nojsoncallback=1&text=not_found');
        searchFlickr(deps, {prominentWords: ['not_found']})
            .then(({resolution, payload: { image }}) => {
                expect(resolution).to.eql('success');
                expect(image).to.eql(null);
            })
            .then(done).catch(done);

    });

});
