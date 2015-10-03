import fetch from 'node-fetch';

export default function retreiveJson(url) {
    return fetch(url)
        .then((response) => {
            return Promise.all([response.status, response.json()]);
        });
}
