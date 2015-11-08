import querystring from 'querystring';

export default function checkSpelling(dependencies, {haiku}) {

    function checkWord(word) {
        let baseUrl = 'https://api.pearson.com:443/v2/dictionaries/ldoce5/entries',
            params = { headword: word },
            url = baseUrl + '?' + querystring.stringify(params);
        return dependencies.retreiveJson(url)
            .then(function(response) {
                return ( (response[0] == 200) && (response[1].count > 0) );
            });
    }

    function checkSpellingResults(wordsSpeltCorrect) {

        // Once we have all the results, check there are no incorrect
        // spelt words (we should ideally have an array of true).
        //
        // The result of this is that the message will be placed into
        // the "pick_prominent_words" queue as it is defined as the
        // success condition above.
        if (wordsSpeltCorrect.indexOf(false) === -1) {
            return {
                resolution: 'success',
                payload: { haiku }
            };
        }

        // If we have some falses, then we set a resolution to
        // "spelling-error". We did not tell it where to send
        // this resolution so it will go into the (and create if
        // neccessary) "spellcheck/spelling-error" queue.
        return {
            resolution: 'spelling-error',
            payload: { haiku }
        };
    }

    // Break into words and send all of them for spellchecking
    return Promise.all(haiku.split(/\s+/).map(checkWord))
        .then(checkSpellingResults);
}

