global.fetch = require('node-fetch');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const amazonCognito = require('amazon-cognito-identity-js');
const USERS_TABLE = process.env.USERS_TABLE || 'Users';
const dynamoDb = new AWS.DynamoDB();
var Promise = require('promise');
const userPool = new amazonCognito.CognitoUserPool({ UserPoolId : 'us-east-1_9AqkVwyny',ClientId : '7n9mmg9b2749tmtql9a5jhn7v0'});

module.exports.register = (event, context, callback) => {
    const data = event.body ? JSON.parse(event.body) : event; // Change the whole thing to JSON.Parse once completed testing
    const hashkey = uuid();

    const user = {
        hashkey: hashkey,
        name: data.name,
        userName: data.userName,
        mobile: data.mobile,
        email: data.email,
        created: new Date().getTime(),
        surveys:[]
    };
    var username = data.userName;
    var pw = data.password;

    var attributeList = [];
    var attributeEmail = new amazonCognito.CognitoUserAttribute({Name : 'email', Value : data.email});
    var attributePhoneNumber = new amazonCognito.CognitoUserAttribute({Name : 'phone_number',Value : data.mobile});

    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);

    userPool.signUp(username, pw, attributeList, null,function(err, result){
        if (err) {
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
};

module.exports.login = (event, context, callback) => {
    const data = event.body ? JSON.parse(event.body) : event;
    const username = data.userName;
    const pw = data.password;
    var authenticationDetails = new amazonCognito.AuthenticationDetails({Username:username,Password:pw});
    
    var userData = {
        Username :username,
        Pool : userPool
    };
    var cognitoUser = new amazonCognito.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            callback(null,{body:JSON.stringify(result.getAccessToken().getJwtToken()),
            statusCode:200});
        },

        onFailure: function(err) {
            callback(null,{body:JSON.stringify(err),
                statusCode:200});
        },
    });
};

module.exports.signout = (event, context, callback) => {
    const data = event.body ? JSON.parse(event.body) : event;
    const username = data.userName;
    const pw = data.password;
    
    var userData = {
        Username :username,
        Pool : userPool
    };
    var cognitoUser = new amazonCognito.CognitoUser(userData);
    if (cognitoUser != null) {
        cognitoUser.signOut()
        .then(result=>{
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
        });;
    }
};

module.exports.confirm = (event, context, callback) => {
    const data = event.body ? JSON.parse(event.body) : event;
    const username = data.userName;
    const pw = data.password;
    const code = data.code;
    var authenticationDetails = new amazonCognito.AuthenticationDetails({Username:username,Password:pw});
    
    var userData = {
        Username :username,
        Pool : userPool
    };
    var cognitoUser = new amazonCognito.CognitoUser(userData);

    cognitoUser.confirmRegistration(code, true, function(err, result) {
        if (err) {
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
};