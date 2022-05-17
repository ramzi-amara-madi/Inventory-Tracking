# Inventory-tracking
This project is an inventory tracking web application for a logistics company. The project is already deploy to a server. You can acces it with this link : https://inventory-tracking-shopify.herokuapp.com/

## What does the app do
This application allows you to :
  - Create inventory items
  - Edit Them
  - Delete Them
  - View a list of them
  - Create warehouses and assign multiple items to it

## What do you need to run the app
1. Docker

## How to run the app
1. Clone the project on your machine
2. In the terminal, go to the project directory
3. Run the command `docker-compose up`. The app will be served at localhost:3000
4. Go to http://localhost:3000/ in your browser and the application should be running

## Must know
- An item can't be created without being associated to a warehouse. 
- A warehouse can't be deleted if there is still items associated to it

## Dependencies
- Express
- Node
- body-parser
- ejs
- multer
- mongoose
