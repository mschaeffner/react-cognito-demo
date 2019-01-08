# Demo using AWS Cognito with a React webapp

## Set up AWS Cognito

### Install AWS CLI
`sudo pip install awscli`
or
`brew install awscli`

### Set up AWS access key and secret
`aws configure`

### Install Serverless framework
`npm install serverless -g`

### Create a new Serverless project
```
serverless install --url https://github.com/AnomalyInnovations/serverless-nodejs-starter --name react-cognito-demo-backend
cd react-cognito-demo-backend
npm install
```

### Add the user pool config
Create a new file _cognito-user-pool.yml_ with following content:
```
Resources:
  CognitoUserPool:
    Type: AWS::Cognito::UserPool
    Properties:
      # Generate a name based on the stage
      UserPoolName: dev-user-pool
      # Set email as an alias
      UsernameAttributes:
        - email
      AutoVerifiedAttributes:
        - email

  CognitoUserPoolClient:
    Type: AWS::Cognito::UserPoolClient
    Properties:
      # Generate an app client name based on the stage
      ClientName: dev-user-pool-client
      UserPoolId:
        Ref: CognitoUserPool
      ExplicitAuthFlows:
        - ADMIN_NO_SRP_AUTH
      GenerateSecret: false

# Print out the Id of the User Pool that is created
Outputs:
  UserPoolId:
    Value:
      Ref: CognitoUserPool

  UserPoolClientId:
    Value:
      Ref: CognitoUserPoolClient
```

### Add the identity pool config
Create a new file _cognito-identity-pool.yml_ with following content:
```
Resources:
  # The federated identity for our user pool to auth with
  CognitoIdentityPool:
    Type: AWS::Cognito::IdentityPool
    Properties:
      # Generate a name based on the stage
      IdentityPoolName: devIdentityPool
      # Don't allow unathenticated users
      AllowUnauthenticatedIdentities: false
      # Link to our User Pool
      CognitoIdentityProviders:
        - ClientId:
            Ref: CognitoUserPoolClient
          ProviderName:
            Fn::GetAtt: [ "CognitoUserPool", "ProviderName" ]

  # IAM roles
  CognitoIdentityPoolRoles:
    Type: AWS::Cognito::IdentityPoolRoleAttachment
    Properties:
      IdentityPoolId:
        Ref: CognitoIdentityPool
      Roles:
        authenticated:
          Fn::GetAtt: [CognitoAuthRole, Arn]

  # IAM role used for authenticated users
  CognitoAuthRole:
    Type: AWS::IAM::Role
    Properties:
      Path: /
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: 'Allow'
            Principal:
              Federated: 'cognito-identity.amazonaws.com'
            Action:
              - 'sts:AssumeRoleWithWebIdentity'
            Condition:
              StringEquals:
                'cognito-identity.amazonaws.com:aud':
                  Ref: CognitoIdentityPool
              'ForAnyValue:StringLike':
                'cognito-identity.amazonaws.com:amr': authenticated
      Policies:
        - PolicyName: 'CognitoAuthorizedPolicy'
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: 'Allow'
                Action:
                  - 'mobileanalytics:PutEvents'
                  - 'cognito-sync:*'
                  - 'cognito-identity:*'
                Resource: '*'

# Print out the Id of the Identity Pool that is created
Outputs:
  IdentityPoolId:
    Value:
      Ref: CognitoIdentityPool
```

### Add the Cognito resources to the Serverless config
Add the following to the end of the file _serverless.yml_:
```
resources:
  - ${file(cognito-user-pool.yml)}
  - ${file(cognito-identity-pool.yml)}
```

### Deploy into AWS
`serverless deploy -v`
or
`serverless deploy -v --aws-profile myProfile`



## Set up React app

### Create a new React project
```
npx create-react-app react-cognito-demo-frontend
cd react-cognito-demo-frontend
npm start
```

### Install NPM dependecies
`npm install aws-amplify react-router-dom react-bootstrap --save`

### Add css file for bootstrap
In _public/index.html_ add following line in head:

`<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">`




### Add Amplify config
Create a new file _config.js_ with following content (the values are printed in console at the end of _serverless deploy -v_):
```
export default {
  cognito: {
    REGION: "XXXXXXX",
    USER_POOL_ID: "XXXXXXX",
    APP_CLIENT_ID: "XXXXXXX",
    IDENTITY_POOL_ID: "XXXXXXX"
  }
};
```

### Setup Amplify and React router
See file [index.js](react-cognito-demo-frontend/src/index.js)

### Handle state of authentication
See file [App.js](react-cognito-demo-frontend/src/App.js)

### Set up routes to all pages
Create a new file [Routes.js](react-cognito-demo-frontend/src/Routes.js)

### Set up routes to all pages
Create a new file [Routes.js](react-cognito-demo-frontend/src/Routes.js)

### Set up all pages
Create a new file [Signup.js](react-cognito-demo-frontend/src/Signup.js)

Create a new file [Login.js](react-cognito-demo-frontend/src/Login.js)

Create a new file [Home.js](react-cognito-demo-frontend/src/Home.js)

### Run React App
`npm start`

### Set up AWS S3 bucket for static website hosting

* Log into AWS console (https://console.aws.amazon.com)
* Create a new S3 bucket
* In the permissions step, make sure to uncheck **Block new public bucket policies** and **Block public and cross-account access if bucket has public policies.**
* Go to **Permissions** tab and select **Bucket policy**
* Add following content into policy editor, and replace _YOUR_S3_BUCKET_NAME_ with the name of your bucket:
```
{
  "Version":"2012-10-17",
  "Statement":[{
	"Sid":"PublicReadForGetBucketObjects",
        "Effect":"Allow",
	  "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::YOUR_S3_BUCKET_NAME/*"]
    }
  ]
}
```
* Go to **Properties** tab and select **Static website hosting**
* Select **Use this bucket to host a website** and add **index.html** as the Index Document and the Error Document.

### Build the React app
`npm run build`

### Sync the React app into S3 bucket
`aws s3 sync build/ s3://YOUR_S3_BUCKET_NAME`

### See the React app running
Go to http://YOUR_S3_BUCKET_NAME.s3-website-us-east-1.amazonaws.com
