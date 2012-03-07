/*!
 * This file is part of Aloha Editor
 * Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
 * Licensed unter the terms of http://www.aloha-editor.com/license.html
 */
// Ensure GENTICS Namespace
GENTICS = window.GENTICS || {};
GENTICS.Utils = GENTICS.Utils || {};

define( "util/lang", [], function(){

	return {
		/**
		 * Implements unique() using the browser's sort().
		 *
		 * @param array
		 *        The array to sort and strip of duplicate values.
		 * @param compFunc
		 *        A custom comparison function that accepts two values
		 *        a and b from the given array and returns -1, 0, 1
		 *        depending on whether a < b, a == b, a > b respectively.
		 *        If no compFunc is provided, the algorithm will the
		 *        browsers default sort behaviour and a loosely
		 *        comparison to detect duplicates.
		 * @return
		 *        A sorted array containing all values from the given array
		 *        excluding duplicates.
		 */
		"sortUnique": function( array, compFunc ){
			if ( 0 === array.length ) {
				return [];
			}

			var sorted = array.slice();
			if ( compFunc ) {
				sorted.sort( compFunc );
			} else {
				sorted.sort();
			}

			var result = new Array( sorted.length );
			var lastValue = sorted[ 0 ]; // array.length >= 1 checked above
			result[ 0 ] = lastValue;

			var j = 1;
			var len = sorted.length;
			for ( var i = 1; i < len; i++ ) {
				var value = sorted[ i ];
				// Use loosely typed comparsion if no compFunc is given
				// to avoid sortUnique( [6, "6", 6] ) => [6, "6", 6]
				if ( compFunc ? 0 !== compFunc( lastValue, value ) : lastValue != value ) {
					lastValue = result[ j++ ] = value;
				}
			}
			return result.slice(0, j);
		}
	};
} );

// Start Closure
(function(window, undefined) {
	"use strict";
	var
		jQuery = window.alohaQuery || window.jQuery, $ = jQuery,
		GENTICS = window.GENTICS,
		Class = window.Class,
		console = window.console;

/**
 * Takes over all properties from the 'properties' object to the target object.
 * If a property in 'target' with the same name as a property in 'properties' is already defined it is overridden.
 *
 * Example:
 *
 * var o1 = {a : 1, b : 'hello'};
 * var o2 = {a : 3, c : 'world'};
 *
 * GENTICS.Utils.applyProperties(o1, o2);
 *
 * Will result in an o1 object like this:
 *
 * {a : 3, b: 'hello', c: 'world'}
 *
 * @static
 * @return void
 */
GENTICS.Utils.applyProperties = function (target, properties) {
	var name;
	for (name in properties) {
		if (properties.hasOwnProperty(name)) {
			target[name] = properties[name];
		}
	}
};

/**
 * Generate a unique hexadecimal string with 4 charachters
 * @return {string}
 */
GENTICS.Utils.uniqeString4 = function () {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

/**
 * Generate a unique value represented as a 32 character hexadecimal string,
 * such as 21EC2020-3AEA-1069-A2DD-08002B30309D
 * @return {string}
 */
GENTICS.Utils.guid = function () {
	var S4 = GENTICS.Utils.uniqeString4;
	return (S4()+S4()+'-'+S4()+'-'+S4()+'-'+S4()+'-'+S4()+S4()+S4());
};

})(window);
