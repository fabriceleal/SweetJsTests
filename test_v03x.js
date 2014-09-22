// UPDATE FOR v0.3.x

// unable to use the λ, not sure if node-on-windows or sweetjs problem
macro L {
	rule {{ $body ...} } => {
		function() {
			$body ...
		}
	}
	rule {($params ...) { $body ...} } => {
		function ($params ...) {
			$body ...
		}
	}
	rule {$name ($params ...) { $body ...} } => {
		function $name ($params ...) {
			$body ...
		}
	}
};

var zero = L {return 0;};
var id = L (a){return a;};
L add1(z){
	return z+1;
}
console.log(zero("abc"));
console.log(id(23));
console.log(add1(2));

/*
	Let à là lisp.
*/
macro $let {
	rule { ( $($id:ident = $val:expr) (,) ... ) { $body ... } } => { 
		(function ($id (,) ...) {
			$body ...
		})($val (,) ...)
	}	
}

var v = $let(a='hello', b='world') {
	return a + ' ' + b;
};

console.log(v);

/*
	Constant combinator - returns a function that returns the same value.
*/
macro $konst {	
	rule {($literal)} => {
		(function(){
			return $literal;
		})
	}
	rule {(function $params $body)} => {
		(function(){
			return function $params $body;
		})
	}
	rule {(L $params $body)} => {
		(function(){
			return function $params $body;
		})
	}
}

// w is a function that always returns 123
var w = $konst(123);

// w2 is a function that always returns a function that squares its argument
var w2 = $konst(L (b) { return b*b; });

// w3 is a function that always returns the same object
var w3 = $konst({ a: 1, b : 'asd'});

console.log(w());
console.log(w2()(3));
console.log(w3());

/*
	Assures that a function is called only once; 
	any other call returns the first return value, regardless of parameters
*/
macro $once {
	rule{(function $params $body)} => {
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
	rule{(L $params $body)} => {
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
};

var fromDb = $once(L() {
	console.log('fetching from db ...');
	return 0xdeadbeaf;
});
console.log(fromDb());
console.log(fromDb());
console.log(fromDb());

/*
	Macrofied y-combinator >:D
*/
macro $y {
	rule {( $var )} => {
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
	rule {( function $pars $body )} => {
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
	rule {( L $pars $body )} => {
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
};

// f is the factorial function
var f = $y(L(fact){ return L(n){ return ( n == 0 ) ? 1 : n * fact(n - 1); }});

console.log(f(3));
console.log(f(4));
console.log(f(5));

/*
	Argument # n
*/
macro $a {
	rule {($nbr)} => {
		arguments[$nbr]
	}
}

/*
	Call With Arguments
*/
macro $cwa {
	rule {($var)} => {
		$var.apply(null, Array.prototype.slice.call(arguments))
	}
	rule {(function $pars $body)} => {
		function $pars $body.apply(null, Array.prototype.slice.call(arguments))
	}
	rule {(L $pars $body)} => {
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

/* Look ma, I dont need '()' :D */
var f2 = fif(L { return $a(0) == $a(1); }).fthen('yes').felse('no');

console.log(f2(1, 2));
console.log(f2(2, 2));

/* Another factorial function */
var f2 = $y(L(fact){ return L { return ( $a(0) == 0 ) ? 1 : $a(0) * fact($a(0) - 1); }});

console.log(f2(3));
console.log(f2(4));
console.log(f2(5));
