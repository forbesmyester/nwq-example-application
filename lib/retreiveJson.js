import fetch from 'node-fetch';

export default function retreiveJson(url) {
        console.log(url);
    return fetch(url)
        .then((response) => {
            console.log(response);
            return Promise.all([response.status, response.json()]);
        })
        .catch((err) => {
            console.log(err);
        });
}
