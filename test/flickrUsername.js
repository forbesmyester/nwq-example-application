import {expect} from "chai";
import fs from 'fs';
import flickrUsername from '../flickrUsername';

describe('can get license and username', function() {

    var answers = {
         "22268643413": JSON.parse(fs.readFileSync('test/data/flickr_photo_info/22268643413.json')),
        'not_found': JSON.parse(fs.readFileSync('test/data/flickr_photo_info/not_found.json'))
    };

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

        var deps = getDeps('https://api.flickr.com/services/rest/?api_key=XXX&format=json&nojsoncallback=1&method=flickr.photos.getInfo&photo_id=22268643413');
        flickrUsername(deps, {image: { "id": "22268643413" }})
            .then(({resolution, payload: { image }}) => {
                expect(resolution).to.eql('success');
                expect(image).to.eql({
                    "id": "22268643413",
                    "username": "clive_harris",
                    "license": 0
                });
            })
            .then(done).catch(done);

    });

    it('where there are no flickr results', function(done) {

        var deps = getDeps('https://api.flickr.com/services/rest/?api_key=XXX&format=json&nojsoncallback=1&method=flickr.photos.getInfo&photo_id=not_found');
        flickrUsername(deps, {image: { "id": "not_found" }})
            .then(({resolution, payload: { image }}) => {
                expect(resolution).to.eql('success');
                expect(image).to.eql({
                    "id": "not_found"
                });
            })
            .then(done).catch(done);

    });

});
