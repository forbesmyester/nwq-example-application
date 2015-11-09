import {path} from 'ramda';
import {pipe} from 'ramda';
import {assocPath} from 'ramda';
import urlCreator from './urlCreator';

export default function flikrOwner(dependencies, payload) {

    const infoPattern = 'https://api.flickr.com/services/rest/?api_key={FLICKR_API_KEY}&format=json&nojsoncallback=1&method=flickr.photos.getInfo&photo_id={id}';

    let id = path(['image', 'id'], payload),
        infoUrl = urlCreator(infoPattern, {
            FLICKR_API_KEY: dependencies.env.FLICKR_API_KEY,
            id: id
        });

    return dependencies.retreiveJson(infoUrl)
        .then(function([, doc]) {
            if (doc.stat !== 'ok') {
                return { resolution: 'success', payload: payload };
            }

            let newPayload = pipe(
                assocPath(['image', 'license'],
                    parseInt(path(['photo', 'license'], doc), 10)),
                assocPath(['image', 'username'],
                    path(['photo', 'owner', 'username'], doc))
            )(payload);

            return { resolution: 'success', payload: newPayload };
        });

}


