import { merge } from 'ramda';

export default function markTaskDone(dependencies, task, body) {


    var toMerge = { completedTask: task };
    return { resolution: 'success', payload: merge(body, toMerge) };

}
