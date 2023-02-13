# Reddit clone server

Back end for reddit clone MERN app.

Code for the front end can be found [here](https://github.com/hectorgonzalezo/reddit-clone).

By [Héctor González Orozco](https://github.com/hectorgonzalezo)

## :computer: Built With

* [NodeJS](https://nodejs.org/)
* [MongoDB](https://www.mongodb.com/)
* [ExpressJS](https://expressjs.com/)


## :pager: API URL

Hosted at: [https://reddit-server.herokuapp.com/](https://reddit-server.herokuapp.com/)

## :rocket: Features

- Users can sign up and log in without keeping a server side session by using [passportjs](http://www.passportjs.org/) with [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken).

- Logged in users can create posts, comments and new communities.

- Only the user who created them is allowed to update posts or comments.



## :construction: Installing

1. Clone the repository

`git clone https://github.com/hectorgonzalezo/reddit-clone-server`

2. Install dependencies

`npm install`

3. Create a .env file on root directory of project with Mongo DB URI and authorization string. The format must be the following:

`MONGODB_URI="mongoUri"`
`AUTH_SECRET="randomString"`

4. Start the server

`npm start`

Typescript code can be compiled by using the following command:

`npm run build`

Alternatively, The server can be started and compiled in real-time after detecting changes by using:

`npm run dev`

## :white_check_mark: Tests

API is thoroughly tested. Tests can be run by using:

`npx jest`


## Endpoints

**JSON response examples**

- User:
```json
{
  "user":
    {
      "id": "1",
      "username": "fake",
      "votes": {},
      "communities": [],
      "icon": "http://icon.url",
    },
  "token": "fakejsonwebtoken",
}
```

- Post:
```json
  "post":{
    "title": "Mock post",
    "text": "This is a mock post made for testing purposes",
    "user": "12345678901234567890abcd",
    "community": "123456789012345678901234",
    "comments": []
  }
```

- Comment:
```json
  "comment": {
      "text": "Mock comment",
      "user": "123456789012345678901234",
      "upVotes": "1",
      "responses": []
    }
```

- Community:
```json
  "community": {
      "name": "mockCommunity",
      "subtitle": "Fake community",
      "description": "This is a fake community created for testing purposes",
      "creator": "123456789012345678901234",
      "users": [],
      "posts": [],
  }
```


- Errors:
```json
{
  "errors": [
    { "msg": "Only the user itself can update it" }
  ]
}
```


### :relaxed: Users

#### - GET /users/id

Retrieves basic info about a user

**Path Parameters**

- id: The ID of the user to retrieve.

**Response**

- `200 OK` and user JSON on success.

- `404 Not Found` if user doesn't exist.


#### - PUT /users/id

Updates user info

**Path Parameters**

- id: The ID of the user to update.

**Header and Data example**
- Header: `"Content-Type: application/json"`
- Data example: `"{username: "updated1" email: "updated1@mock.com", password: "123456",passwordConfirm: "123456"}"`


**Response**

- `200 OK` and user JSON on success.

- `403 Forbidden` and errors JSON if trying to update another user or not logged in.

- `404 Not Found` if user to update doesn't exist.


#### - GET /users/log-in

Log in user

**Response**

- `200 OK` and user JSON on success.

- `404 Not Found` and errors JSON if there was an error with user authentication


#### - GET /users/sign-up

Sign up user

**Response**

- `200 OK` and user JSON on success.

- `404 Not Found` and error JSON if there was an error with user data validation

### :scroll: Posts


#### - GET /posts/

Retrieves all posts in database


**Response**

- `200 OK` and list of post JSONs on success.

- `404 Not Found` if post doesn't exist.

#### - GET /posts/id

Retrieves a single post.

**Path Parameters**

- id: The ID of the post to retrieve;

**Response**

- `200 OK` and post JSON on success.

- `404 Not Found` if post doesn't exist.

#### - POST /posts

Creates post


**Header and Data example**
- Header: `"Content-Type: application/json"`
- Data example: `{title: "New mock post", text: "New fake post", community: 123456789012345678901234}`


**Response**

- `200 OK` and post JSON on success.

- `400 Bad Request` if given wrong data format.

- `403 Forbidden` and errors JSON if user is not logged in.


#### - PUT /posts/id

Updates post

**Path Parameters**

- id: The ID of the post to update.

**Header and Data example**
- Header: `"Content-Type: application/json"`
- Data example: `"{username: "updated1" email: "updated1@mock.com", password: "123456",passwordConfirm: "123456"}"`


**Response**

- `200 OK` and post JSON on success.

- `400 Bad Request` if given wrong data format.

- `403 Forbidden` and errors JSON if trying to update another user's post or not logged in.

- `404 Not Found` if post to update doesn't exist.



### :speech_balloon: Comments


#### - GET /comments/

Retrieves all comments in database


**Response**

- `200 OK` and list of comment JSONs on success.

- `404 Not Found` if comment doesn't exist.

#### - GET /comments/id

Retrieves a single comment

**Path Parameters**

- id: The ID of the comment to retrieve;

**Response**

- `200 OK` and comment JSON on success.

- `404 Not Found` if comment doesn't exist.

#### - POST /comments

Creates comment


**Header and Data example**
- Header: `"Content-Type: application/json"`
- Data example: `{ text: "New fake comment" }`


**Response**

- `200 OK` and comment JSON on success.

- `400 Bad Request` if given wrong data format.

- `403 Forbidden` and errors JSON if user is not logged in.



#### - PUT /comments/id



Updates comment

**Path Parameters**

- id: The ID of the comment to update.

**Header and Data example**
- Header: `"Content-Type: application/json"`
- Data example: `"{username: "updated1" email: "updated1@mock.com", password: "123456",passwordConfirm: "123456"}"`


**Response**

- `200 OK` and comment JSON on success.

- `400 Bad Request` if given wrong data format.

- `403 Forbidden` and errors JSON if trying to update another user's comment or not logged in.

- `404 Not Found` if comment to update doesn't exist.


### :busts_in_silhouette: Communities


#### - GET /communities/

Retrieves all communities in database


**Response**

- `200 OK` and list of community JSONs on success.

- `404 Not Found` if community doesn't exist.

#### - GET /communities/id

Retrieves a single community.

**Path Parameters**

- id: The ID of the community to retrieve;

**Response**

- `200 OK` and community JSON on success.

- `404 Not Found` if community doesn't exist.

#### - POST /communities

Creates community


**Header and Data example**
- Header: `"Content-Type: application/json"`
- Data example: `{name: "newMock", subtitle: "New fake community", description: "This is a new fake community created for testing purposes"}`


**Response**

- `200 OK` and community JSON on success.

- `400 Bad Request` if given wrong data format.

- `403 Forbidden` and errors JSON if user is not logged in.



#### - PUT /communities/id

Updates community

**Path Parameters**

- id: The ID of the community to update.

**Header and Data example**
- Header: `"Content-Type: application/json"`
- Data example: `{name: "newMock", subtitle: "New fake community", description: "This is a new fake community created for testing purposes"}`


**Response**

- `200 OK` and community JSON on success.

- `400 Bad Request` if given wrong data format.

- `403 Forbidden` and errors JSON if trying to update another user's community or not logged in.

- `404 Not Found` if community to update doesn't exist.
