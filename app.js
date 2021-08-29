//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const { query } = require("express");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/studyVIT",{useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true})

const buildingSchema = {
  name: String,
  location: Array
};

const Building = mongoose.model("Building", buildingSchema);

const classSchema = {
  classid:Number,
  courseCode:String,
  faculty:String,
  building:String,
  day:String,
  time:String,
  studentsRegistered:Number,
  location:[]
};

const Class = mongoose.model("Class", classSchema);

const courseSchema = {
  courseId:String,
  name:String,
  classes:Array
};

const Course = mongoose.model("Course", courseSchema);

const studentSchema = {
  rollNo:String,
  name:String,
  classes:Array
};

const Student = mongoose.model("Student", studentSchema);

app.post("/student",(req,res)=>{
  console.log(req.body);
  const newStudent = new Student({
    rollNo: req.body.number,
    name: req.body.name,
    classes:[]
  });

  newStudent.save(function(err){
    if (!err){
      res.send("Successfully added a new article.");
    } else {
      res.send(err);
    }
  });

})
app.get("/student/:studentId",(req,res)=>{
  // console.log(req.params.studentId);
  Student.find({rollNo: req.params.studentId}, (err, foundStudent)=>{
    if (foundStudent) {
      res.send(foundStudent);
    } else {
      res.send("No student found.");
    }
  });
})
app.get("/classes/:courseCode",(req,res)=>{
  Class.find({courseCode:req.params.courseCode},(err,foundClass)=>{
    if(foundClass){
      res.send(foundClass);
    }else{
      res.send("No class found.")
    }
  })
})

app.post("/:class/:studentId",(req,res)=>{
  console.log(req.params.class);
  const val=parseInt(req.params.class);
  Student.findOneAndUpdate({rollNo: req.params.studentId, classes:{$nin: [val]}}, {$push:{classes:val}}, {new: true}, (err, doc) => {
    if (err) {
        res.send("Something wrong when updating data!");
    }
     else {
       res.send(doc);
     }
});
})
app.delete("/class/:studentId/:classId",(req,res)=>{
  Student.findOneAndUpdate({rollNo: req.params.studentId, classes:{$in: [parseInt(req.params.classId)]}}, {$pull:{classes:parseInt(req.params.classId)}}, {new: true}, (err, doc) => {
    if (err) {
        res.send("Something wrong when updating data!");
    }
     else {
       res.send(doc);
     }
});
})

app.get("/class/:studentId",(req,res)=>{
  Student.find({rollNo:req.params.studentId},(err,foundClass)=>{
    if(foundClass[0].classes.length>0){
      res.send(foundClass[0].classes);
    }else{
      res.send("No class found.")
    }
  })
})

app.get("/classes-on-map/:courseCode",(req,res)=>{
  console.log(req.params.courseCode);
  Class.find({courseCode:req.params.courseCode},(err,foundClass)=>{
    if(foundClass){
      foundClass.forEach((item, index)=> {
        Student.find({classes:{$in: [item.classid]}},(err,found)=>{
            if(!err){
              console.log(found.length);
              Class.updateOne({classid:item.classid},{$set:{studentsRegistered:found.length}},{new: true}, (err, doc) => {
                if (err) {
                    console.log();("Something wrong when updating data!");
                }
                 else {
                  //  console.log(doc);
                 }
            });
            Building.find({name:item.building},(err,foundBuilding)=>{
              if(!err){
                // res.send(foundBuilding[0].location);
                console.log(foundBuilding[0].location);
                Class.updateOne({classid:item.classid},{$set:{location:foundBuilding[0].location}},{new: true},(err, doc) => {
                if (err) {
                    console.log();("Something wrong when updating data!");
                }
                 else {
                   console.log(doc);
                 }
                })
              }
            })
              }
        });
      });
    }
    Class.find({courseCode:req.params.courseCode},(err,foundClass)=>{
      if(!err){
        res.send(foundClass)
      }});
  })
})

app.get("/building/:classid",(req,res)=>{
  Class.find({classid: req.params.classid},(err,foundClass)=>{
    if(!err){
      Building.find({name:foundClass[0].building},(err,foundBuilding)=>{
        if(!err)res.send(foundBuilding[0].location);
      })
    }
  })
})
app.get("/courses",(req,res)=>{
  Course.find({},(err,found)=>{
    if(!err)res.send(found);
    else res.send("Not found");
  })
})
app.get("/:classid",(req,res)=>{
  Class.find({classid:req.params.classid},(err,found)=>{
    if(!err)res.send({Day:found[0].day,Time:found[0].time});
    else res.send("Not found");
  })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
