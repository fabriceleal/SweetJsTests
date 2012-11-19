/*
	A short cut for function
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
	Let à là lisp
*/
macro $let {
	case ( $($id:ident = $val:expr) (,) ... ) $body => { 
		/*(function(){		
			$(var $id = $val;) ...
			var ____r = (function() $body)();
			return ____r;
		})()*/
		(function ($id (,) ...) $body)($val (,) ...)
	}	
}

/*
	Constant combinator - returns a function that returns the same value
*/
macro $K {	
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
/**/

var z = λ (b) { return b*b; };
var w = $K(123);
var w2 = $K(λ (b) { return b*b; });

var v = $let(a='hello', b='world') {
	return a + ' ' + b;
};

console.log(v);
console.log(z(5));
console.log(w());
console.log(w2()(5));

/*λ print (a) {
	console.log(a); 
};*/

/*var a = λ (a) {
	return (a + 1); 
};*/

//var f = $K(5);

//var z = $K();
//console.log($K(λ r { return r*r;} )()(5));
//console.log(z()(5));

//print(4);
//console.log(a(2));
//console.log(λ(a){ return a+a;}(3));
/*

*/