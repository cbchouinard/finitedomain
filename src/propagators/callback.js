import {
  REJECTED,
  ZERO_CHANGES,
} from '../helpers';

// BODY_START

/**
 * Given function should be called each step, passing on the current variables and
 * space, and return whether their state is acceptable or not. Rejects when not.
 * The callback call will block the FD search (or at least the current "thread").
 *
 * @param space
 * @param varNames
 * @param func
 * @returns {*}
 */
function propagator_callbackStepBare(space, varNames, func) {
  // the callback should return `false` if the state should be rejected, `true` otherwise
  if (func(space, varNames)) {
    return ZERO_CHANGES;
  }
  return REJECTED;
}

// BODY_STOP

export default propagator_callbackStepBare;