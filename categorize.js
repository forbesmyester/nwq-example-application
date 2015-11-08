import querystring from 'querystring';
import { partial } from 'ramda';

export default function categorize(dependencies, payload) {

    function addCategory(id, catName) {
        return dependencies.dataStore.concat('c.' + catName, [], id);
    }

    var promises = payload.prominentWords.map(
        partial(addCategory, [payload.id])
    );

    promises.push(dependencies.dataStore.identity(
        'h.' + payload.id,
        {},
        payload
    ));

    return Promise.all(promises)
        .then(() => {
            return {
                resolution: 'success',
                payload: payload
            };
        });

}
