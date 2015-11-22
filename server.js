import AWS from "aws-sdk";
// TODO: Ensure to go back to NPM version.
import MemoryExchange from "nwq/MemoryExchange";
import Visualize from "nwq/Visualize";
import SQSExchange from "nwq/SQSExchange";
import Advancer from "nwq/Advancer";
import checkSpelling from './checkSpelling';
import r_partial from 'ramda/src/partial';
import retreiveJson from './lib/retreiveJson';
import DataStore from './lib/DataStore';
import addDotDiagram from 'add-dot-diagram';
import dbDiaYaml from 'db-diayaml';
import getTLIdEncoderDecoder from 'get_tlid_encoder_decoder';
import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';

import storeProminentWordsAsCategories from './storeProminentWordsAsCategories';
import prominentWords from './prominentWords';
import flickrUsername from './flickrUsername';
import searchFlickr from './searchFlickr';
import store from './store';
import addId from './addId';
import join from './join';
import markTaskDone from './markTaskDone';
import publish from './publish';

const USING_FAKE = !!process.env.USING_FAKE;
const AWS_REGION = process.env.AWS_REGION || "eu-west-1";


const NWQ_EXAMPLE_COMMAND_PORT = process.env.NWQ_EXAMPLE_COMMAND_PORT ? process.env.NWQ_EXAMPLE_COMMAND_PORT : 5051;
const NWQ_EXAMPLE_VISUALIZATION_PORT = process.env.NWQ_EXAMPLE_VISUALIZATION_PORT ? process.env.NWQ_EXAMPLE_VISUALIZATION_PORT : 5050;

const publishDot = addDotDiagram(NWQ_EXAMPLE_VISUALIZATION_PORT);

var encoderDecoder = getTLIdEncoderDecoder((new Date(2015, 10, 14).getTime()), 2);

function getExchange(fake) {
    if (fake) {
        return new MemoryExchange({runMessageCleanup: false});
    }
    let sqs = new AWS.SQS({region: AWS_REGION});
    return new SQSExchange(sqs);
}

let exchange = getExchange(USING_FAKE);
let advancer = new Advancer(exchange);

function addVisualization(adv) {
    var v = new Visualize(adv);
    v.on('need-redraw', function(diayaml) {
        var dotSrc = dbDiaYaml.getDotSrc(
                dbDiaYaml.transform(diayaml)
            ).join("\n");
        publishDot(dotSrc);
    });
    return v;
}

var vis = addVisualization(advancer);

publishDot.app.get('/dot-diagram-id-click/:id', function(req, res) {
    let toSend = vis.getData(req.params.id);
    res.json(toSend);
});

function getDependencies(fake) {
    var answers = {
        'I': JSON.parse(fs.readFileSync('test/data/spelling_results/I.json')),
        'lke': JSON.parse(fs.readFileSync('test/data/spelling_results/lke.json')),
        'like': JSON.parse(fs.readFileSync('test/data/spelling_results/like.json')),
        'dictionary': JSON.parse(fs.readFileSync('test/data/spelling_results/dictionary.json'))
    };

    var deps = {
        dataStore: new DataStore(),
        retreiveJson: retreiveJson,
        env: process.env,
        generateId: function() { return 'h.' + encoderDecoder.encode(); }
    };

    if (fake) {
        deps.retreiveJson = function(url) {
            return new Promise((resolve) => {
                resolve([200, answers[url.replace(/.*=/, '')]]);
            });
        };
    }

    return deps;
}

var dependencies = getDependencies(false);

advancer.addSpecification(
    'addId',
    { success: 'checkSpelling' },
    r_partial(addId, dependencies)
);

advancer.addSpecification(
    'checkSpelling',
    {
        success: ['prominentWords'],
        misspelt: ['log', 'informUser']
    },
    checkSpelling.bind(this, dependencies)
);

advancer.addSpecification(
    'prominentWords',
    { success: ['searchFlickr', 'storeProminentWordsAsCategories'] },
    r_partial(prominentWords, dependencies)
);

advancer.addSpecification(
    'searchFlickr',
    { success: 'flickrUsername' },
    r_partial(searchFlickr, dependencies)
);

advancer.addSpecification(
    'flickrUsername',
    { success: 'markFlickrDone' },
    r_partial(flickrUsername, dependencies)
);

advancer.addSpecification(
    'markFlickrDone',
    { success: 'join' },
    r_partial(markTaskDone, dependencies, 'flickr')
);

advancer.addSpecification(
    'storeProminentWordsAsCategories',
    { success: 'markCategorizationDone' },
    r_partial(storeProminentWordsAsCategories, dependencies)
);

advancer.addSpecification(
    'markCategorizationDone',
    { success: 'join' },
    r_partial(markTaskDone, dependencies, 'categorization')
);

advancer.addSpecification(
    'join',
    { success: ['publish'], waiting: [] },
    r_partial(join, dependencies, ['categorization', 'flickr'])
);

advancer.addSpecification(
    'publish',
    { success: 'storePublished' },
    r_partial(publish, dependencies)
);

advancer.addSpecification(
    'storePublished',
    {},
    r_partial(store, dependencies)
);

advancer.runAllForever();

advancer.on('err', function(err) {
    /* eslint no-console: 0 */
    console.log("Advancer Detected Error: ", err.message, "at \n\n", err.stack);
});

if (
    !process.env.hasOwnProperty('NWQ_EXAMPLE_AUTO_RUN') ||
    parseInt(process.env.NWQ_EXAMPLE_AUTO_RUN, 10)
) {
    setTimeout(() => {
        exchange.postMessagePayload(
            'addId',
            { haiku: 'I like diktionary'}
        );
    }, 1000);
    setTimeout(() => {
        exchange.postMessagePayload(
            'addId',
            { haiku: 'I like dictionary'}
        );
    }, 4000);
}


var app = express();
app.use(bodyParser.json());
app.post('/command', function(req, res) {
    console.log(req.body);
    if (req.body && req.body.haiku && (typeof req.body.haiku == 'string')) {
        exchange.postMessagePayload(
            'addId',
            req.body
        );
        return res.sendStatus(200);
    }
    res.sendStatus(422);
});
app.listen(NWQ_EXAMPLE_COMMAND_PORT, function() {
    console.log("Listening for commands on port " + NWQ_EXAMPLE_COMMAND_PORT);
});
