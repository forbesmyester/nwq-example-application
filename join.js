import {path} from 'ramda';
import {omit} from 'ramda';
import {map} from 'ramda';
import {filter} from 'ramda';
import mergeIntoDataStore from './mergeIntoDataStore';

export default function join(dependencies, requiredTasks, payload) {

    return dependencies.dataStore.assocPath(
        { defaultValue: {} },
        't.' + payload.id,
        [payload.completedTask],
        1
    ).then(
        () => {
            return dependencies.dataStore._getStored({}, 't.' + payload.id);
        })
        .then(function({d}) {

            var notRanTasks = filter(
                function(exists) { return !exists; },
                map(
                    function(t) { return path([t], d); },
                    requiredTasks
                )
            );

            if (notRanTasks.length === 0) {
                return 'success';
            }
            return 'waiting';

        })
        .then(function(resolution) {
            return mergeIntoDataStore(
                dependencies.dataStore,
                payload.id,
                payload
            ).then(function(storedAs) {
                return {
                    resolution: resolution,
                    payload: omit(['completedTask', '_v', '_k'], storedAs)
                };
            });
        });

}
