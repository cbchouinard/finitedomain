SUP = 100000

spec_d_create_range = (lo, hi) ->
  if typeof lo isnt 'number'
    throw new Error 'spec_d_create_value requires a number'
  if typeof hi isnt 'number'
    throw new Error 'spec_d_create_value requires a number'
  return spec_d_create_ranges [lo, hi]
spec_d_create_ranges = (ranges...) ->
  arr = []
  ranges.forEach (range) ->
    unless range instanceof Array
      throw 'Expecting each range to be an array'
    unless range.length is 2
      throw 'Expecting each range to be [lo,hi]'
    unless typeof range[0] is 'number'
      throw 'Expecting ranges to be numbers'
    unless typeof range[1] is 'number'
      throw 'Expecting ranges to be numbers'
    arr.push range[0], range[1]

  # hack. makes sure the DOMAIN_CHECK test doesnt trigger a fail for adding that property...
  return arr
spec_d_create_value = (value) ->
  if typeof value isnt 'number'
    throw new Error 'spec_d_create_value requires a number'
  return spec_d_create_ranges [value, value]
spec_d_create_list = (list) ->
  arr = []
  list.forEach (value) -> arr.push value, value
  return arr
spec_d_create_zero = ->
  return spec_d_create_range 0, 0
spec_d_create_one = ->
  return spec_d_create_range 1, 1
spec_d_create_full = ->
  return spec_d_create_range 0, SUP
spec_d_create_bool = ->
  return spec_d_create_range 0, 1

strip_anon_vars = (solution) ->
  for name of solution
    if String(parseFloat(name)) is name # only true of name is a number
      delete solution[name]
  return solution

strip_anon_vars_a = (solutions) ->
  for solution in solutions
    strip_anon_vars solution
  return solutions

module.exports = {
  spec_d_create_range
  spec_d_create_ranges
  spec_d_create_value
  spec_d_create_list
  spec_d_create_zero
  spec_d_create_one
  spec_d_create_full
  spec_d_create_bool
  strip_anon_vars
  strip_anon_vars_a
}
