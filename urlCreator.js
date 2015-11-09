import {values} from 'ramda';
import {mapObjIndexed} from 'ramda';
import {reduce} from 'ramda';

function replacer(urlSoFar, [v, k]) {
    return urlSoFar.replace('{' + k + '}', encodeURIComponent(v));
}

function makeTuple(v, k) { return [v, k]; }

export default function urlCreator(urlPattern, obj) {
    return reduce(
        replacer,
        urlPattern,
        values(mapObjIndexed(makeTuple, obj))
    );
}
