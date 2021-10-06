function isPair(i) {
     // true если i - четное число
     if (i == 0) {return 0}
     return !(i/2-Math.round(i/2-0.1))
   }

function timeRoundDown(time){
     // округляет время по нижнему пределу с точностью 30 мин
     // например если 12:10 то будет 12:00; если 12:50 то будет 12:30
     time.setMinutes( (time.getMinutes()<30) ? 0 : 30);
     time.setSeconds(0);
     return time
   }

// ---------------- class Chart ---------------------------
// -----  redraw ()  -  перерисовывает график
// -----  addData()  -  добавляет точку данных на график
// -----  getData() - загрузка данных из сервера
// -----  drawData() - отрисовывает таблицу данных
// -----  drawTask() - отрисовывает задание

class Chart {
  constructor(elementId,config){ 
  this.colors=['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999',"#427220","#bba901","#e5a77e","#b76b4d","#ad2815"];//список цветов для линий графиков
    this.colorScale; // шкала цвета линий графиков
    this.xScale; // масштабирование по оси Х
    this.yScale; // масштабирование по оси Y
    this.data;   // таблица данных
    this.points;   // таблица реперных точек
    this.task;   // таблица задач
    this.config=config;// конфигурационные настройки
    this.legend={
       xScale:{} //шкала по оси Х например: Т1,Т2,Т3...
      ,yScale:{} //шкала по оси Y например: caption,value
    }

    // y.max,y.min - границы по оси 'y'
    // task - задача в виде {time:  ,y:  , dYmin:  , dYmax:   }
    // data:"/URL  " - ссылка на архив оперативных данных
    this.container= d3.select(elementId); // DOM контейнер для графика
    this.elementDOM=this.container.node(); // елемент DOM,ссылка на контейнер в DOM
    //console.log(this.elementDOM);
    this.margin = {top: 25, right: 40, bottom: 30, left: 55}; // границы самого поля построения графика
    this.timeDomain={ // временная шкала графика:начало-конец, уточняется при получении данных из архива или задачи
      start: new Date(0)// now
      ,end: new Date(3*60*60*1000) // + now + 3 hour
    };

    this.client={// запоминаем размеры контейнера
      "width":this.elementDOM.clientWidth,
      "height":this.elementDOM.clientHeight
    };

    // запускаем периодический опрос изменения размеров контейнера
    this.resizeTimer=setInterval(()=>{
      let nowW=this.client.width;
      let nowH=this.client.height;
      let newW=this.elementDOM.clientWidth;
      let newH=this.elementDOM.clientHeight;
      if (( nowW != newW ) | ( nowH != newH ) ) {
        console.log("nowW="+nowW+";nowH="+nowH+";newW="+newW+";newH="+newH);
        // запоминаем новые размеры контейнера
        this.client.width=newW;
        this.client.height=newH;
        //перестраиваем элемент
        this.redraw()
      }
    },1000);//setInterval

    // запрашиваем данные
    this.getData();
  } // constructor






//---------------------  addData(d) ------------------------------------------------------------
//------ получает данные , достраивает линии графиков и запоминает данные в таблице ------------

