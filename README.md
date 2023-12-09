# BrandRace: Real-Time Multiplayer Game

## Description
BrandRace is a real-time multiplayer game that challenges players to identify car brand logos faster than their opponents. The game is implemented using Web Sockets, allowing for real-time interaction between players.

## Implementation
The project includes three main components:
1. **PHP API**: This API is hosted off Wheatley and interacts with a MySQL database to manage game data.
2. **NodeJS Socket Server**: This local server polls the PHP API to retrieve game data in real-time.
3. **Web Client**: This is the front end of the game, which connects to the NodeJS socket server and provides the user interface for players.

## Languages Used
- PHP: Used to create the API that interacts with the MySQL database.
- NodeJS: Used to create the socket server that polls the PHP API and manages real-time data.
- HTML/CSS/JavaScript: Used to create the web client that serves as the front end of the game.

## License
This project is licensed under the terms of the MIT license. See the LICENSE.md file for details.

