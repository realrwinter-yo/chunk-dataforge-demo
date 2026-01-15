/**
 * Executes a step function and awaits if necessary
 * @param {Function} fn - Step function
 * @param {*} value - Input value
 * @returns {Promise<*>} Result
 */
async function executeStep(fn, value) {
  const result = fn(value);
  return result instanceof Promise ? await result : result;
}

/**
 * Executes a single pipeline step with timing and error handling
 * @param {Object} step - Step configuration
 * @param {*} input - Input value
 * @returns {Promise<Object>} Step execution result
 */
async function runStep(step, input) {
  const startTime = Date.now();

  try {
    const output = await executeStep(step.fn, input);
    return {
      name: step.name,
      input,
      output,
      duration: Date.now() - startTime,
      success: true
    };
  } catch (err) {
    return {
      name: step.name,
      input,
      error: err.message,
      duration: Date.now() - startTime,
      success: false
    };
  }
}

/**
 * Creates a data processing pipeline
 * @returns {Object} Pipeline builder
 */
function createPipeline() {
  const steps = [];

  const pipeline = {
    addStep(name, fn) {
      if (!name || !fn || typeof fn !== 'function') {
        throw new Error('Step requires a valid name and function');
      }

      steps.push({ name, fn });
      return pipeline;
    },

    async execute(input) {
      const startTime = Date.now();
      const stepResults = [];
      let currentValue = input;

      for (const step of steps) {
        const result = await runStep(step, currentValue);
        stepResults.push(result);

        if (!result.success) {
          return {
            success: false,
            error: result.error,
            failedStep: result.name,
            steps: stepResults,
            executionTime: Date.now() - startTime
          };
        }

        currentValue = result.output;
      }

      return {
        success: true,
        output: currentValue,
        steps: stepResults,
        executionTime: Date.now() - startTime
      };
    },

    getSteps() {
      return steps.map(s => s.name);
    }
  };

  return pipeline;
}

module.exports = { createPipeline };