  addData(d){
    let trace=0, lmsg="addData:";
    // ------ добавляет данные к графику ---------
    //trace ? console.log(lmsg+"Аргумент:"+JSON.stringify(d)) : null;
    //console.log(d);
    if (! this.data.columns) {return }; // таблица данных еще не готова, выход
    trace ? console.log(lmsg+"arg:"+JSON.stringify(d)) : null;
    if (! d) {return }; // если данных нет (например еще не подгрузились), выход
    let data=this.data; // ссылка на данные для сокращения кода
    let obj={};
    for (var i = 1; i < data.columns.length; i++) {
      // перебираем все заголовки в таблице данных
      if ( d[data.columns[i]] ) {// если ключ=заголовку во входных данных имеется
        // определяем временную метку
        if (i == 1) {
          // берем timestamp у первого элемента, как общий для всех
          obj[data.columns[0]]=new Date(d[data.columns[i]].timestamp)
        };
        // если у текущего ключа имеется поле value то берем его, иначе=0
        obj[data.columns[i]]= d[data.columns[i]].value ? d[data.columns[i]].value : 0; //если данные = null или undefined то 0
      }
    }
    //если после обработки входящих данных нет отметки времени: т.е. объект -пустой - выход
    if ( ! obj.time) {return}
    // лог
    trace ? console.log(lmsg+"time:"+obj.time.toLocaleString()) : null;
    trace ? console.log(lmsg+"Объект:"+JSON.stringify(obj)) : null;
    // добавляем данные в таблицу
    this.data.push(obj);

    // проверяем шкалу времени
    if ( obj[data.columns[0]].getTime() >= this.timeDomain.end.getTime() ) {
      //выходим за пределы шкалы, увеличиваем шкалу на 30 мин
      trace ? console.log("Выход за пределы диапазона оси Х. Ось Х увеличена на 30 мин. oldLimit="+this.timeDomain.end.toLocaleString()) : null;
      this.timeDomain.end=new Date(obj[data.columns[0]].getTime()+30*60*1000);
      trace ? console.log(" newLimit="+this.timeDomain.end.toLocaleString()) : null;
      // запускаем перерисовку всего графика, дорисовывать нет смысла
      this.redraw();
      return; //выходим
    } //if
    // дорисовываем линии
    this.appendLine();

  } //addData(d)

 insertLegend(){
   let trace=0, logCaption="insertLegend::";
   let margin={ // поля области легенды
       top:2
       ,right:5
       ,left: 5
       ,bottom:1
     }; // margin
   //console.log(this.data);
   trace ? this.rectang(this.xScale.range()[0], 0 ,this.xScale.range()[1],this.margin.top,"grey"):null;
   if (! this.data.columns) {return };
   let headers=this.data.columns; // имена колонок данных
   let xRange= this.xScale.range(); // границы поля по оси Х
   xRange[0]=xRange[0]+margin.left;
   xRange[1]=xRange[1]-margin.right;
   let xLength= xRange[1]-xRange[0]; // длина поля по оис Х
   trace ? console.log(logCaption+"xRange="+JSON.stringify(xRange)+"; xLength="+xLength):null;
   let yRange= [ 0, this.margin.top ] // границы поля по оси Y: от 0 до верхней кромки графика-поля
   yRange[0]=yRange[0]+margin.top;
   yRange[1]=yRange[1]-margin.bottom;
   let yHeight= yRange[1]-yRange[0]; // высота поля по оси Y

   trace ? console.log(logCaption+"yRange="+JSON.stringify(yRange)+"; yHeight="+yHeight):null;
    //высота шрифта
   this.legend.fontSize=parseInt(yHeight);
   trace ? console.log(logCaption+"fontSize="+this.legend.fontSize):null;
   //определяем центры ячеек по осиХ
   let xStep=xLength/(headers.length-1)// шаг надписей
   let xSteps=[];
   for (var i = 1; i < headers.length; i++) {
     xSteps.push(xRange[0]+xStep*(i-0.5));
   }
   trace ? console.log(logCaption+"xSteps="+JSON.stringify(xSteps)):null;
   // определяем шкалы
   this.legend.xScale = d3.scaleOrdinal()
                     .domain(headers.slice(1,headers.length)) // диапазон заглавий ["T1", "T2", "T3", "T4"]
                     .range(xSteps); // диапазон координат
   let ySteps = [
     yRange[0]+yHeight/2
   ];
   this.legend.yScale = d3.scaleOrdinal()
                     .domain(["title"]) // диапазон заглавий
                     .range(ySteps); // диапазон координат
   trace ? console.log(logCaption+"ySteps="+JSON.stringify(ySteps)):null;
   // Пишем заглавия
   let g=this.svg.append('g').attr('id', 'legend');
   for (var i = 1; i < headers.length; i++) {
     g.append('text')
          .attr("x",this.legend.xScale(headers[i]))
          .attr('y', this.legend.yScale("title"))
          .attr('text-anchor', 'middle')
          .attr('font-style', 'italic')
          .attr('fill', this.colorScale(headers[i]))
          .attr('font-weight', '700')
          .attr('dominant-baseline', 'central')
          .style('font-size', ` ${this.legend.fontSize}px`)
          .text(headers[i]);


   }//for



 }



