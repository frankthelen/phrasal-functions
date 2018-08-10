require('./test-helper');
const { phrasal, proxy } = require('..');

describe('phrasal-functions', () => {
  describe('phrasal', () => {
    it('should call phrasal function', () => {
      const make = phrasal({
        fn: (options, ...args) => [options, args],
        path: [
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
      });
      const result = make.my.day({ party: true });
      expect(result).to.have.lengthOf(2);
      const [options, args] = result;
      expect(options).to.be.deep.equal({ who: 'my', what: 'day' });
      expect(args).to.be.deep.equal([{ party: true }]);
    });

    it('should call phrasal async function', async () => {
      const make = phrasal({
        fn: async (options, ...args) => Promise.resolve([options, args]),
        path: [
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
      });
      const result = await make.your.minute({ party: false });
      expect(result).to.have.lengthOf(2);
      const [options, args] = result;
      expect(options).to.be.deep.equal({ who: 'your', what: 'minute' });
      expect(args).to.be.deep.equal([{ party: false }]);
    });

    it('should call phrasal function and explicitly bind to "this"', () => {
      class TestClass {
        constructor() {
          this.foo = 'baz';
          this.make = phrasal({
            fn: this.test,
            bind: this,
            path: [
              { key: 'who', values: ['my', 'your'] },
              { key: 'what', values: ['day', 'hour', 'minute'] },
            ],
          });
        }

        test(options, ...args) {
          return [options, args, this.foo];
        }
      }
      const obj = new TestClass();
      const result = obj.make.my.day({ party: true });
      expect(result).to.have.lengthOf(3);
      const [options, args, bind] = result;
      expect(options).to.be.deep.equal({ who: 'my', what: 'day' });
      expect(args).to.be.deep.equal([{ party: true }]);
      expect(bind).to.be.deep.equal('baz');
    });

    it('should create values dynamically if values is a function', () => {
      const my = phrasal({
        fn: (options, ...args) => [options, args],
        path: [
          { key: 'animal', values: ['dog', 'cat'] },
          { key: 'is' },
          { key: 'action',
            values: ({ animal }) => (
              animal === 'dog' ? ['barking', 'chewing', 'playing'] : ['purring', 'playing']
            ) },
        ],
      });
      const [options] = my.dog.is.chewing();
      expect(options).to.be.deep.equal({ animal: 'dog', is: 'is', action: 'chewing' });
      const [options2] = my.cat.is.purring();
      expect(options2).to.be.deep.equal({ animal: 'cat', is: 'is', action: 'purring' });
      expect(() => my.dog.is.purring()).to.throw(Error);
    });

    it('should support multiple paths', () => {
      const make = phrasal({
        fn: (options, ...args) => ['1', options, args],
        path: [
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
      }, {
        fn: (options, ...args) => ['2', options, args],
        path: [
          { key: 'foo', values: ['bar', 'baz'] },
        ],
      });
      const result = make.your.hour({ party: true });
      const [id, options, args] = result;
      expect(id).to.be.equal('1');
      expect(options).to.be.deep.equal({ who: 'your', what: 'hour' });
      expect(args).to.be.deep.equal([{ party: true }]);
      const result2 = make.baz({ foo: true });
      const [id2, options2, args2] = result2;
      expect(id2).to.be.equal('2');
      expect(options2).to.be.deep.equal({ foo: 'baz' });
      expect(args2).to.be.deep.equal([{ foo: true }]);
    });

    it('should throw error if unknown word', () => {
      const make = phrasal({
        fn: () => {}, // dummy
        path: [
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
      });
      expect(() => make.my.tiny.day()).to.throw('unknown word in phrasal function: "tiny"');
    });

    it('should throw error if unknown word / first fragment does not match any path', () => {
      const make = phrasal({
        fn: () => {}, // dummy
        path: [
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
      });
      expect(() => make.bla.my.tiny.day()).to.throw('Cannot read property \'my\' of undefined');
    });

    it('should throw error if unknown word / extra last fragment', () => {
      const make = phrasal({
        fn: () => {}, // dummy
        path: [
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
      });
      expect(() => make.my.day.today()).to.throw('make.my.day.today is not a function');
    });

    it('should ignore floating elements if not provided', () => {
      const make = phrasal({
        fn: (options, ...args) => [options, args],
        path: [
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
        floating: [
          { key: 'not' },
        ],
      });
      const result = make.my.day({ party: true });
      expect(result).to.have.lengthOf(2);
      const [options, args] = result;
      expect(options).to.be.deep.equal({ who: 'my', what: 'day' });
      expect(args).to.be.deep.equal([{ party: true }]);
    });

    it('should accept floating element at position 0 / fixed', () => {
      const make = phrasal({
        fn: (options, ...args) => [options, args],
        path: [
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
        floating: [
          { key: 'not' },
        ],
      });
      const result = make.not.my.day({ party: true });
      expect(result).to.have.lengthOf(2);
      const [options, args] = result;
      expect(options).to.be.deep.equal({ not: 'not', who: 'my', what: 'day' });
      expect(args).to.be.deep.equal([{ party: true }]);
    });

    it('should accept floating element at position 1 / static values', () => {
      const make = phrasal({
        fn: (options, ...args) => [options, args],
        path: [
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
        floating: [
          { key: 'not', values: ['not', 'no'] },
        ],
      });
      const result = make.my.no.day({ party: true });
      expect(result).to.have.lengthOf(2);
      const [options, args] = result;
      expect(options).to.be.deep.equal({ not: 'no', who: 'my', what: 'day' });
      expect(args).to.be.deep.equal([{ party: true }]);
    });

    it('should accept floating fixed element with dynamic options', () => {
      const make = phrasal({
        fn: (options, ...args) => [options, args],
        path: [
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
        floating: [
          { key: 'not', values: () => ['not', 'no', 'none'] },
        ],
      });
      const result = make.my.none.day({ party: true });
      expect(result).to.have.lengthOf(2);
      const [options, args] = result;
      expect(options).to.be.deep.equal({ not: 'none', who: 'my', what: 'day' });
      expect(args).to.be.deep.equal([{ party: true }]);
    });

    it('should accept multiple floating elements', () => {
      const make = phrasal({
        fn: (options, ...args) => [options, args],
        path: [
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
        floating: [
          { key: 'not', values: () => ['not', 'no', 'none'] },
          { key: 'to' },
        ],
      });
      const result = make.not.to.my.day({ party: true });
      expect(result).to.have.lengthOf(2);
      const [options, args] = result;
      expect(options).to.be.deep.equal({ not: 'not', to: 'to', who: 'my', what: 'day' });
      expect(args).to.be.deep.equal([{ party: true }]);
    });
  });

  describe('proxy', () => {
    it('should proxy object and bind implicitly to "this" / class', () => {
      class TestClass {
        constructor() {
          this.foo = 'baz';
          this.qux = () => 'quux';
        }

        test(options, ...args) {
          return [options, args, this.foo, this.qux(), this.quux];
        }
      }
      const obj = new TestClass();
      const pxy = proxy(obj, {
        fn: obj.test,
        path: [
          { key: 'make' }, // fix option
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
      });
      const result = pxy.make.my.day({ party: true });
      expect(result).to.have.lengthOf(5);
      const [options, args, bind, bind2, bind3] = result;
      expect(options).to.be.deep.equal({ make: 'make', who: 'my', what: 'day' });
      expect(args).to.be.deep.equal([{ party: true }]);
      expect(bind).to.be.deep.equal('baz');
      expect(bind2).to.be.deep.equal('quux');
      expect(bind3).to.be.undefined;
    });

    it('should proxy object and bind implicitly to "this" / function', () => {
      const obj = { name: 'John' };
      const john = proxy(obj, {
        fn: function (options, arg) { // eslint-disable-line object-shorthand, func-names
          return { who: this.name, ...options, ...arg };
        },
        path: [
          { key: 'say' },
          { key: 'what', values: ['hello', 'goodbye', 'boo'] },
        ],
      });
      const result = john.say.goodbye({ to: 'Joe' });
      expect(result).to.be.deep.equal({ who: 'John', say: 'say', what: 'goodbye', to: 'Joe' });
      expect(john).to.be.deep.equal({ name: 'John' });
    });

    it('should proxy object but prefer own property', () => {
      class TestClass {
        constructor() {
          this.foo = 'baz';
        }
      }
      const obj = new TestClass();
      const pxy = proxy(obj, {
        fn: () => {},
        path: [
          { key: 'foo' },
        ],
      });
      expect(pxy.foo).to.be.equal('baz');
    });

    it('should proxy object but prefer own function', () => {
      class TestClass {
        constructor() {
          this.foo = () => 'baz';
        }
      }
      const obj = new TestClass();
      const pxy = proxy(obj, {
        fn: () => {},
        path: [
          { key: 'foo' },
        ],
      });
      expect(pxy.foo()).to.be.equal('baz');
    });
  });
});
