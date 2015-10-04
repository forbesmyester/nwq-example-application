import AWS from "aws-sdk";
// TODO: Ensure to go back to NPM version.
import MemoryExchange from "../nwq/lib/MemoryExchange";
import SQSExchange from "../nwq/lib/SQSExchange";
import Advancer from "../nwq/lib/Advancer";
import checkSpelling from './checkSpelling';
import r_partial from 'ramda/src/partial';
import retreiveJson from './lib/retreiveJson';
// import addDotDiagram from 'add-dot-diagram';

// const publishDot = addDotDiagram(5050);

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


adv.addSpecification(
    'check-spelling',
    { "spelling-error": ["email-spelling-error"] },
    r_partial(checkSpelling, { retreiveJson: retreiveJson })
);

adv.run('check-spelling');

exchange.postMessagePayload('check-spelling', { haiku: 'I lke dictionary'});
