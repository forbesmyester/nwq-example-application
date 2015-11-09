import {sortBy} from 'ramda';
import {join} from 'ramda';
import {path} from 'ramda';
import {toLower} from 'ramda';
import {merge} from 'ramda';
import {nth} from 'ramda';
import urlCreator from './urlCreator';

export default function searchFlikr(dependencies, payload) {

    const photoPattern = 'https://farm{farm}.staticflickr.com/{server}/{id}_{secret}.jpg',
        searchPattern = 'https://api.flickr.com/services/rest/?api_key={FLICKR_API_KEY}&method=flickr.photos.search&extras=original_format&format=json&nojsoncallback=1&text={search}';

    function getFirstResult([statusCode, restResult]) {
        if (statusCode !== 200) {
            return [];
        }
        if (parseInt(path(['photos', 'total'], restResult), 10) < 1) {
            return [];
        }
        return [nth(0, path(['photos', 'photo'], restResult))];
    }

    let prominentWords = payload.prominentWords,
        searchWord = join('+', sortBy(toLower)(prominentWords)),
        searchUrl = urlCreator(searchPattern, {
            FLICKR_API_KEY: dependencies.env.FLICKR_API_KEY,
            search: searchWord
        });

    return dependencies.retreiveJson(searchUrl)
        .then(getFirstResult)
        .then(function(ar) {
            if (ar.length === 0) { return null; }
            return merge(ar[0], { url: urlCreator(photoPattern, ar[0]) });
        })
        .then(function(flikrImage) {
            return {
                resolution: 'success',
                payload: merge(payload, { image: flikrImage })
            };
        });

}

