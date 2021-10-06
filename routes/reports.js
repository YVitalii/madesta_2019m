var express = require('express');
var router = express.Router();
const logModName="/program" // корневоq URL для трассировки
const path = require('../config.js').path;


router.get('/', function(req, res, next) {
  // страничка с редактором программы
  let trace=1, logH="get("+logModName+"/)::";
  trace ? console.log(logH+"Enter") : null;
  res.render('reports');
});

router.post('/init', function(req, res, next) {
    let trace=1, logH="post("+logModName+"/init)::";
    trace ? console.log(logH+"Enter") : null;
    // --------- готовим данные  ---------------
    let data=JSON.stringify(programManager.getTable());
    trace ? console.log(logH+"Data:"+data) : null;
    // ---- готовим ответ  ------------
    res.set('Content-Type', 'application/json');
    res.send(data);
});

/*router.post('/save', function(req, res, next) {
    let trace=1, logH="get("+logModName+"/save)::";
    trace ? console.log(logH+"Enter") : null;
    // --------- готовим данные  ---------------
    let data=JSON.stringify(programManager.getTable());
    trace ? console.log(logH+"Data:"+data) : null;
    // ---- готовим ответ  ------------
    res.set('Content-Type', 'application/json');
    res.send(data);
});*/


/* GET users listing. */
router.post('/save', function(req, res, next) {
  let trace=1;logH="post("+logModName+"/save)::";
  trace ? console.log(logH+"Enter") : null;
  let data=JSON.parse(req.body.data)
  trace ? console.group(data) : null;
  res.set('Content-Type', 'plain/text');
  if (programManager.setTable(data)) {
    res.send('program saved');
  } else {
    res.send('program not saved');
  }


});

module.exports = router;
