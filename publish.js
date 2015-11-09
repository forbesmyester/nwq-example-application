import { merge } from 'ramda';

export default function publish(dependencies, body) {

    return {
        resolution: 'success',
        payload: merge(body, { published: true })
    };

}
