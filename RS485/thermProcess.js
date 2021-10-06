
const config = require('./config');
const devices=config.thermprocess.devicesList;
const RS485 = require('./RS485_driver.js');
const processH = require('./processH');
// --------- настройки логера глобальные -------
const log = require('./log.js');
let logName="<"+(__filename.replace(__dirname,"")).slice(1)+">:";//имя модуля
let gTrace=0; //глобальная трассировка (трассируется все)
// gTrace ? log("i",logName,"get item=", item) : null;
var tasks;
var mode=false //состояние true = пуск; false =  стоп
var step=0; // номер шага программы
const dT=config.thermprocess.dT;//температурный коридор
const dY=config.thermprocess.dY;// максимальная ошибка нарастания
const serialTask=require("./serialTasks.js");
var forseStop=false; //true принудительная остановка процесса по нажатию кнопки Стоп


  startStop(false,(err)=>{
  if (err) {
    log("w",logName,"Ошибка стартовой остановки терморегуляторов")
  } else {
    log("w",logName,"Терморегуляторы остановлены")
  } 
})



function toMinutes(arg) {
  let arr=arg.split(":");
  let res=parseInt(arr[0])*60+parseInt(arr[1]);
  res= res ? res : 0;
  return res
}

function testTemperature(tT,cb){
  
  // определяет конец цикла нагрева по температурам на всех ТРП 
  // -- настройки логгера локальные--------------
  if (forseStop) {
        // если форсированный стоп, сразу выходим
        cb(null,true);
          return } 
   let logN=logName+"testTemperature("+tT+"): dT="+dT;  
   let    trace=1;   trace = (gTrace!=0) ? gTrace : trace;
   trace ? log("w",logN,"  Started") : null; 
   data=RS485.getValues("T1;T2;T3");
   //trace ? console.log(data) : null;
   //если все 3 прибора превысили заданную температуру
   trace ? log("i","data.T1.value=",data.T1.value,
           " ;data.T2.value=",data.T2.value,
           " ;data.T3.value=",data.T3.value ):null;
   let state =  (data.T1.value >= tT-dT) &
                (data.T2.value >= tT-dT) & 
                (data.T1.value >= tT-dT);
   if (state) {
          cb(null,true);
          return
          };
   return cb(null,false)  
  }

  
function cloneObj(arg){
  let newTask={};
  for (let key in arg) {
      newTask[key]=arg[key];
  }//for
   gTrace ? log("i",logName,"cloneObj=", newTask) : null; 
  return newTask
}//function cloneObj

function startProgram(args){

  // -- настройки логгера локальные--------------
   let logN=logName+"startProgram()";  
   let    trace=1;   trace = (gTrace!=0) ? gTrace : trace;
   trace ? log("w",logN,"  Started") : null; 
   
  if (mode | forseStop) {
      // процесс уже запущен но повторно нажата кнопка Стоп 
      forseStop=true;//включаем форсированный стоп и выходим
      trace ? log("i",logN,"Принудительный выход. forseStop=",forseStop) : null;
      //process.nextTick(() => {cb()})
      return 
    }
  
   trace ? log("w",logN,"  args=") : null; 
   trace ? console.log(args) : null; 
   // сохраняем в глобальной зоне модуля
   tasks=args;
   let newSubTask=cloneObj(args[0]);
   newSubTask.Y="01:30";
   trace ? log("1",logN,"Step1. now args[0]=",args[0]) : null;
   // записываем первый шаг
   saveProgram(newSubTask,(err,data)=>{
      trace ? log("1",logN,"  Save program N1 ") : null;
      //запускаем на исполнение
      startStop(true,()=>{
          //ожидаем времени разогрева
          trace ? log("i",logN,"  Start N1") : null;
          new processH(args[0].tT,testTemperature,()=>{
              // разогрев окончен, обнуляем время разогрева
              let newSubTask=cloneObj(args[0]);
              newSubTask.H="00:00";
              // записываем в приборы время выдержки и обнуляем время набора температуры
              trace ? log("1",logN,"Разогрев окончен. Save program N2 ") : null;
              
              saveProgram(newSubTask,()=>{
                //запускаем на исполнение на всякий случай
                trace ? log("i",logN,"  Start N2") : null;
                  startStop(true,()=>{
                    if (forseStop) {
                      // если форсированный стоп, останавливаем приборы
                      trace ? log("i",logN,"  Start N2. Принудительный выход") : null;
                      startStop(false,()=>{});
                      forseStop=false;//сбрасываем обработку
                    }// if (forceStop)
                         
                  })//2startStop           
              })//2saveProgram
          })//processH
      })//startStop
  
  })//saveProgram
  
  
  mode=true;//
  
};



