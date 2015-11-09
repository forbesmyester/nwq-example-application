import {expect} from "chai";
import markTaskDone from '../markTaskDone';

describe('markTaskDone', function() {

    it('will Add a task', function() {

        var deps = {
            };

        var data = {
            haiku: 'Frog likes dictionary dictionary'
        };

        var result = markTaskDone(deps, 'a', data);

        expect(result.resolution).to.eql('success');
        expect(result.payload).to.eql({
            haiku: 'Frog likes dictionary dictionary',
            completedTask: 'a'
        });

    });

});


