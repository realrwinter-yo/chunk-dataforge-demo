/**
 * Creates a chainable data processing pipeline.
 *
 * A pipeline is a sequence of named steps, each of which transforms the
 * output of the previous step. Steps are added with `addStep` and executed
 * in registration order via `execute`.
 *
 * If any step throws, execution stops immediately and the result reflects
 * the failure — subsequent steps are not run. This makes pipelines suitable
 * for workflows where each stage depends on the prior stage succeeding.
 *
 * Both sync and async step functions are supported.
 *
 * @returns {{ addStep: Function, execute: Function, getSteps: Function }}
 *   A pipeline builder object. See method-level docs below for details.
 *
 * @example
 * const pipeline = createPipeline()
 *   .addStep('parse',    (csv) => csvToJson(csv))
 *   .addStep('validate', (rows) => rows.filter(r => r.email))
 *   .addStep('export',   (rows) => exportToJson(rows));
 *
 * const result = await pipeline.execute(csvString);
 * if (result.success) {
 *   console.log(result.output);       // final transformed value
 * } else {
 *   console.error(result.failedStep); // name of the step that threw
 *   console.error(result.error);      // error message
 * }
 */
function createPipeline() {
  const steps = [];

  const pipeline = {
    /**
     * Appends a named step to the pipeline.
     *
     * Steps are executed in the order they are added. Each step receives
     * the output of the previous step (or the original `input` for the
     * first step) as its sole argument.
     *
     * `addStep` returns the pipeline instance so calls can be chained.
     *
     * @param {string} name - A descriptive label for the step, used in
     *   execution results and error reporting.
     * @param {Function} fn - The step function. May be synchronous or async.
     *   Receives the current pipeline value and should return the next value.
     * @returns {Object} The pipeline instance (for chaining).
     * @throws {Error} If `name` is missing, `fn` is missing, or `fn` is not
     *   a function.
     */
    addStep: function(name, fn) {
      if (!name) {
        throw new Error('Step name is required');
      }
      if (!fn) {
        throw new Error('Step function is required');
      }
      if (typeof fn !== 'function') {
        throw new Error('Step must be a function');
      }

      steps.push({ name: name, fn: fn });
      return pipeline;
    },

    /**
     * Runs all registered steps in order, passing each step's output as
     * the next step's input. Execution halts at the first failing step.
     *
     * Every step's timing and input/output values are recorded regardless
     * of success or failure, making the result useful for diagnostics.
     *
     * @param {*} input - The initial value passed to the first step.
     * @returns {Promise<{
     *   success: true,
     *   output: any,
     *   steps: Array<{ name: string, input: any, output: any, duration: number, success: boolean }>,
     *   executionTime: number
     * } | {
     *   success: false,
     *   error: string,
     *   failedStep: string,
     *   steps: Array<{ name: string, input: any, error: string, duration: number, success: boolean }>,
     *   executionTime: number
     * }>} Resolves (never rejects) with a result object describing success or
     *   failure. All durations are in milliseconds.
     */
    execute: async function(input) {
      const startTime = Date.now();
      const stepResults = [];
      let currentValue = input;
      let success = true;
      let error = null;
      let failedStep = null;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepStart = Date.now();

        try {
          let result;
          // Check if function is async
          if (step.fn.constructor.name === 'AsyncFunction') {
            result = await step.fn(currentValue);
          } else {
            result = step.fn(currentValue);
            // Handle promise returns from non-async functions
            if (result !== null && result !== undefined) {
              if (result instanceof Promise) {
                result = await result;
              }
            }
          }

          const stepEnd = Date.now();
          stepResults.push({
            name: step.name,
            input: currentValue,
            output: result,
            duration: stepEnd - stepStart,
            success: true
          });

          currentValue = result;
        } catch (err) {
          const stepEnd = Date.now();
          stepResults.push({
            name: step.name,
            input: currentValue,
            error: err.message,
            duration: stepEnd - stepStart,
            success: false
          });

          success = false;
          error = err.message;
          failedStep = step.name;
          break;
        }
      }

      const endTime = Date.now();

      if (success) {
        return {
          success: true,
          output: currentValue,
          steps: stepResults,
          executionTime: endTime - startTime
        };
      } else {
        return {
          success: false,
          error: error,
          failedStep: failedStep,
          steps: stepResults,
          executionTime: endTime - startTime
        };
      }
    },

    /**
     * Returns an ordered list of step names registered on this pipeline.
     *
     * Useful for inspecting pipeline composition before execution.
     *
     * @returns {string[]} Step names in registration order.
     */
    getSteps: function() {
      return steps.map(function(s) {
        return s.name;
      });
    }
  };

  return pipeline;
}

module.exports = { createPipeline };
