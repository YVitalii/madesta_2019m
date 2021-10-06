startStop.onclick=function () {
  console.log("Start/Stop");
  let req=[
    {
      "tT": st1_pr_tT.value
     ,"H": st1_pr_H.value
     ,"Y": st1_pr_Y.value
    },
    {
      "tT": st2_pr_tT.value
     ,"H": st2_pr_H.value
     ,"Y": st2_pr_Y.value
    }
  ]



  //let str=JSON.stringify(req)
  console.log(req);
 $.ajax({
   method:"POST",
   url:"/program",
   data:{req}
 })
 .done(function (msg) { console.log("Saved"+msg);

 })
}