  // -----------------------  appendLine() ----------------------
 appendLine() {
   // дорисовывает линии графиков до новой точки
   let trace=0; let logCaption="appendLine:";
   // рисуем линии по полученным данным
   let lastData=this.data[this.data.length-2];
   let newData=this.data[this.data.length-1];
   trace ? console.log(logCaption+"lastData="+JSON.stringify(lastData)) : null;
   trace ? console.log(logCaption+"newData="+JSON.stringify(newData)) : null;
   for (var i = 1; i < this.data.columns.length; i++) {
     let key=this.data.columns[i];
     let path=d3.path();
     path.moveTo(this.xScale(lastData.time),this.yScale(+lastData[key]));
     path.lineTo(this.xScale(newData.time),this.yScale(+newData[key]));
     trace ? console.log(logCaption+"path="+path.toString()) : null;
     this.svg
             .append("path")
             .attr("fill", "none")
             .attr("stroke", this.colorScale(key))
             .attr("stroke-width", 1.5)
             .attr("d", path);
   }


 } // appendLine()

rectang (x1,y1,x2,y2,color){
  // рисует прямоугольник
  let path=d3.path();
  path.moveTo(x1,y1);
  path.lineTo(x2,y1);
  path.lineTo(x2,y2);
  path.lineTo(x1,y2);
  path.lineTo(x1,y1);
  this.svg
           .append("path")
           .attr("fill", "none")
           .attr("stroke", color)
           .attr("stroke-width", 0.5)
           .attr("d", path);
}


//------------------------  getData()  ------------------------
  getData(){
      // загрузка таблицы данных из сервера (логированных)
    let logURL=this.config.dataURL+"/"+this.config.startDate+".log";    
    let trace=1, logH="drawChart()::"+"getData()"+"::";
    trace ? console.log(logH+"Enter: URL="+logURL):0;
    d3.tsv(logURL,(dataLine,i) => {
          //console.log(logH+"i="+i+" ;data="+dataLine);
          //console.log(dataLine);

          for (let key in dataLine) {
              // если свойство не собственное, а унаследовано - берем следующее
              if (! dataLine.hasOwnProperty(key)) continue;
              //console.log(dataLine);
              if (key == "time") {
                // если поле time преобразуем в дату
                dataLine[key]= new Date(dataLine[key]);
                //если это первая строка данных
                if (i == 0 ){
                  // уточняем левую границу для поля графика

                  console.log("start="+this.timeDomain.start.toLocaleString());
                  console.log("new="+dataLine[key].toLocaleString());
                  let start=this.timeDomain.start.getTime(); //текущее начало диапазона времени
                  let current = dataLine[key].getTime();//принятое начало диапазона времени
                  if (start<current) {
                    // текущее начало диапазона времени больше принятого
                    // то запоминаем его как начало диапазона времени
                    this.timeDomain.start=timeRoundDown(dataLine[key])
                  }; //if (start>current)
                };//  if (i == 0 )
                continue;//next iteration}
              };//  if (key == "time")
              // поле не time, преобразуем в число
              dataLine[key]=parseFloat(dataLine[key])
            }//for (let key in dataLine)
              //
          return dataLine
        }
      ).then ((d)=>{
          // проверяем  верхнюю границу временного диапазона
          if ( this.timeDomain.end.getTime() < d[d.length-1].time.getTime()) {
            // записываем верхнюю границу
            this.timeDomain.end=d[d.length-1].time
          }
          
          return d
         }
      ).then((d) => {
        let columns=d.columns; //список столбцов ["time", "T1", "T2", "T3", "T4"]
        //создаем шкалу цвета. например  this.colorScale("T1")= '#e41a1c'
        this.colorScale=d3.scaleOrdinal()
                          .domain(columns.slice(1,columns.length)) //["T1", "T2", "T3", "T4"]
                          .range(this.colors.slice(0,columns.length-1)); // диапазон цветов
        this.data=d;
        this.redraw();
      });

  }


