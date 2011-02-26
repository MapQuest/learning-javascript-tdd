var ConsoleReporter;

(function() {
    ConsoleReporter = function() {
    };
    
    ConsoleReporter.prototype = {
        reportRunnerResults: function(runner) {
            this.log("Runner Finished.");
        },
        
        reportRunnerStarting: function(runner) {
            this.log("Runner Started.");
        },
        
        reportSpecResults: function(spec) {
            var summary = spec.suite.description + ' : ' + spec.description,
                resultText = "FAIL.",
                start = spec.startTime,
                end = new Date(),
                duration = 'Took ' + ((end - start)/1000).toFixed(3) + ' seconds.';
            
            if (spec.results().passed()) {
                resultText = "PASS.";
            }
            
            this.log([summary, duration, resultText].join(' '));
        },

        reportSpecStarting: function(spec) {
            spec.startTime = new Date();
        },

        reportSuiteResults: function(suite) {
            var results = suite.results();
            
            this.log(suite.description + " : " + results.passedCount + " of " + results.totalCount + " passed.");
        },
        
        log: function(str) {
            if (console && console.log) {
                console.log(str);
            }
        }
    };
})();
