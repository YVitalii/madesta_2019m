var dygraph.data=[];
var dygraph.init= function (container){
  g = new Dygraph(container, data,
                          { title:"График температурного режима",
                            showRoller: true,

                            labels:graph_labels,
                            legend: 'always',
                            labelsDivStyles: { 'textAlign': 'right' },
                            ylabel: 'Температура (*С)',
                            labelsSeparateLines:true
                          });
}
