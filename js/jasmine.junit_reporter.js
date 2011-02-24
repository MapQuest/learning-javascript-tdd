/**
 * JUnitReporter - A jasmine report to output JUnit XML TestSuite output.
 * Copyright (c) 2011 Larry Myers
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
 */
(function() {
    
    if (! jasmine) {
        throw new Exception("jasmine library does not exist in global namespace!");
    }
    
    function elapsed(startTime, endTime) {
        return (endTime - startTime)/1000;
    }
    
    function ISODateString(d) {
        function pad(n) { return n < 10 ? '0'+n : n; }
        
        return d.getFullYear() + '-'
            + pad(d.getMonth()+1) +'-'
            + pad(d.getDate()) + 'T'
            + pad(d.getHours()) + ':'
            + pad(d.getMinutes()) + ':'
            + pad(d.getSeconds());
    }
    
    /**
     * Generates JUnit XML for the given spec run.
     * Allows the test results to be used in java based CI
     * systems like CruiseControl and Hudson.
     */
    var JUnitReporter = function() {
        this.started = false;
        this.finished = false;
        this.reports = [];
    };
    
    JUnitReporter.prototype = {
        reportRunnerResults: function(runner) {
            this.finished = true;
        },
        
        reportRunnerStarting: function(runner) {
            this.started = true;
        },
        
        reportSpecResults: function(spec) {
            spec.endTime = new Date();
        },
        
        reportSpecStarting: function(spec) {
            spec.startTime = new Date();
            
            if (! spec.suite.startTime) {
                spec.suite.startTime = new Date();
            }
        },
        
        reportSuiteResults: function(suite) {
            var writer = new XMLWriter('UTF-8', '1.0'),
                fileName = 'TEST-' + suite.description.replace(/\s/g, '') + '.xml',
                results = suite.results(),
                items = results.getItems(),
                item,
                spec,
                expectedResults,
                trace,
                i,
                j;
                
            suite.endTime = new Date();
            
            writer.writeStartDocument();
            
            writer.writeStartElement('testsuite');
            writer.writeAttributeString('name', suite.description);
            writer.writeAttributeString('errors', 0);
            writer.writeAttributeString('failures', results.failedCount);
            writer.writeAttributeString('tests', results.totalCount);
            writer.writeAttributeString('time', elapsed(suite.startTime, suite.endTime));
            writer.writeAttributeString('timestamp', ISODateString(suite.startTime));
            
            for (i = 0; i < items.length; i++) {
                item = items[i];
                spec = suite.specs()[i];
                
                writer.writeStartElement('testcase');
                writer.writeAttributeString('classname', suite.description);
                writer.writeAttributeString('name', item.description);
                writer.writeAttributeString('time', elapsed(spec.startTime, spec.endTime));
                
                if (!item.passed()) {
                    expectedResults = item.getItems();
                    
                    for (j = 0; j < expectedResults.length; j++) {
                        trace = expectedResults[j].trace;
                        
                        if (trace instanceof Error) {
                            writer.writeStartElement('failure');
                            writer.writeString(trace.message);
                            writer.writeEndElement();
                            break;
                        }
                    }
                }
                
                writer.writeEndElement();
            }
            
            writer.writeEndElement();
            writer.writeEndDocument();
            
            this.reports.push({
                "name": suite.description,
                "results": {
                    "passed": results.passedCount,
                    "failed": results.failedCount,
                    "total": results.totalCount
                },
                "filename": 'TEST-' + suite.description.replace(/\s/g, '') + '.xml',
                "text": writer.flush()
            });
        },
        
        log: function(str) {
            var console = jasmine.getGlobal().console;
            
            if (console && console.log) {
                console.log(str);
            }
        }
    };
    
    // export public
    jasmine.JUnitReporter = JUnitReporter;
    
    /**
     * XMLWriter - XML generator for Javascript, based on .NET's XMLTextWriter.
     * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
     * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
     * Date: 3/12/2008
     * @version 1.0.0
     * @author Ariel Flesler
     * http://flesler.blogspot.com/2008/03/xmlwriter-for-javascript.html
     */

    function XMLWriter( encoding, version ){
        if( encoding )
            this.encoding = encoding;
        if( version )
            this.version = version;
    };
    (function(){

    XMLWriter.prototype = {
        encoding:'ISO-8859-1',// what is the encoding
        version:'1.0', //what xml version to use
        formatting: 'indented', //how to format the output (indented/none)  ?
        indentChar:'\t', //char to use for indent
        indentation: 1, //how many indentChar to add per level
        newLine: '\n', //character to separate nodes when formatting
        //start a new document, cleanup if we are reusing
        writeStartDocument:function( standalone ){
            this.close();//cleanup
            this.stack = [ ];
            this.standalone = standalone;
        },
        //get back to the root
        writeEndDocument:function(){
            this.active = this.root;
            this.stack = [ ];
        },
        //set the text of the doctype
        writeDocType:function( dt ){
            this.doctype = dt;
        },
        //start a new node with this name, and an optional namespace
        writeStartElement:function( name, ns ){
            if( ns )//namespace
                name = ns + ':' + name;

            var node = { n:name, a:{ }, c: [ ] };//(n)ame, (a)ttributes, (c)hildren

            if( this.active ){
                this.active.c.push(node);
                this.stack.push(this.active);
            }else
                this.root = node;
            this.active = node;
        },
        //go up one node, if we are in the root, ignore it
        writeEndElement:function(){
            this.active = this.stack.pop() || this.root;
        },
        //add an attribute to the active node
        writeAttributeString:function( name, value ){
            if( this.active )
                this.active.a[name] = value;
        },
        //add a text node to the active node
        writeString:function( text ){
            if( this.active )
                this.active.c.push(text);
        },
        //shortcut, open an element, write the text and close
        writeElementString:function( name, text, ns ){
            this.writeStartElement( name, ns );
            this.writeString( text );
            this.writeEndElement();
        },
        //add a text node wrapped with CDATA
        writeCDATA:function( text ){
            this.writeString( '<![CDATA[' + text + ']]>' );
        },
        //add a text node wrapped in a comment
        writeComment:function( text ){
            this.writeString('<!-- ' + text + ' -->');
        },
        //generate the xml string, you can skip closing the last nodes
        flush:function(){       
            if( this.stack && this.stack[0] )//ensure it's closed
                this.writeEndDocument();

            var 
                chr = '', indent = '', num = this.indentation,
                formatting = this.formatting.toLowerCase() == 'indented',
                buffer = '<?xml version="'+this.version+'" encoding="'+this.encoding+'"';

            if( this.standalone !== undefined )
                buffer += ' standalone="'+!!this.standalone+'"';
            buffer += ' ?>';

            buffer = [buffer];

            if( this.doctype && this.root )
                buffer.push('<!DOCTYPE '+ this.root.n + ' ' + this.doctype+'>'); 

            if( formatting ){
                while( num-- )
                    chr += this.indentChar;
            }

            if( this.root )//skip if no element was added
                format( this.root, indent, chr, buffer );

            return buffer.join( formatting ? this.newLine : '' );
        },
        //cleanup, don't use again without calling startDocument
        close:function(){
            if( this.root )
                clean( this.root );
            this.active = this.root = this.stack = null;
        },
        getDocument: window.ActiveXObject 
            ? function(){ //MSIE
                var doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.async = false;
                doc.loadXML(this.flush());
                return doc;
            }
            : function(){// Mozilla, Firefox, Opera, etc.
                return (new DOMParser()).parseFromString(this.flush(),'text/xml');
        }
    };

    //utility, you don't need it
    function clean( node ){
        var l = node.c.length;
        while( l-- ){
            if( typeof node.c[l] == 'object' )
                clean( node.c[l] );
        }
        node.n = node.a = node.c = null;    
    };

    //utility, you don't need it
    function format( node, indent, chr, buffer ){
        var 
            xml = indent + '<' + node.n,
            nc = node.c.length,
            attr, child, i = 0;

        for( attr in node.a )
            xml += ' ' + attr + '="' + node.a[attr] + '"';

        xml += nc ? '>' : ' />';

        buffer.push( xml );

        if( nc ){
            do{
                child = node.c[i++];
                if( typeof child == 'string' ){
                    if( nc == 1 )//single text node
                        return buffer.push( buffer.pop() + child + '</'+node.n+'>' );                   
                    else //regular text node
                        buffer.push( indent+chr+child );
                }else if( typeof child == 'object' ) //element node
                    format(child, indent+chr, chr, buffer);
            }while( i < nc );
            buffer.push( indent + '</'+node.n+'>' );
        }
    };

    })();
})();