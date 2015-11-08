import AWS from "aws-sdk";
// TODO: Ensure to go back to NPM version.
import MemoryExchange from "nwq/MemoryExchange";
import Visualize from "nwq/Visualize";
import SQSExchange from "nwq/SQSExchange";
import Advancer from "nwq/Advancer";
import checkSpelling from './checkSpelling';
import r_partial from 'ramda/src/partial';
import retreiveJson from './lib/retreiveJson';
import addDotDiagram from 'add-dot-diagram';
import dbDiaYaml from 'db-diayaml';
import fs from 'fs';

const publishDot = addDotDiagram(5050);

const USING_FAKE = true;
const AWS_REGION = process.env.AWS_REGION || "eu-west-1";

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
    res.json(vis.getData(req.params.id));
});

function getDependencies(fake) {
    var answers = {
        'I': JSON.parse(fs.readFileSync('test/data/spelling_results/I.json')),
        'lke': JSON.parse(fs.readFileSync('test/data/spelling_results/lke.json')),
        'like': JSON.parse(fs.readFileSync('test/data/spelling_results/like.json')),
        'dictionary': JSON.parse(fs.readFileSync('test/data/spelling_results/dictionary.json'))
    };

    if (fake) {
        return {
            retreiveJson: function(url) {
                return new Promise((resolve) => {
                    resolve([200, answers[url.replace(/.*=/, '')]]);
                });
            }
        };
    }

    return { retreiveJson: retreiveJson };
}

advancer.addSpecification(
    'check-spelling',
    { "spelling-error": ["email-spelling-error"] },
    r_partial(checkSpelling, getDependencies(USING_FAKE))
);

advancer.run('check-spelling');
exchange.postMessagePayload(
    'check-spelling',
    { haiku: 'I lke dictionary'}
);

setTimeout(() => {
    advancer.run('check-spelling');
    exchange.postMessagePayload(
        'check-spelling',
        { haiku: 'I like dictionary'}
    );
}, 10000);
