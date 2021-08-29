//jshint esversion: 6

const express = require("express")
const ejs= require("ejs");
const bodyParser=require("body-parser")
const { appendFile } = require("fs")
const app=express();
const axios = require('axios');
const qs = require('qs');
let alert=require('alert');

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine","ejs")

let rollNo;

var tt={
    'Monday':[],
    'Tuesday':[],
    'Wednesday':[],
    'Thursday':[],
    'Friday':[]
}
// for register and login

app.get('/register',(req,res)=>{
res.render("register")
})
app.get('/login',(req,res)=>{
    res.render("login")
    })


app.post('/register',(req,res)=>{
    // console.log(" -",req.body.email," - ",req.body.password)
    const name = req.body.name;
    const number = req.body.number;
    rollNo=number
    var data = qs.stringify({
        'name': name,
        'number': number 
      });
    axios({
        method: 'post',
        url: 'http://localhost:3000/student',
        data: data
      });
    res.redirect("/cover");
})
app.post('/login',(req,res)=>{
    // console.log(" -",req.body.email," - ",req.body.password)
    const name = req.body.name;
    const number = req.body.number;
    rollNo=number;
    function getSeller() {
        return axios.get(`http://localhost:3000/student/${number}`);}
        getSeller().then(function (response) {
          console.log(response);
        });
    res.redirect("/cover");
})

// to display cover page

app.get('/cover',(req,res)=>{
    res.render("cover")
    })

// Courses 

app.post('/courses',(req,res)=>{
    // console.log(" -",req.body.email," - ",req.body.password)
    var config = {
        method: 'get',
        url: 'http://localhost:3000/courses',
        headers: { }
      };
      
      axios(config)
      .then(function (response) {
        var val=JSON.stringify(response.data);
        val=JSON.parse(val);
        // console.log(val[0]);
        res.render('coursesList',{myList:val});
      })
      .catch(function (error) {
        console.log(error);
      }); 

})

// to add a class 
app.post('/addClass',(req,res)=>{
    const cId = req.body.newClass;
    function getSeller() {
    return axios.post(`http://localhost:3000/${cId}/${rollNo}`);}
    getSeller().then(function (response) {
            console.log(JSON.stringify(response.data));
            alert("Success");
            res.redirect('/cover');
          })
          .catch(function (error) {
            console.log("error");
            res.redirect('/cover');
          });
})

// to display timetable
app.post('/timetable',(req,res)=>{
    function getSeller() {
        return axios.get(`http://localhost:3000/class/${rollNo}`);}
     getSeller().then( (response)=> {
            var ids=encodeURIComponent(JSON.parse(JSON.stringify(response.data)));
            res.redirect('/timetable/?ids='+ids);
          });
})
app.get('/timetable',(req,res)=>{
    tt={
        'Monday':[],
        'Tuesday':[],
        'Wednesday':[],
        'Thursday':[],
        'Friday':[]
    }
    var val=req.query.ids;
    var ids = new Array();
    ids = val.split(',');
    console.log(ids.length);
    for (let i = 0; i < ids.length; i++) {
        cls=ids[i];
            function getSeller() {
            return axios.get(`http://localhost:3000/${cls}`);}
            getSeller().then((resp)=>{
                // console.log(tt[resp.data.Day]);
                tt[resp.data.Day].push(resp.data.Time);
                if(i==(ids.length-1)){
                    console.log(tt);
                    res.render('timetable',{timetable:tt});
                } 
            })   
      }
})

// to delete a class 
app.post('/delClass',(req,res)=>{
    const cId = req.body.newClass;
    function getSeller() {
    return axios.delete(`http://localhost:3000/class/${cId}/${rollNo}`);}
    getSeller().then(function (response) {
            console.log(JSON.stringify(response.data));
            alert("Success");
            res.redirect('/cover');
          })
          .catch(function (error) {
            console.log("error");
            res.redirect('/cover');
          });
})
// display map
app.post('/map',(req,res)=>{
    var location=[ ['Building name: SJT <br> Course name: DBMS ', 12.971029, 79.163947, 1],
	    ['Building name: TT <br> Course name: OS', 12.970783488806115, 79.1597417163366, 2]];
    res.render('map',{data:location});
})
app.post('/knowCourse',(req,res)=>{
    const course = req.body.newCourse;
    function getSeller() {
    return axios.get(`http://localhost:3000/classes-on-map/${course}`);}
    getSeller().then(function (response) {
        const data=JSON.parse(JSON.stringify(response.data));
        // console.log(data);
        // res.render('map',{data:val});
        var locations=[ ];
         for(var i=0; i<data.length; i++) { 
         locations[i]=['Building name:'+data[i].building+'<br> Course name:'+data[i].courseCode+'<br>No.of Students:'+data[i].studentsRegistered,data[i].location[0] , data[i].location[1], i+1];
     }
     console.log(locations);
     res.render('map',{data:locations})
    })
})

app.listen(8000, ()=>{
    console.log("Started listening on port 8000")
})