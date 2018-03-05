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
