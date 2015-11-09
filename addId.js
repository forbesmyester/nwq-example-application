import { merge } from 'ramda';

export default function addId(dependencies, body) {

    return {
        resolution: 'success',
        payload: merge(body, { id: dependencies.generateId() })
    };

}
