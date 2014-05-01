/*
  return false
  a = b
became
  return tracer.traceReturnValue( false
  )a = b
which is a syntax error
*/
function foo() {
	return false
	a = b
}
