/*jshint multistr: true ,node: true*/
"use strict";

var
    /*NODE INTERNALS*/
    FS                  = require('fs'),
    UTIL                = require('util'),

    /* NPM Third Party */
    _                   = require('lodash'),
    MOMENT              = require('moment'),
    COLORS              = require('colors'),
    ANSI                = require('ansi');

//boilerplate
function LGR(){

    var
        self = this;

    /*
        Log levels have a priority
        Priority is as per index
        So log has more priority
        over info or verbos
    */

    self._initialize();
}

//initalizes counter to zero and sets output to console
LGR.prototype._initialize = function(){
    var
        self = this;

    self.counter    = 0;
    self.file       = undefined;
    self.template   = undefined;
    self.custom     = undefined;
    self.levels     = {};
    self.level      = 'dummy';
    self.cursor     = ANSI(process.stdout);

    self.addLevel('dummy',0);
};

//concatenates the elements of an array of data
LGR.prototype._stringifyArgs = function(data){
    var
        self    = this,
        i       = 0,
        str     = "";

    for(i=0;i<data.length;i++){
        str += data[i] + " ";
    }

    return str;
};

//encloses the string in brackets
LGR.prototype._encloseInBracs = function(data){
    var
        self = this;
    return "[" + data +"]";
};

//sets your log level
LGR.prototype._logLevel = function(level){
    var
        self        = this,
        display     = _.get(self,'levels.'+level+'.display',level.toUpperCase());

    self.logLevel       = level;
    self.levelDisplay   = self._encloseInBracs(display);
};

//sets where to direct the output logs
LGR.prototype.redirectOutput = function(fileName){
    var
        self = this;

    if(fileName === undefined){
        self.file       = undefined;
    }else{
        self.file       = FS.createWriteStream(fileName, {flags : 'w'});
        self.toFlush    = self.file;
    }
};

//sets the level inclusing and above which the logs are to be posted
LGR.prototype.setLevel = function(level){
    var
        self = this;

    self.level = level;
};

//does the printing of the logs
LGR.prototype._printLog = function(data){
    var
        self = this,
        str;

    if(self.levels[self.logLevel].priority >= self.levels[self.level].priority){
        str = self._stringifyArgs(data);

        if(self.custom === undefined){
            self.setTemplate();
        }else{
            self.setTemplate(self.custom);
        }

        if(self.file === undefined){
            self._getColouredData();
            process.stdout.write(str + '\n');
        } else{
            self.file.write(self.levelDisplay+ " " + self.template + " " + self.counter + " " + str + '\n');
        }

        self.counter++;
    }
};

//sets the template of logs
LGR.prototype.setTemplate = function(opts){
    var
        self        = this,
        str         = [MOMENT().format('DD-MM-YYYY HH:mm:sss'),process.uptime(),process.pid,self.counter],
        display     = "";

    /*
        opts must be a string
        could add - JSON.stringify(process.memoryUsage())
    */

    if(opts!==undefined){
        display = self._encloseInBracs(opts);
        self.custom = opts;
    }else{
        str.forEach(function(item){
            display += self._encloseInBracs(item) + " ";
        });
        self.custom = undefined;
    }   

    self.template = display;
};

//color the logs depending upon their type
LGR.prototype._getColouredData = function(){
    var
        self    = this,
        str     = " " + self.template + " ",
        color   = self.levels[self.logLevel].color;

    if(_.get(color,'bg',null) !== null)
        self.cursor.bg[color.bg]();

    if(_.get(color,'fg',null) !== null)
        self.cursor.fg[color.fg]();   
    
    //print the log type
    process.stdout.write(self.levelDisplay);

    self.cursor.reset();


    //print the template
    if(_.get(color,'fg',null) !== null)
        self.cursor.fg[color.fg]();

    process.stdout.write(str);

    self.cursor.reset();
};

//adds level with priority, color and display name
LGR.prototype.addLevel = function(name,priority,color,display){
    var
        self            = this,
        obj             = {
            priority    : priority,
            color       : color,
            display     : display
        };

    _.set(self,'levels.' + name,obj);

    self[name] = function(){
        self._logLevel(name);
        self._printLog(arguments);
    }
};

//closes the file opened
LGR.prototype.flush = function(){
    var
        self = this;

    if(self.toFlush !== undefined){
        self.toFlush.end();
        self.toFlush = undefined;
    }
};

module.exports = new LGR();