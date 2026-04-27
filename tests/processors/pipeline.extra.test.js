const { createPipeline } = require('../../src/processors/pipeline');

describe('Pipeline Processor – additional coverage', () => {
  describe('addStep validation', () => {
    test('throws when step name is missing', () => {
      const pipeline = createPipeline();
      expect(() => pipeline.addStep(null, (x) => x)).toThrow('Step name is required');
    });

    test('throws when step name is empty string', () => {
      const pipeline = createPipeline();
      expect(() => pipeline.addStep('', (x) => x)).toThrow('Step name is required');
    });

    test('throws when step function is missing', () => {
      const pipeline = createPipeline();
      expect(() => pipeline.addStep('myStep', null)).toThrow('Step function is required');
    });

    test('throws when step is not a function', () => {
      const pipeline = createPipeline();
      expect(() => pipeline.addStep('myStep', 'notAFunction')).toThrow('Step must be a function');
    });

    test('throws when step is a plain object', () => {
      const pipeline = createPipeline();
      expect(() => pipeline.addStep('myStep', { fn: (x) => x })).toThrow('Step must be a function');
    });
  });

  describe('getSteps', () => {
    test('returns empty array for pipeline with no steps', () => {
      const pipeline = createPipeline();
      expect(pipeline.getSteps()).toEqual([]);
    });

    test('returns step names in insertion order', () => {
      const pipeline = createPipeline()
        .addStep('first', (x) => x)
        .addStep('second', (x) => x)
        .addStep('third', (x) => x);

      expect(pipeline.getSteps()).toEqual(['first', 'second', 'third']);
    });
  });

  describe('empty pipeline execution', () => {
    test('executes empty pipeline and returns the input as output', async () => {
      const pipeline = createPipeline();
      const result = await pipeline.execute(42);

      expect(result.success).toBe(true);
      expect(result.output).toBe(42);
      expect(result.steps).toEqual([]);
    });

    test('empty pipeline has a numeric executionTime', async () => {
      const pipeline = createPipeline();
      const result = await pipeline.execute('input');

      expect(typeof result.executionTime).toBe('number');
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('step returning null', () => {
    test('handles step that returns null and passes null to next step', async () => {
      const pipeline = createPipeline()
        .addStep('nullifier', () => null)
        .addStep('stringify', (x) => String(x));

      const result = await pipeline.execute('anything');

      expect(result.success).toBe(true);
      expect(result.output).toBe('null');
    });
  });

  describe('step returning undefined', () => {
    test('handles step that returns undefined', async () => {
      const pipeline = createPipeline()
        .addStep('voidStep', () => undefined);

      const result = await pipeline.execute('start');

      expect(result.success).toBe(true);
      expect(result.output).toBeUndefined();
    });
  });

  describe('async step error handling', () => {
    test('captures async step rejection', async () => {
      const pipeline = createPipeline()
        .addStep('asyncFail', async () => {
          throw new Error('async failure');
        })
        .addStep('unreachable', (x) => x);

      const result = await pipeline.execute(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('async failure');
      expect(result.failedStep).toBe('asyncFail');
    });
  });

  describe('chaining addStep', () => {
    test('addStep returns the pipeline for fluent chaining', () => {
      const pipeline = createPipeline();
      const returned = pipeline.addStep('step', (x) => x);

      expect(returned).toBe(pipeline);
    });
  });

  describe('step result tracking', () => {
    test('each step result includes name, input, output, duration, and success', async () => {
      const pipeline = createPipeline()
        .addStep('increment', (x) => x + 1);

      const result = await pipeline.execute(10);

      expect(result.steps[0].name).toBe('increment');
      expect(result.steps[0].input).toBe(10);
      expect(result.steps[0].output).toBe(11);
      expect(typeof result.steps[0].duration).toBe('number');
      expect(result.steps[0].success).toBe(true);
    });

    test('failed step result includes error, not output', async () => {
      const pipeline = createPipeline()
        .addStep('explode', () => { throw new Error('boom'); });

      const result = await pipeline.execute(0);

      expect(result.steps[0].success).toBe(false);
      expect(result.steps[0].error).toBe('boom');
      expect(result.steps[0].output).toBeUndefined();
    });
  });

  describe('promise-returning non-async step', () => {
    test('awaits promise returned from a regular function', async () => {
      const pipeline = createPipeline()
        .addStep('promiseStep', (x) => Promise.resolve(x * 2));

      const result = await pipeline.execute(5);

      expect(result.success).toBe(true);
      expect(result.output).toBe(10);
    });
  });
});
