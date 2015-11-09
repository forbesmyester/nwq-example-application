import deepExtend from 'deep-extend';

export default function mergeIntoDataStore(dataStore, k, newDataToMerge) {

    return dataStore._getStored({}, k)
        .then(function({v, d}) {
            if (v === undefined) {
                v = 0;
            }
            return dataStore.identity(
                {version: v},
                k,
                deepExtend({}, d, newDataToMerge)
            );
        });


}