/*function process_H(tT){
  // -- настройки логгера локальные--------------
   let logN=logName+"process_H(H="+H+"; tT="+tT+"):";  let trace=1;   trace = (gTrace!=0) ? gTrace : trace;
   trace ? log("w",logN,"Started") : null; 
  RS485.getValues("T1,T2,T3",(err,data) => {
      //если все 3 прибора превысили заданную т-ту
      let state =  (data.T1.value >= tT-dT) & (data.T2.value >= tT-dT) & (data.T1.value >= tT-dT);
      if (state) {
          cb();
          return
          };
      setTimeout(() => {process_H()},30000)
  })// getValues
}*/

/*function step(arg,cb){
  // -- настройки логгера локальные--------------
   let logN=logName+"step("+arg+"):";  let trace=1;   trace = (gTrace!=0) ? gTrace : trace;
   trace ? log("w",logN,"Started") : null;
   let timer=0;
   saveProgram(arg,(err)=>{
        if (err) {
            cb(err);
            return
            };
        return 
   }
}//step*/

function startStop (arg,cb) {
   // -- настройки логгера локальные--------------
   let logN=logName+"startStop():";  let trace=0;   trace = (gTrace!=1) ? gTrace : trace;
   log("w",logN,"Команда: ",(arg ?  "Start" : "Stop" ));
   mode=arg;
   // в зависимости от режима посылаем пуск или стоп
    let command=arg ? 17 : 1;
    let req="";
    for (let addr in devices) {
     //останавливаем программу
     req+=addr+"-state="+command+";";
   };
   req=req.slice(0,-1);
   trace ? log("i","req= '",req,"'") : null;
   RS485.set(req,(err,data) => {
     if (err) { 
                cb(err);
                trace ? log("e",logN,"err=",err) : null;
                return
               }
     
     trace ? log("w",logN,"data=") : null;
     trace ? console.log(data) : null;
     return cb()
    });
}//stop

 function saveProgram(args,cb){
   // -- настройки логгера локальные--------------
   let logN=logName+"saveProgram("+"):";  let trace=0;   trace = (gTrace!=0) ? gTrace : trace;
   log("w",logN,"Started:",args);
   
   // формируем запрос на запись
   let req=""
   let tmp;
   for (let addr in devices) {
     // перебираем все приборы в системе
     req+=addr+"-tT="+(parseInt(args["tT"])+parseInt(devices[addr].dT))+";";
     
     tmp=(toMinutes(args["H"])+devices[addr].dH);
     tmp=(tmp<0) ? 0:tmp;
     req+=addr+"-H="+tmp+";";
     tmp=(toMinutes(args["Y"]));
     tmp=(tmp<0) ? 0:tmp;
     req+=addr+"-Y="+tmp+";";
     
   }
   req=req.slice(0,-1);
   trace ? log("i","req= '",req,"'") : null;
   RS485.set(req,(err,data) => {
     if (err) { 
                cb(err);
                trace ? log("e",logN,"err=",err) : null;
                return
               }
     
     trace ? log("w",logN,"data=") : null;
     trace ? console.log(data) : null;
     return cb()
   });
 }
/*
for (let i=0,tasks.length-1,i++){
		
  }//for
*/
module.exports.startProgram=startProgram;

if (! module.parent) {
let arg;
  /*arg=":";
  log("i","toMinutes("+arg+")=", toMinutes(arg), "min");

  /*setTimeout(()=>{
    arg={"tT":'100',"H":"00:00","Y":"00:00"};
    log("i","startProgram("+arg+") Started" );
    saveProgram(arg,()=>{});
  },5000);
  /*setInterval(()=>{startStop(true,(err)=>{
                    let logN= "callback";
                    if (err) { 
                                
                                log("e",logN,"err=",err) ;
                                return
                               }
                     })
                   }
  ,5000);*/
  /*setTimeout(()=>{
      testTemperature(11,(err,data)=>{
            let logN= "callback";
            let msg= data ? "finish" : "process"
             console.log(msg) ;  
        })//testTemperature
  },10000)//setTimeout*/
  arg=[ { tT: '100', H: '00:10', Y: '00:10' },
  { tT: '100', H: '00:00', Y: '00:01' } ]
  startProgram(arg);
  setInterval(()=>{
      startProgram(arg);
      log("e",logName,"Повторное нажатие пуск/стоп");
  },2*60000)

}//if (! module.parent)
