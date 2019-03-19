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
    
    function asyncGetItem(params, dynamoDb) {
        return new Promise(function(resolve, reject) {
            dynamoDb.query(params, (error, result) => {
                if (error) {
                console.log(error);
                reject(error);
                }
                else resolve(result);
                
            });
        });
    }

    asyncGetItem(params, dynamoDb)
        .then(result => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(result)
            });
        })
        .catch(err => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(err)
            });
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
    
    function asyncUpdateItem(params, dynamoDb) {
        return new Promise(function(resolve, reject) {
            dynamoDb.update(params, (error, result) => {
                if (error) {
                console.log(error);
                reject(error);
                }
                else resolve(result);
                
            });
        });
    }

    asyncUpdateItem(params, dynamoDb)
        .then(result => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(result)
            });
        })
        .catch(err => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(err)
            });
        });
}

module.exports.getAllSurveys = (event, context, callback) => {

    const params = {
        TableName: SURVEY_TABLE
    }
    
    function asyncGetAll(params, dynamoDb) {
        return new Promise(function(resolve, reject) {
            dynamoDb.scan(params, (error, result) => {
                if (error) {
                console.log(error);
                reject(error);
                }
                else resolve(result);
                
            });
        });
    }

    asyncGetAll(params, dynamoDb)
        .then(result => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(result)
            });
        })
        .catch(err => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(err)
            });
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

    console.log(params);

    function asyncCreateSurvey(params, dynamoDb) {
        return new Promise(function(resolve, reject) {
            dynamoDb.put(params, (error) => {
                if (error) {
                    reject(error);
                }
                else resolve("SUCCESS");
            });
        });
    };

    asyncCreateSurvey(params, dynamoDb)
        .then(result => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(result)
            });
        })
        .catch(err => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(err)
            });
        });

};