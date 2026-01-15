const { createPipeline } = require('../../src/processors/pipeline');

describe('Pipeline Processor', () => {
  describe('basic pipeline', () => {
    test('executes steps in order', async () => {
      const pipeline = createPipeline()
        .addStep('double', (x) => x * 2)
        .addStep('addTen', (x) => x + 10);

      const result = await pipeline.execute(5);

      expect(result.output).toBe(20); // (5 * 2) + 10
      expect(result.steps).toHaveLength(2);
    });

    test('tracks step execution', async () => {
      const pipeline = createPipeline()
        .addStep('first', (x) => x + 1)
        .addStep('second', (x) => x * 2);

      const result = await pipeline.execute(0);

      expect(result.steps[0].name).toBe('first');
      expect(result.steps[0].output).toBe(1);
      expect(result.steps[1].name).toBe('second');
      expect(result.steps[1].output).toBe(2);
    });
  });

  describe('async steps', () => {
    test('handles async step functions', async () => {
      const pipeline = createPipeline()
        .addStep('async', async (x) => {
          return x * 3;
        });

      const result = await pipeline.execute(7);

      expect(result.output).toBe(21);
    });
  });

  describe('error handling', () => {
    test('captures step errors', async () => {
      const pipeline = createPipeline()
        .addStep('first', (x) => x + 1)
        .addStep('failing', () => {
          throw new Error('Step failed');
        })
        .addStep('third', (x) => x * 2);

      const result = await pipeline.execute(5);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.failedStep).toBe('failing');
    });

    test('stops execution on error', async () => {
      const stepsCalled = [];
      const pipeline = createPipeline()
        .addStep('first', (x) => {
          stepsCalled.push('first');
          return x;
        })
        .addStep('failing', () => {
          stepsCalled.push('failing');
          throw new Error('Oops');
        })
        .addStep('third', (x) => {
          stepsCalled.push('third');
          return x;
        });

      await pipeline.execute(1);

      expect(stepsCalled).toEqual(['first', 'failing']);
    });
  });

  describe('pipeline metadata', () => {
    test('returns execution time', async () => {
      const pipeline = createPipeline()
        .addStep('wait', async (x) => {
          return x;
        });

      const result = await pipeline.execute(1);

      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe('number');
    });
  });
});
