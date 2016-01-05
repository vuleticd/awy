/*
 * https://github.com/VerbalExpressions/JSVerbalExpressions
 * implementation
 */
class Awy_Core_Util_Vertex extends Class {
	constructor() {
		super();
		this.regexp = new RegExp();
		// Variables to hold the whole
		// expression construction in order
		this._prefixes = "";
		this._source = "";
		this._suffixes = "";
		this._modifiers = "gm"; // default to global multiline matching
	}

	// Sanitation function for adding
    // anything safely to the expression
    sanitize( value ) {
        if(value.source) return value.source;
        if(typeof value === "number") return value;
        return value.replace(/[^\w]/g, (character) => { return "\\" + character; });
    }

    // Function to add stuff to the
    // expression. Also compiles the
    // new expression so it's ready to
    // be used.
    add( value ) {
        this._source += value || "";
        this.regexp.compile(this._prefixes + this._source + this._suffixes, this._modifiers);
        return this;
    }

    // Start and end of line functions
    startOfLine( enable ) {
        enable = ( enable !== false );
        this._prefixes = enable ? "^" : "";
        this.add( "" );
        return this;
    }

    endOfLine( enable ) {
        enable = ( enable !== false );
        this._suffixes = enable ? "$" : "";
        this.add( "" );
        return this;
    }

    // We try to keep the syntax as
    // user-friendly as possible.
    // So we can use the "normal"
    // behaviour to split the "sentences"
    // naturally.
    // INSTEAD then() , CONFLICT WITH Promises
    next( value ) {
        value = this.sanitize( value );
        this.add( "(?:" + value + ")" );
        return this;
    }

    // And because we can't start with
    // "then" function ?????????????, we create an alias
    // to be used as the first function
    // of the chain.
    find( value ) {
        return this.next( value );
    }

    // Maybe is used to add values with ?
    maybe( value ) {
        value = this.sanitize(value);
        this.add( "(?:" + value + ")?" );
        return this;
    }

    // Any character any number of times
    anything() {
        this.add( "(?:.*)" );
        return this;
    }

    // Anything but these characters
    anythingBut( value ) {
        value = this.sanitize( value );
        this.add( "(?:[^" + value + "]*)" );
        return this;
    }

    // Any character at least one time
    something() {
        this.add( "(?:.+)" );
        return this;
    }

    // Any character at least one time except for these characters
    somethingBut( value ) {
        value = this.sanitize( value );
        this.add( "(?:[^" + value + "]+)" );
        return this;
    }

    // Shorthand function for the
    // String.replace function to
    // give more logical flow if, for
    // example, we're doing multiple
    // replacements on one regexp.
    replace( source, value ) {
        source = source.toString();
        return source.replace( this.regexp, value );
    }

    toString(){
    	return this.regexp.toString();
    }

    /// Add regular expression special ///
    /// characters                     ///

    // Line break
    lineBreak() {
        this.add( "(?:\\r\\n|\\r|\\n)" ); // Unix + windows CLRF
        return this;
    }
    // And a shorthand for html-minded
    br() {
        return this.lineBreak();
    }

    // Tab (duh?)
    tab() {
        this.add( "\\t" );
        return this;
    }

    // Any alphanumeric
    word() {
        this.add( "\\w+" );
        return this;
    }

    // Any given character
    anyOf( value ) {
        value = this.sanitize(value);
        this.add( "["+ value +"]" );
        return this;
    }

    // Shorthand
    any( value ) {
        return this.anyOf( value );
    }

    // Usage: .range( from, to [, from, to ... ] )
    range(...rest) {
        //var value = "[";

        for(var _to = 1; _to < rest.length; _to += 2) {
            var from = this.sanitize( rest[_to - 1] );
            var to = this.sanitize( rest[_to] );
            this.add( "[" + from + "-" + to + "]");
            //value += from + "-" + to;
        }

        //value += "]";

        //this.add( value );
        return this;
    }

    /// Modifiers      ///

    // Modifier abstraction
    addModifier( modifier ) {
        if( this._modifiers.indexOf( modifier ) == -1 ) {
            this._modifiers += modifier;
        }
        this.add("");
        return this;
    }
    removeModifier( modifier ) {
        this._modifiers = this._modifiers.replace( modifier, "" );
        this.add("");
        return this;
    }

