import { partial } from 'ramda';

export default function storeProminentWordsAsCategories(dependencies, payload) {

    function addCategory(id, catName) {
        return dependencies.dataStore.concat(
            { defaultValue: [] },
            'c.' + catName,
            id
        );
    }

    var promises = payload.prominentWords.map(
        partial(addCategory, [payload.id])
    );

    return Promise.all(promises)
        .then(() => {
            return {
                resolution: 'success',
                payload: payload
            };
        });

}
