var chai = require('chai');
var _ = require('asyncawait/src/util');
var Protocol = require('asyncawait/src/protocol');
var expect = chai.expect;

describe('An instance of the Protocol class', function () {
    it('exposes the options it was constructed with', function () {
        var opts = { a: 1, b: 2 };
        var p = new Protocol(opts, _.empty);
        expect(p.options).to.equal(opts);
    });

    it('exposes the members returned by the given getMembers() function', function () {
        var opts = { useFoo: true, useBar: false }, foo = function (a) {
        }, bar = function (a, b) {
        };
        var getMems = function (opts) {
            var result = {};
            if (opts.useFoo)
                result.foo = foo;
            if (opts.useBar)
                result.bar = bar;
            return result;
        };
        var p = new Protocol(opts, getMems);
        expect(p.members.foo).to.exist;
        expect(p.members.foo).to.equal(foo);
        expect(p.members.bar).to.not.exist;
    });

    it('returns a new protocol from its mod() method, whose properties are cloned from the original protocol', function () {
        var opts = { a: 1, b: 2 }, getMod = function (opts) {
            return ({ foo: _.empty, bar: _.empty });
        };
        var p = new Protocol(opts, getMod);
        var p2 = p.mod({});
        expect(p2).to.be.an.instanceof(Protocol);
        expect(p2).to.not.equal(p);
        expect(p2.options).to.not.equal(p.options);
        expect(p2.members).to.not.equal(p.members);
        expect(p2.options).to.deep.equal(opts);
        expect(p2.members).to.have.keys('foo', 'bar');
        expect(p2.members.foo).to.equal(_.empty);
    });
});

describe('Calling the Protocol#mod method with a valid mod', function () {
    it('returns a new protocol whose options integrate the given defaults', function () {
        var opts = { a: 1, b: 2 }, getMod = function (opts) {
            return ({ foo: _.empty, bar: _.empty });
        };
        var p = new Protocol(opts, getMod);
        var p2 = p.mod({ override: _.empty, defaults: { a: 3, b: 'bbb', y: 'yyy', z: 99 } });
        expect(p2.options).to.deep.equal({ a: 1, b: 2, y: 'yyy', z: 99 });
    });

    it('returns a new protocol whose members integrate the given overrides', function () {
        var opts = { a: 1, b: 2 }, getMod = function (opts) {
            return ({ foo: function () {
                    return opts;
                }, bar: _.empty });
        };
        var p1 = new Protocol(opts, getMod);
        var p2 = p1.mod({ override: function (base, opts) {
                return ({ bar: function (key) {
                        return opts[key];
                    } });
            }, defaults: { a: 3, b: 4, c: 5 } });
        expect(p1.members.foo()).to.deep.equal({ a: 1, b: 2 });
        expect(p2.members.foo()).to.deep.equal({ a: 1, b: 2, c: 5 });
        expect(p1.members.bar('a')).to.be.undefined;
        expect(p1.members.bar('c')).to.be.undefined;
        expect(p2.members.bar('a')).to.equal(1);
        expect(p2.members.bar('c')).to.equal(5);
    });
});

describe('Calling the Protocol#mod method with a non-mod object', function () {
    it('returns a new protocol whose options integrate the given object\'s own properties', function () {
        var opts = { a: 1, b: 2, c: 3 }, getMod = function (opts) {
            return ({ foo: _.empty, bar: _.empty });
        };
        var p = new Protocol(opts, getMod);
        var p2 = p.mod({ a: 3, b: 'bbb', y: 'yyy', z: 99 });
        expect(p2.options).to.deep.equal({ a: 3, b: 'bbb', c: 3, y: 'yyy', z: 99 });
    });
});
//# sourceMappingURL=protocol.js.map
