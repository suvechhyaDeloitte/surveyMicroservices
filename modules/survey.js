global.fetch = require('node-fetch');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const SURVEY_TABLE = process.env.SURVEY_TABLE || 'Surveys';
const dynamoDb = new AWS.DynamoDB.DocumentClient();
var Promise = require('promise');

module.exports.getItemByName = (event, context, callback) =>{
    const data = event.body ? JSON.parse(event.body) : event;
    const params = {
        TableName : SURVEY_TABLE,
        KeyConditionExpression: "#name = :name",
        ExpressionAttributeNames:{
            "#name": "name"
        },
        ExpressionAttributeValues: {
            ":name": data.name
        }
    };

    dynamoDb.query(params, (error, result) => {
        if (error) {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(err)
            });
        }
        else{
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(result)
            });
        }
        
    });
}

module.exports.update = (event, context, callback) =>{
    const data = event.body ? JSON.parse(event.body) : event;
    const params = {
        TableName:SURVEY_TABLE,
    Key:{
        "name": data.name,
        "createdBy": data.userName
    },
    UpdateExpression: "remove questions[0]",
    ConditionExpression: "createdBy = :userName",
    ExpressionAttributeValues:{
        ":userName": data.userName
    },
    ReturnValues:"UPDATED_NEW"
    };

    dynamoDb.update(params, (error, result) => {
        if (error) {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(error)
            });
        }
        else{
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(result)
            });
        }
        
    });
}

module.exports.getAllSurveys = (event, context, callback) => {

    const params = {
        TableName: SURVEY_TABLE
    }

    dynamoDb.scan(params, (error, result) => {
        if (error) {
            console.log(error);
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(error)
            });
        }
        else {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(result)
            });
        }

    });
};

module.exports.create = (event, context, callback) => {
    const data = event.body ? JSON.parse(event.body) : event; // Change the whole thing to JSON.Parse once completed testing
    const hashkey = uuid();

    const survey = {
        hashkey: hashkey,
        name: data.name,
        createdBy: data.userName,
        created: new Date().getTime(),
        topicId:data.topicId,
        topicName:data.topicName,
        questions:data.questions
    };

    const params = {
        TableName: SURVEY_TABLE,
        Item: survey
      };

      dynamoDb.put(params, (error) => {
        if (error) {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(error)
            });
        }
        else{
            callback(null, {
                statusCode: 200,
                body: JSON.stringify("SUCCESS")
            });
        }
    });

};