import {
  EMPTY,

  ASSERT,
  ASSERT_NUMSTRDOM,
} from '../helpers';

import {
  domain_createRange,
  domain_createValue,
  domain_getValue,
} from '../domain';

// BODY_START

let REIFIER_FAIL = 0;
let REIFIER_PASS = 1;

/**
 * A boolean variable that represents whether a comparison
 * condition between two variables currently holds or not.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 * @param {Function} opFunc like propagator_ltStepBare
 * @param {Function} nopFunc opposite of opFunc like propagator_gtStepBare
 * @param {string} opName
 * @param {string} invOpName
 * @param {Function} opRejectChecker
 * @param {Function} nopRejectChecker
 */
function propagator_reifiedStepBare(space, config, leftVarIndex, rightVarIndex, resultVarIndex, opFunc, nopFunc, opName, invOpName, opRejectChecker, nopRejectChecker) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof leftVarIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof rightVarIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof resultVarIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof opName === 'string', 'OP_SHOULD_BE_NUMBER');
  ASSERT(typeof invOpName === 'string', 'NOP_SHOULD_BE_NUMBER');

  let vardoms = space.vardoms;
  let domResult = vardoms[resultVarIndex];

  let value = domain_getValue(domResult);
  ASSERT(value === REIFIER_FAIL || value === REIFIER_PASS || domResult === domain_createRange(0, 1), 'RESULT_DOM_SHOULD_BE_BOOL_BOUND [was' + domResult + ']');

  if (value === REIFIER_FAIL) {
    nopFunc(space, config, leftVarIndex, rightVarIndex);
  } else if (value === REIFIER_PASS) {
    opFunc(space, config, leftVarIndex, rightVarIndex);
  } else {
    let domain1 = vardoms[leftVarIndex];
    let domain2 = vardoms[rightVarIndex];

    ASSERT_NUMSTRDOM(domain1);
    ASSERT_NUMSTRDOM(domain2);
    ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
    ASSERT(domResult === domain_createRange(0, 1), 'result should be bool now because we already asserted it was either zero one or bool and it wasnt zero or one');

    // we'll need to confirm both in any case so do it first now
    let opRejects = opRejectChecker(domain1, domain2);
    let nopRejects = nopRejectChecker(domain1, domain2);

    // if op and nop both reject then we cant fulfill the constraints
    // otherwise the reifier must solve to the other op
    if (nopRejects) {
      if (opRejects) {
        vardoms[resultVarIndex] = EMPTY;
      } else {
        vardoms[resultVarIndex] = domain_createValue(REIFIER_PASS);
        opFunc(space, config, leftVarIndex, rightVarIndex);
      }
    } else if (opRejects) {
      vardoms[resultVarIndex] = domain_createValue(REIFIER_FAIL);
      nopFunc(space, config, leftVarIndex, rightVarIndex);
    }
  }
}

// BODY_STOP

export default propagator_reifiedStepBare;
