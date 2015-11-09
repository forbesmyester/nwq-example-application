import querystring from 'querystring';
import {uniq} from 'ramda';
import {merge} from 'ramda';

export default function prominentWords(dependencies, payload) {

    function checkWord(word) {
        let baseUrl = 'https://api.pearson.com:443/v2/dictionaries/ldoce5/entries',
            params = { headword: word.toLowerCase() },
            url = baseUrl + '?' + querystring.stringify(params);

        function isMostlyNoun(responseBody) {
            if (responseBody === undefined) { return false; }
            if (!responseBody.hasOwnProperty('results')) { return false; }
            if (!responseBody.results.reduce) { return false; }
            var wordInfo = responseBody.results[0];
            return wordInfo.part_of_speech == 'noun';
        }

        return dependencies.retreiveJson(url)
            .then(function(response) {
                return {
                    word,
                    isNoun: ( (response[0] == 200) && (isMostlyNoun(response[1])) )
                };
            });
    }

    function prepareResult(wordsThatAreNouns) {
        var newPayload = merge(
            { prominentWords: wordsThatAreNouns },
            payload
        );
        return {
            resolution: 'success',
            payload: newPayload
        };
    }

    // Break into words and send all of them for spellchecking
    return Promise.all(payload.haiku.split(/\s+/).map(checkWord))
        .then((wordResults) => {
            return uniq(
                wordResults
                    .filter(({isNoun}) => { return isNoun; } )
                    .map(({word}) => { return word.toLowerCase(); } )
            );
        })
        .then(prepareResult);
}


