# webcw Adam Lyons 1402677

Could not get game to work with the user login and authentication system, suspect its a problem with the bootstrap template
Game folder can be downloaded seperatley to run the game
Other files run user login and authentication

RUN

> npm install
> node server.js

local mongoDB database required on localhost:27017 for user management

navigate to localhost:80/user/sample to create a test user to login with
> username: chris
> password: supersecret

new users car be created with localhost:80/users/create

>user login and routing taken from userCRM-final
