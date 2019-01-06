'use strict';

const chai = require('chai');
const assert = chai.assert;
const gitStatus = require('../index');

describe('# GitStatus', () => {
    it('should get Short Commit Number', (done) => {
        gitStatus.shortCommitNumber((err, str) => {
            if (!err) {
                assert.lengthOf(str, 7);
            }

            done();
        });
    });

    it('should get long Commit Number', (done) => {
        gitStatus.longCommitNumber((err, str) => {
            if (!err) {
                assert.lengthOf(str, 40);
            }

            done();
        });
    });

    it('should execute lastTag, branchName, commitLog', (done) => {
        gitStatus.execute(['lastTag', 'branchName', 'commitLog'], (err, data) => {
            if (!err) {
                assert.property(data, 'lastTag');
                assert.property(data, 'branchName');
                //assert.isObject(data.commitLog);
                assert.property(data.commitLog[0], 'commit');
                assert.property(data.commitLog[0], 'author');
                assert.property(data.commitLog[0], 'before');
                assert.property(data.commitLog[0], 'date');
                assert.property(data.commitLog[0], 'message');
            }

            done();
        });
    });
});
