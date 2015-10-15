# Finite-Domain Helpers

module.exports = (FD) ->

  SUB = 0 # WARNING: adjusting SUB to something negative means adjusting all tests. probably required for any change actually.
  SUP = 100000000
  ZERO_CHANGES = 0
  REJECTED = -1
  NOT_FOUND = -1
  # different from NOT_FOUND in that NOT_FOUND must be -1 because of the indexOf api
  # while NO_SUCH_VALUE must be a value that cannot be a legal domain value (<SUB or >SUP)
  NO_SUCH_VALUE = SUB-1 # make sure NO_SUCH_VALUE is not a value that may be valid in a domain
  DISABLED = true # slows down considerably when enabled, but ensures domains are proper only then
  DISABLE_DOMAIN_CHECK = true # also causes unrelated errors because mocha sees the expandos

  # For unit tests
  # Should be removed in production. Obviously.

  ASSERT = (bool, msg='', args...) ->
    unless !!bool
      console.error 'Assertion fail: ' + msg
      if args
        console.log 'Error args:', args
#      console.trace()
#      process.exit() # uncomment for quick error access :)
      throw new Error 'Assertion fail: ' + msg
    return

  # Simple function to completely validate a domain
  # Should be removed in production. Obviously.

  ASSERT_DOMAIN = (domain) ->
    if DISABLED
      return
    ASSERT !!domain, 'domains should be an array', domain
    ASSERT domain.length % 2 is 0, 'domains should contain pairs so len should be even', domain
    phi = SUB-2 # this means that the lowest `lo` can be, is SUB, csis requires at least one value gap
    for lo, index in domain by 2
      hi = domain[index+1]
      ASSERT lo >= SUB, 'lo should be gte to SUB '+' ['+lo+']', domain
      ASSERT hi >= SUB, 'hi should be gte to SUB '+' ['+hi+']', domain
      ASSERT hi <= SUP, 'hi should be lte to SUP'+' ['+hi+']', domain
      ASSERT lo <= hi, 'pairs should be lo<=hi'+' '+lo+' <= '+hi, domain
      ASSERT lo > phi+1, 'domains should be in csis form internally, end point apis should normalize input to this'+domain, domain
      phi = hi
    return

  # use this to verify that all domains set to an fdvar
  # are "fresh", and at least not in use by any fdvar yet

  ASSERT_UNUSED_DOMAIN = (domain) ->
    unless DISABLE_DOMAIN_CHECK
      ASSERT !domain._fdvar_in_use, 'domains should be unique and not shared'
      domain._fdvar_in_use = true # asserted just so automatic removal strips this line as well
    return

  ASSERT_VARS = (vars) ->
    if DISABLED
      return
    for name, fdvar of vars
      ASSERT_DOMAIN fdvar.dom
    return

  ASSERT_SPACE = (space) ->
    if DISABLED
      return
    # TBD: expand with other assertions...
    ASSERT_VARS space.vars
    return


  FD.helpers = {
    REJECTED
    SUB
    SUP
    NOT_FOUND
    NO_SUCH_VALUE
    ZERO_CHANGES

    ASSERT
    ASSERT_DOMAIN
    ASSERT_SPACE
    ASSERT_UNUSED_DOMAIN
    ASSERT_VARS
  }
