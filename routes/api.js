/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

let client, db;

(async function(){
  try {
    client = new MongoClient(CONNECTION_STRING, { useNewUrlParser: true });
    await client.connect();
    db = client.db('fcc');
  } catch(err) {
    console.log(err);
  }
})();

module.exports = async function (app) {

  app.route('/api/issues/:project')
    .get(async function (req, res){
      var project = req.params.project;
      try {
        if (req.query._id)
          req.query._id = ObjectId(req.query._id);
        
        if (req.query.open)
          req.query.open = req.query.open=='false'?false:true;
        const d = await db.collection(project).find(req.query).toArray();
        return res.json(d);
      } catch (err) {
        console.error(err.message);
      }
    })
  
    .post(async function (req, res){
      var project = req.params.project;
      let d = {};
      if (req.body.issue_title)
        d.issue_title = req.body.issue_title;
      else
        return res.send('missing inputs');
    
      if (req.body.issue_text)
        d.issue_text = req.body.issue_text;
      else
        return res.send('missing inputs');
    
      if (req.body.created_by)
        d.created_by = req.body.created_by;
      else
        return res.send('missing inputs');
    
      if (req.body.assigned_to)
        d.assigned_to = req.body.assigned_to;
      else
        d.assigned_to = "";
    
      if (req.body.status_text)
        d.status_text = req.body.status_text;
      else
        d.status_text = "";
    
      d.created_on = new Date();
      d.updated_on = d.created_on;
      d.open = true;
      try {
        let r = await db.collection(project).insertOne(d);
        d._id = r.insertedId; 
        return res.json(d);
      } catch (err) {
        console.log(err);
      }
    })
  
    .put(async function (req, res){
      var project = req.params.project;
      let d = {};
      if (req.body.issue_title) 
        d.issue_title = req.body.issue_title;
      if (req.body.issue_text)
        d.issue_text = req.body.issue_text;
      if (req.body.created_by)
        d.created_by = req.body.created_by;
      if (req.body.assigned_to)
        d.assigned_to = req.body.assigned_to;
      if (req.body.status_text)
        d.status_text = req.body.status_text;
      if (req.body.open == 'false')
        d.open = false;
      try {
        let r = await db.collection(project).findOneAndUpdate({_id: ObjectId(req.body._id)}, {$currentDate: {updated_on:true}, $set: d});
        res.send('successfully updated');
      } catch (err) {
        res.send('could not update '+ req.body._id);
      }
    })
  
    .delete(async function (req, res){
      var project = req.params.project;
      if (!req.body._id)
        return res.send('_id error');
      try {
        let r = await db.collection(project).deleteOne({_id: ObjectId(req.body._id)})
        return res.send('deleted '+ req.body._id)
      } catch (err) {
        return res.send('could not delete '+ req.body._id);
      }
    });
};
