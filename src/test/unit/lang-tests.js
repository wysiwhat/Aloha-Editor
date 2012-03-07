/*!
 * This file is part of Aloha Editor
 * Author & Copyright (c) 2010 Gentics Software GmbH, aloha@gentics.com
 * Licensed unter the terms of http://www.aloha-editor.com/license.html
 */

define(
[],
function( ) {
	"use strict";

	Aloha.ready( function() {
		var Lang = Aloha.require( "util/lang" );
		var $ = Aloha.require( "aloha/jquery" );

		module('sortUnique');

		test('loose compare', function() {
			var unique = Lang.sortUnique( [ 6, 3, 6, 3, "6", 3, "9", 9, 3, 2, 1 ] );
			// Either numeric or string values for "6" and "9" may be chosen
			for ( var i = 0; i < unique.length; i++ ) {
				unique[ i ] = parseInt( unique[ i ] );
			}
			deepEqual( unique, [ 1, 2, 3, 6, 9 ] );
		});

		test('strict comparison', function() {
			var unique = Lang.sortUnique( [ 6, 3, "6", 3, 6, 3, "9", 9, 3, 2, 1 ], function(a,b){
				return typeof a < typeof b ? -1
					: ( typeof a > typeof b ? 1
						: ( a < b ? -1 : ( a > b ? 1 : 0 )));
			});
			deepEqual( unique, [ 1, 2, 3, 6, 9, "6", "9" ] );
		});

		test('comparator', function() {
			var unique = Lang.sortUnique( [ 7, 6, 9, 6, 9, 8 ], function( a, b ) {
				// Pretend 6 and 9 is equal
				if ( a === 9 ) {
					a = 6;
				}
				if ( b === 9 ) {
					b = 6;
				}
				return a < b ? -1 : ( a === b ? 0 : +1 );
			});
			deepEqual( unique, [ 6, 7, 8 ] );
		});
	});
});
