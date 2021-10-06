const log = require('./log.js'); // логер
let logName="<"+(__filename.replace(__dirname,"")).slice(1)+">:";
let gTrace=0; //=1 глобальная трассировка (трассируется все)



class Process_H {
  constructor(tT,test,finish) {
    // -- настройки логгера --------------
    let logN=logName+"constructor("+tT+"):";  let trace=0;   trace = (gTrace!=0) ? gTrace : trace;
    trace ? log("w",logN,"Started") : null;
    
    this.errors=null;
    this.tT=tT;   //trace ? log("i","this.tasks=",this.tasks) :null ;
    this.test=test;
    this.finish=finish;
    this.iterate();
  }
  
  iterate (index){
    // -- настройки логгера --------------
    let logN=logName+"iterate("+this.tT+"):";  let trace=1;   trace = (gTrace!=0) ? gTrace : trace;
    trace ? log("w",logN,"Started") : null;
    // если задачи закончились
    /*if (index == this.tasks.length) {
      trace ? log("w",logN,"Все задачи обработаны. Выход") : null;
      // возвращаем данные
      return this.finish(this.errors,this.response)

    };*/
    // берем следующую задачу
    //const task=this.tasks[index];
    //trace ? log("i",logN,"следующая задача task=[",task,"]") : null;
    // вызываем функцию
    this.test(this.tT,(err,data) => {
      if (err) {
        trace ? log("e",logN,"err=",err,"data=",data) : null;
      };
      if (data) {
        // возвращаем данные
        return this.finish()
        }
      // следующая задача
      setTimeout(() => {this.iterate()},30000) // проверяем каждые 30 сек
    })//taskFunc
  }//iterate

}//class



// ------------ testing -----------

var counter=5;
function test(arg,cb){
  // -- настройки логгера --------------
  let logN=logName+"test("+arg+"):";  let trace=1;   trace = (gTrace!=0) ? gTrace : trace;
  trace ? log("w",logN,"Started  Counter=",counter) : null;
  counter --;
  if (counter <0) { return cb(null,true)}
  return cb(null,null)
}


if (! module.parent) {
  
  let tasked= new Process_H(5,test,(err,data) => {
    if (err) {
      log("e","err=");
      console.group(err);
    }
    log("i","data=");
    console.group(data);
  })
}
 module.exports=Process_H;