    // Case-insensitivity modifier
    withAnyCase( enable ) {

        if(enable !== false) this.addModifier( "i" );
        else this.removeModifier( "i" );

        this.add( "" );
        return this;

    }

    // Default behaviour is with "g" modifier,
    // so we can turn this another way around
    // than other modifiers
    stopAtFirst( enable ) {

        if(enable !== false) this.removeModifier( "g" );
        else this.addModifier( "g" );

        this.add( "" );
        return this;

    }

    // Multiline, also reversed
    searchOneLine( enable ) {

        if(enable !== false) this.removeModifier( "m" );
        else this.addModifier( "m" );

        this.add( "" );
        return this;

    }

    // Repeats the previous item
    // exactly n times or
    // between n and m times.
    repeatPrevious(...rest) {
        var value;
        if(rest.length <= 1) {
            if(/\d+/.exec(rest[0]) !== null) {
                value = "{" + rest[0] + "}";
            }
        } else {
            var values = [];
            for(var i=0; i< rest.length; i++) {
              if(/\d+/.exec(rest[i]) !== null) {
                values.push(rest[i]);
              }
            }

            value = "{" + values.join(",") + "}";
        }

        this.add( value || "" );
        return this;
    }



    /// Loops  ///

    multiple( value ) {
        // Use expression or string

        value = value.source ? value.source : this.sanitize(value);
        if (arguments.length === 1) {
            this.add("(?:" + value + ")*");
        }
        if (arguments.length > 1) {
            this.add("(?:" + value + ")");
            this.add("{" + arguments[1] + "}");
        }
        return this;
    }

    // Adds alternative expressions
    or( value ) {
        this._prefixes += "(?:";
        this._suffixes = ")" + this._suffixes;

        this.add( ")|(?:" );
        if(value) this.next( value );

        return this;
    }

    //starts a capturing group
    beginCapture() {
        //add the end of the capture group to the suffixes for now so compilation continues to work
        this._suffixes += ")";
        this.add( "(", false );

        return this;
    }

    //ends a capturing group
    endCapture() {
		//remove the last parentheses from the _suffixes and add to the regex itself
        this._suffixes = this._suffixes.substring(0, this._suffixes.length - 1 );
        this.add( ")", true );

        return this;
    }

    //convert to RegExp object
    toRegExp() {
        var arr = this.regexp.toString().match(/\/(.*)\/([a-z]+)?/);
        return new RegExp(arr[1],arr[2]);
    }

    test(value) {
    	return this.regexp.test(value);
    }
}

export default Awy_Core_Util_Vertex

/** Usage
 * 
 * let vertex = await Class.i('awy_core_util_vertex');
 * let tester = vertex.startOfLine().next("http").maybe( "s" ).next( "://" ).maybe( "www." ).anythingBut( " " ).endOfLine();
 * let testMe = "https://www.google.com";
 * if( tester.test( testMe ) ) alert( "We have a correct URL ");
 * else alert( "The URL is incorrect" );
 * console.log(tester);

 * let vertex = await Class.i('awy_core_util_vertex');
 * // Create a test string
 * let replaceMe = "Replace bird with a duck";
 * // Create an expression that seeks for word "bird"
 * let expression = vertex.find( "bird" );
 * // Execute the expression like a normal RegExp object
 * let result = expression.replace( replaceMe, "duck" );
 * console.log( result ); // Outputs "Replace duck with a duck"

 * let vertex = await Class.i('awy_core_util_vertex');
 * let result = vertex.find( "red" ).replace( "We have a red house", "blue" );
 * console.log( result ); // Outputs "We have a blue house"


 * var my_paragraph = "Take a look at the link http://google.com and the secured version https://www.google.com";
 * var expression = vertex
 *                 .find( "http" )
 *                 .maybe( "s" )
 *                 .next( "://" )
 *                 .anythingBut( " " );
 * 
 * my_paragraph = expression.replace( my_paragraph, function(link) {
 *     return "<a href='"+link+"'>"+link+"</a>";
 * } );
 * console.log(my_paragraph);

 */
