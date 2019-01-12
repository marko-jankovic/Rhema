
const assert = require('assert');
const Buffer = require('safe-buffer').Buffer;
const utils = require('../lib/utils');

describe('utils.etag(body, encoding)', () => {
    it('should support strings', () => {
        utils.etag('express!')
            .should.eql('"8-O2uVAFaQ1rZvlKLT14RnuvjPIdg"');
    });

    it('should support utf8 strings', () => {
        utils.etag('express❤', 'utf8')
            .should.eql('"a-JBiXf7GyzxwcrxY4hVXUwa7tmks"');
    });

    it('should support buffer', () => {
        utils.etag(Buffer.from('express!'))
            .should.eql('"8-O2uVAFaQ1rZvlKLT14RnuvjPIdg"');
    });

    it('should support empty string', () => {
        utils.etag('')
            .should.eql('"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"');
    });
});

describe('utils.setCharset(type, charset)', () => {
    it('should do anything without type', () => {
        assert.strictEqual(utils.setCharset(), undefined);
    });

    it('should return type if not given charset', () => {
        assert.strictEqual(utils.setCharset('text/html'), 'text/html');
    });

    it('should keep charset if not given charset', () => {
        assert.strictEqual(utils.setCharset('text/html; charset=utf-8'), 'text/html; charset=utf-8');
    });

    it('should set charset', () => {
        assert.strictEqual(utils.setCharset('text/html', 'utf-8'), 'text/html; charset=utf-8');
    });

    it('should override charset', () => {
        assert.strictEqual(utils.setCharset('text/html; charset=iso-8859-1', 'utf-8'), 'text/html; charset=utf-8');
    });
});

describe('utils.wetag(body, encoding)', () => {
    it('should support strings', () => {
        utils.wetag('express!')
            .should.eql('W/"8-O2uVAFaQ1rZvlKLT14RnuvjPIdg"');
    });

    it('should support utf8 strings', () => {
        utils.wetag('express❤', 'utf8')
            .should.eql('W/"a-JBiXf7GyzxwcrxY4hVXUwa7tmks"');
    });

    it('should support buffer', () => {
        utils.wetag(Buffer.from('express!'))
            .should.eql('W/"8-O2uVAFaQ1rZvlKLT14RnuvjPIdg"');
    });

    it('should support empty string', () => {
        utils.wetag('')
            .should.eql('W/"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"');
    });
});

describe('utils.isAbsolute()', () => {
    it('should support windows', () => {
        assert(utils.isAbsolute('c:\\'));
        assert(utils.isAbsolute('c:/'));
        assert(!utils.isAbsolute(':\\'));
    });

    it('should support windows unc', () => {
        assert(utils.isAbsolute('\\\\foo\\bar'));
    });

    it('should support unices', () => {
        assert(utils.isAbsolute('/foo/bar'));
        assert(!utils.isAbsolute('foo/bar'));
    });
});
