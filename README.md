# Car-Game
Git repository of a car guessing game

## 5 cars once:

Returning 5 cars at once is more efficient than returning 1 car at once upon request because it reduces the number of requests the client has to make to the server.
When the client requests for only 1 car at a time, it would have to make multiple requests to the server to retrieve all the cars it needs.
This would increase the server's workload and could result in slower response times and decreased performance.
Returning multiple cars at once reduces the number of requests and can improve the overall performance and user experience of the application.

## Links over Base64

It is better to return the links to the images that are hosted on the internet from the database rather than using base64 for the car images for a few reasons:

*Efficiency: When returning the links to the images, the amount of data sent from the server to the client is reduced.
In contrast, when using base64, the image data is encoded into a string, which increases the amount of data sent over the network.

*Caching: Browsers can cache images that are loaded from a URL, which can improve the performance of the application for subsequent requests.
In contrast, base64-encoded images are not cached by browsers.

*Flexibility: If the images are hosted on the internet, it is easier to replace them with updated images or add new images to the collection without having to modify the database or the API.
In contrast, if the images are stored as base64-encoded strings in the database, updating or adding new images would require modifying the database or the API.

Overall, it is better to return links to the images hosted on the internet from the database because it is more efficient, flexible, and can be easily cached by browsers.
