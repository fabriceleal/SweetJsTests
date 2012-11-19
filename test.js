/*
	A shortcut for the function keyword.
*/

macro λ {	
	case $params $body => {
		function $params $body
	}
	case $name:ident $params $body => {
		function $name $params $body
	}	
}

/*
	Let à là lisp.
*/
macro $let {
	case ( $($id:ident = $val:expr) (,) ... ) $body => { 
		(function ($id (,) ...) $body)($val (,) ...)
	}	
}

/*
	Constant combinator - returns a function that returns the same value.
*/
macro $konst {	
	case ($literal) => {
		(function(){
			return $literal;
		})
	}
	case (function $params $body) => {
		(function(){
			return function $params $body;
		})
	}
	case (λ $params $body) => {
		(function(){
			return function $params $body;
		})
	}
}

/*
	Assures that a function is called only once; 
	any other call returns the first return value, regardless of parameters
*/
macro $once {
	case (function $params $body) => {
		(function(){
			var excd = false;
			var r;
			return function(){
				if(!excd){
					excd = true;
					r = (function $params $body).apply(null, Array.prototype.slice.call(arguments));
				}				
				return r;
			}
		})()
	}
	case (λ $params $body) => {
		(function(){
			var excd = false;
			var r;
			return function(){
				if(!excd){
					excd = true;
					r = (function $params $body).apply(null, Array.prototype.slice.call(arguments));
				}				
				return r;
			}
		})()
	}
}

/*
	Macrofied y-combinator >:D
*/
macro $y {
	case ( $var ) => {
		function(){
			return function(f){
				return f(f)
			}(function(f){
				return $var(function(x){
					return f(f)(x);
				})
			});
		}()
	}
	case ( function $pars $body ) => {
		function(){
			return function(f){
				return f(f)
			}(function(f){
				return function $pars $body(function(x){
					return f(f)(x);
				})
			});
		}()
	}
	case ( λ $pars $body ) => {
		function(){
			return function(f){
				return f(f)
			}(function(f){
				return function $pars $body(function(x){
					return f(f)(x);
				})
			});
		}()
	}
}

/*
	Argument # n
*/
macro $a {
	case ($nbr) => {
		arguments[$nbr]
	}
}

/*
	Call With Arguments
*/
macro $cwa {
	case ($var) => {
		$var.apply(null, Array.prototype.slice.call(arguments))
	}
	case (function $pars $body) => {
		function $pars $body.apply(null, Array.prototype.slice.call(arguments))
	}
	case (λ $pars $body) => {
		function $pars $body.apply(null, Array.prototype.slice.call(arguments))
	}
};

/*
	A functional if. Translate this to macro?
*/
function fif(Predicate){
	return {
		fthen : function(ValueTrue){
			var wValueTrue = typeof ValueTrue == 'function'? ValueTrue : $konst(ValueTrue);
			
			return {
				felse : function(ValueFalse) {
					var wValueFalse = typeof ValueFalse == 'function' ? ValueFalse : $konst(ValueFalse);
					
					return function(){
						return $cwa(Predicate) ? $cwa(wValueTrue) : $cwa(wValueFalse);
					}
				},
				noelse : function(){
					// ...
				}
			}
		},
		nothen : function(){
			// ...
		}
	}
};

var f2 = fif(λ () { return $a(0) == $a(1); }).fthen(5).felse(2);

console.log(f2(1, 2));

// z is a function that squares its argument
var z = λ (b) { return b*b; };

// w is a function that always returns 123
var w = $konst(123);

// w2 is a function that always returns a function that squares its argument
var w2 = $konst(λ (b) { return b*b; });

// w3 is a function that always returns the same object
var w3 = $konst({ a: 1, b : 'asd'});

// f is the factorial function
var f = $y(λ(fact){ return λ(n){ return ( n == 0 ) ? 1 : n * fact(n - 1); }});

// d is a function that executes its arg only once;
var d = $once(λ(){
	console.log('called!'); 
	return 5; 
});

// v is a computation with new bindings
var v = $let(a='hello', b='world') {
	return a + ' ' + b;
};

// TESTS

console.log(f(5));
console.log('1st call');
console.log(d());
console.log('2nd call');
console.log(d());

console.log(v);
console.log(z(5));
console.log(w());
console.log(w2()(5));
