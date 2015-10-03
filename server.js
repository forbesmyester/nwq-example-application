import MemoryExchange from "nwq/MemoryExchange";
import Advancer from "nwq/Advancer";
import checkSpelling from './checkSpelling';
import r_partial from 'ramda/src/partial';
import retreiveJson from './lib/retreiveJson';

// import SQSExchange from "nwq/SQSExchange";
// import AWS from "aws-sdk";

let exchange = new MemoryExchange();
let adv = new Advancer(exchange);
adv.addSpecification(
    'check-spelling',
    { "spelling-error": ["email-spelling-error"] },
    r_partial(checkSpelling, { retreiveJson: retreiveJson })
);

adv.run('check-spelling')
    .then(function(advResult) {
        console.log(advResult);
    });

exchange.postMessagePayload('check-spelling', { haiku: 'I lke dictionary'});
