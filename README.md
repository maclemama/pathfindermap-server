
![Logo](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-ydJTF4mpgDjo0ijkSP7Rghjt_fHt-fDCefpg49fMCRnUVkuGG7BQLjgbK2vrZ36jbpzUtYRP94AYIufe474moAMDjaVQ=w898-h3164)


# Pathfinder Map

This application is a map and walking route recommendation application. User could enter their route duration, (sigle or multiple) places keywords, the mood they want to feel in their journey or even choose random route suggestions. The application would then based on user location or selected starting point to draw serveral suggested routes on a map and suggested places along the way they could check out. If they feel good about specific route or they want to plan ahead, they could save the route in their account and revisit those saved routes later in their profile page.


## Features

- Keywords mode multiple waypoints route search
- Mood mode route search
- Shuffle aka. random mode route search
- Click on routes on the map to get details of each place along specific route such as user rating, price level on Google map and contact information
- Save route and check saved route history in profile page
 


## Run Locally
Please note that the [[Client]](https://github.com/maclemama/pathfindermap) and [[Server]](https://github.com/maclemama/pathfindermap-server) code of Pathfinder Map are seperated into two repositories. To test it locally, you will need to install both repositories. For this client side repository, please follow below instruction to install:


Clone [[Server]](https://github.com/maclemama/pathfindermap-server) repository.

```bash
  git clone git@github.com:maclemama/pathfindermap-server.git
```

Go to the project directory

```bash
  cd pathfindermap-server
```

Install dependencies

```bash
  npm install
```

Create a mySQL database locally with database name of your choice

Create environment file detailed in the .env.sample

Create database tables with Knex migration

```bash
  npm run migrate
```

Inject seed data to database [***optional***]

```bash
  npm run seed
```

Start the local server

```bash
  npm start
```