  drawData(){
    // отрисовывает таблицу данных

    if (! this.data) {return} // если данных нет - выход
    // рисуем линии для каждого столбца
    let d=this.data;
    let columns=d.columns;
    for (var i = 1; i < columns.length; i++) {// нулевой столбец time
      let colName=columns[i];
      this.svg
              .append("path")
              .datum(d)
              .attr("fill", "none")
              .attr("stroke", this.colorScale(colName))
              .attr("stroke-width", 1.5)
              .attr("d", d3.line()
                .x((d) => { return this.xScale(d.time) })
                .y((d) => { return this.yScale( d[colName]<0 ? 0 : d[colName])})
                )
    } //for (var i = 1; i < columns.length; i++)
   this.insertLegend();
  } //drawData

  line(x1,y1,x2,y2,color) {
    // рисует диагональную линию (для поля графика)
    this.svg.append("line")
       .attr('x1', x1)
       .attr('y1', y1)
       .attr('x2',x2)
       .attr('y2',y2)
       .attr("stroke","red")
       .attr("stroke-width",1.5);
  }



  redraw () {
    // перерисовывает график
    this.elementDOM.innerHTML="";//удаляем svg
    this.svg=this.container.append("svg"); // создаем поле для графика
    console.log("redraw");
    // вычисляет размеры поля графика, строит оси и сетку
    this.width = this.elementDOM.clientWidth; // ширина клиента
    this.height = this.elementDOM.clientHeight; //высота клиента
    // указываем размеры для svg
    this.svg
      .attr('width',this.width)
      .attr('height',this.height);
    // Масштабирование
    this.xScale=d3.scaleTime()
        .domain([this.timeDomain.start,this.timeDomain.end])// диапазон времени
        .range([this.margin.left,this.width-this.margin.right]);//поле графика
    this.yScale=d3.scaleLinear()
        .domain([this.config.y.min,this.config.y.max]) //диапазон температур
        .range([this.height-this.margin.bottom,this.margin.top]);
    // ---------------   рисуем задание, т.к. оно затем затирает сетку
    this.drawTask();
    ///------------- ось Х ---------------
    this.xAxis=d3.axisBottom()
                    .scale(this.xScale)
                    .ticks(d3.timeMinute.every(30))
                    .tickSize([-(this.height-this.margin.top-this.margin.bottom)])
                    .tickSizeOuter(0)
                    .tickFormat( (d,i) => {
                            //console.log("tickFormat.d["+i+"]="+d.toLocaleString());
                            return (d<=d3.timeHour(d)) ? (("0"+d.getHours()).slice(-2)+":00"):null
                            })//tickFormat
     this.svg.append("g")
        .attr('transform', `translate(0,${this.height-this.margin.bottom})`)//переносим 0,0 оси в нижнюю часть графика
        .call (this.xAxis)
        .call(g => g.selectAll(".tick line")//ищем все линии на оси
            .attr("stroke-opacity", 0.5)//непрозрачность
            .attr("stroke-dasharray", (d,i) => {
                                          // если отметка "час" линия "7,2" иначе  "2,3"
                                          let rest=(d<=d3.timeHour(d)) ?  "7,2" : "2,3"
                                          return rest
                                        })
          )
        .call (g => g.selectAll(".tick text")// для всех текстовых меток
            .attr('font-size', '18')//увеличиваем размер шрифта
          );//call
     ///------------- ось У ---------------
     this.yAxis=d3.axisLeft()
                    .scale(this.yScale)
                    .ticks(Math.round(this.config.y.max/50)) // метки каждые 50*С
                    .tickSize([-(this.width-this.margin.left-this.margin.right)]) //длина метки, = вся длина графика
                    .tickSizeOuter(0) // длина метки крайних точек шкалы (минимум и максимум)
                    .tickFormat((d,i) => {
                      //для четных меток пишем надпись, для нечетных - пропускаем;
                      return  isPair(i) ? `${d}`:null
                    } )
        ;//yAxis
     this.svg.append("g")
           .attr('transform',  `translate(${this.margin.left},0)`)
           .call(this.yAxis)
           .call(g => g.selectAll(".tick line")
                 .attr ("stroke-opacity", 0.5)
                 .attr("stroke-dasharray", (d,i) => {
                                               //console.log("d="+d.toLocaleString()+" ;i="+i);
                                               return isPair(i) ? "7,2" : "2,3"
                                             })
         )
         .call (g => g.selectAll(".tick text")// для всех текстовых меток
             .attr('font-size', '18')//увеличиваем размер шрифта
           );//call

     //this.line();
     
     this.drawData();



  }// redraw

