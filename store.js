import mergeIntoDataStore from './mergeIntoDataStore';
import {omit} from 'ramda';

export default function storeProminentWordsAsCategories(dependencies, payload) {

    return mergeIntoDataStore(
        dependencies.dataStore,
        payload.id,
        payload
    ).then(function(storedAs) {
        return {
            resolution: 'success',
            payload: omit(['_v', '_k'], storedAs)
        };
    });

}

