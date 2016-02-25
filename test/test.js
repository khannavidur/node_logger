var
    L = require('../index.js');

(function(){

    function display(){
        L.verbos('hello','this','is','verbos');
        L.info('info');
        L.log('log');
        L.error('error');
        L.critical('critical');
    }

    /*
        Adding Log levels

    */
    L.addLevel('info',1000,{fg:'yellow'},'INFORMATION');
    L.addLevel('verbos',1000,{fg:'blue'});
    L.addLevel('log',1000,{fg:'magenta'});
    L.addLevel('error',1000,{fg:'red'});
    L.addLevel('critical',1000,{fg:'red',bg:'yellow'});
    


    /*
        Testing different log types
    */
    display();

    /*
        Using custom templete
    */
    L.setTemplate("My Custom Template");
    display();

    /*
        Switching back to normal template
    */
    L.setTemplate();
    display();

    /*
        Write logs to file
    */
    L.redirectOutput('/home/vidurkhanna/Desktop/dummy.log');
    display();

    /*
        Redirect logs back to terminal
    */   
    L.redirectOutput();
    display();

    /*
        Setting level to log
        So L.info and L.verbos logs won't be shown
    */
    L.setLevel("info");
    display();

    L.flush();
})();