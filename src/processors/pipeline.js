/**
 * Creates a data processing pipeline
 * @returns {Object} Pipeline builder
 */
function createPipeline() {
  const steps = [];

  const pipeline = {
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

    getSteps: function() {
      return steps.map(function(s) {
        return s.name;
      });
    }
  };

  return pipeline;
}

module.exports = { createPipeline };
