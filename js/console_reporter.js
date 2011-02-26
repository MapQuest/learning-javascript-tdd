var ConsoleReporter;

(function() {
    ConsoleReporter = function() {
        this.started = false;
        this.finished = false;
    };
    
    ConsoleReporter.prototype = {
        reportRunnerResults: function(runner) {
            this.finished = true;
            this.log("Runner Finished.");
        },

        reportRunnerStarting: function(runner) {
            this.started = true;
            this.log("Runner Started.");
        },

        reportSpecResults: function(spec) {
            var resultText = "Failed.";
            
            if (spec.results().passed()) {
                resultText = "Passed.";
            }
            
            this.log(resultText);
        },

        reportSpecStarting: function(spec) {
            this.log(spec.suite.description + ' : ' + spec.description + ' ... ');
        },

        reportSuiteResults: function(suite) {
            var results = suite.results();
            
            this.log(suite.description + ": " + results.passedCount + " of " + results.totalCount + " passed.");
        },
        
        log: function(str) {
            if (console && console.log) {
                console.log(str);
            }
        }
    };
})();