  drawTask(){

    
    let trace=1, logH="drawChart()::"+" drawTask()"+"::";
    trace ? console.log(logH+"Task:"):0;
    trace ? console.log(this.task):0;
    // -----  отрисовывает задание
    // --------------------------
    // проверяем наличие задания:
    if (! this.task) {
      return // если нет - выход
    }
    //console.log(this.xScale("2019-11-02T18:20:00"));
    // рисуем доверительный интервал
    this.svg.append("path")
          .datum(this.task) // данные
          .attr("fill", "#f0f8ff")//"#bbe5df
          .attr("stroke", "none")
          .attr("d", d3.area()
            .x( (d) => {return this.xScale(d.time)})
            .y0((d) => {return this.yScale(d.y+d.dYmax) })
            .y1((d) => {
              if (d.dYmin) {
                 return this.yScale(d.y+d.dYmin)
              }
              return  this.yScale(0)
            })
          );
    this.svg
            .append("path")
            .datum(this.task)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
              .x((d) => { return this.xScale(d.time) })
              .y((d) => { return this.yScale(d.y) })
              )
              
  } //drawTask()*/

  getTasks(){
    this.task=null;
    let fName=this.config.startDate+".tsk";
    let trace=1, logH="drawChart()::"+"loadTask()"+"::";
    trace ? console.log(logH+"Request task from server:"+this.config.taskURL+'/'+fName):0;
    trace ? console.log(logH+"this.config="):0;
    trace ? console.log(this.config):0;
    if (! this.config.startDate) {
        trace ? console.log(logH+"Reject: fName="+this.config.startDate):0;
        return // если нет - выход
      }
    
     $.ajax({
      method:"POST",
      url:this.config.taskURL,
      data:{'fName':fName},
      success:(msg) =>{
        trace ? console.log(logH+"Tasks:  ") : null;
        trace ? console.log(msg.d) : null;
        let task=msg.d;
        if (! task) {return};
        for (var i=0;i<task.length;i++){
          console.log(task[i].time);
          task[i].time= new Date(task[i].time);
        };
        let t=new Date(task[0].time.getTime());
        this.timeDomain.start=timeRoundDown(t);
        this.timeDomain.end=task[task.length-1].time;
        
        this.task=task;
      } })//$.ajax
    };  //loadData()*/
    
    
   reload(){
      let trace=0, logH="drawChart()::"+"reload()"+"::";
      trace ? console.log(logH+"Enter"):0;
      this.getTasks();
      this.getData();
      
      //setTimeout(this.redraw.bind(this),15000);
    }
}//class
