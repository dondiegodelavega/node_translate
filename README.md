# node translate

Node translate is a basic text translation web application which supports ENGLISH , FRENCH and SPANISH languegues (Yendex Translate API).
It has implemented using node.js , Express.js and MongoDB.

## How to install:
+ 1. Clone the repository on your local deivice. 
+ 2. Make sure you have [MongoDb](https://docs.mongodb.com/manual/installation/?jmp=footer) installed.
+ 4. Run Mangodb with [authentication](https://docs.mongodb.com/manual/tutorial/enable-authentication/).
  - Create a new user and assign to the db with readWrite [role](https://docs.mongodb.com/v3.2/tutorial/manage-users-and-roles/).
  - Update db connction url in config/default.json based on created user credintials.
+ 5. Run 'npm install'.
+ 6. Run 'npm start' and navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

## Note:
+ You can change the MongoDB server URL in app.js in the root folder.
+ The other configuration paths and Yendex key are configurable in /public/javascripts/config.js .
