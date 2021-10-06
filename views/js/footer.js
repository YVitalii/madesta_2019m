
function getTime (){
  let now=new Date();
  let timeN=("0"+now.getHours()).slice(-2)+":"+("0"+now.getMinutes()).slice(-2)+":"+("0"+now.getSeconds()).slice(-2);
  return timeN;
}

function getDate (){
  // эта функция пока не применяется,
  // данные берутся при считывании страницы из шаблона HeaderFooter.pug
  let now=new Date();
  //let timeN=now.toLocaleDateString()
  let timeN=(now.getFullYear())+"-"+("0"+(now.getMonth()+1)).slice(-2)+"-"+("0"+now.getDate()).slice(-2);
  return timeN;
}

/*modeArchive.onclick=function () {
  let trace = true;
  (trace) ? console.log("Button Archive was  clicked") : null;
}*/

/*powerOff.onclick=function () {
  console.log("System power Off");
}

resetDev.onclick=function () {
  console.log("System reset");
}*/
dateNow.innerHTML="<h5>"+ getDate()+" </h5>";

var clock = setInterval(function(){
  timeNow.innerHTML="<h5>"+ getTime()+" </h5>";
},1000);
//
var clock = setInterval(function(){
  dateNow.innerHTML="<h5>"+ getDate()+" </h5>";
},1800000);
