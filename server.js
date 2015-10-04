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

const USING_AMAZON_SQS = false;
const AWS_REGION = process.env.AWS_REGION || "eu-west-1";

function getExchange() {
    if (USING_AMAZON_SQS) {
        let sqs = new AWS.SQS({region: AWS_REGION});
        return new SQSExchange(sqs);
    }
    return new MemoryExchange({runMessageCleanup: false});
}

let exchange = getExchange();
let adv = new Advancer(exchange);
var vis = new Visualize(adv);
vis.on('need-redraw', function(diayaml) {
    publishDot(
        dbDiaYaml.getDotSrc(
            dbDiaYaml.transform(diayaml)
        ).join("\n")
    );
});

    var answers = {
        'I': JSON.parse(fs.readFileSync('test/data/spelling_results/I.json')),
        'lke': JSON.parse(fs.readFileSync('test/data/spelling_results/lke.json')),
        'like': JSON.parse(fs.readFileSync('test/data/spelling_results/like.json')),
        'dictionary': JSON.parse(fs.readFileSync('test/data/spelling_results/dictionary.json'))
    };

    var fakeDeps = {
        retreiveJson: function(url) {
            return new Promise((resolve) => {
                resolve([200, answers[url.replace(/.*=/, '')]]);
            });
        }
    };

    var realDeps = { retreiveJson: retreiveJson };

adv.addSpecification(
    'check-spelling',
    { "spelling-error": ["email-spelling-error"] },
    r_partial(checkSpelling, fakeDeps)
);

adv.run('check-spelling');
exchange.postMessagePayload(
    'check-spelling',
    { haiku: 'I like dictionary'}
);

setInterval(() => {
    adv.run('check-spelling');
    exchange.postMessagePayload(
        'check-spelling',
        { haiku: 'I lke dictionary'}
    );
}, 10000);
