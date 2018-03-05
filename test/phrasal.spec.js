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

    it('should call phrasal function and bind to "this"', () => {
      class TestClass {
        constructor() {
          this.foo = true;
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
          return [options, args, this];
        }
      }
      const obj = new TestClass();
      const result = obj.make.my.day({ party: true });
      expect(result).to.have.lengthOf(3);
      const [options, args, bind] = result;
      expect(options).to.be.deep.equal({ who: 'my', what: 'day' });
      expect(args).to.be.deep.equal([{ party: true }]);
      expect(bind).to.be.deep.equal({ foo: true, make: {} });
    });

    it('should create values dynamically if values is a function', () => {
      const my = phrasal({
        fn: (options, ...args) => [options, args],
        path: [
          { key: 'animal', values: ['dog', 'cat'] },
          { key: 'is' },
          { key: 'action',
            values: ({ animal }) =>
              (animal === 'dog' ? ['barking', 'chewing', 'playing'] : ['purring', 'playing']) },
        ],
      });
      const [options] = my.dog.is.chewing();
      expect(options).to.be.deep.equal({ animal: 'dog', is: 'is', action: 'chewing' });
      const [options2] = my.cat.is.purring();
      expect(options2).to.be.deep.equal({ animal: 'cat', is: 'is', action: 'purring' });
      expect(() => my.dog.is.purring()).to.throw(Error);
    });
  });

  describe('proxy', () => {
    it('should proxy object and bind implicitly to "this" / fix option', () => {
      class TestClass {
        constructor() {
          this.foo = true;
        }
        test(options, ...args) {
          return [options, args, this];
        }
      }
      const obj = new TestClass();
      const pxy = proxy(obj, {
        fn: obj.test,
        path: [
          { key: 'make' },
          { key: 'who', values: ['my', 'your'] },
          { key: 'what', values: ['day', 'hour', 'minute'] },
        ],
      });
      const result = pxy.make.my.day({ party: true });
      expect(result).to.have.lengthOf(3);
      const [options, args, bind] = result;
      expect(options).to.be.deep.equal({ make: 'make', who: 'my', what: 'day' });
      expect(args).to.be.deep.equal([{ party: true }]);
      expect(bind).to.be.deep.equal({ foo: true });
    });

    it('should proxy object and bind implicitly to "this" / fix option / 2', () => {
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
