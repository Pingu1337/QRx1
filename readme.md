# QRx1

> API that delivers **_Dynamic One Time Use QR Codes_**

- [Highlights](#highlights)
- [Usage](#usage)
- [Customization](#customization)
- [Custom Timeout](#timeout)
- [License](#license)

## Highlights

- Serves Dynamic QR codes that self destruct after 60minutes
- Customizable apperance (color, size, margin and quality)
- Runs MongoDB with TTL expiration
- QR codes can only be used once, ideal for limited URLs such as authorization links or one-time offers

## Usage

To generate a QR code, simply make a GET request to the `/qr` endpoint and add a query parameter called `data` containing the URL

```
/qr?data=https://wikipedia.org
```

Alternatively add a the URL in the body when making a GET request

```json
{
  "data": "https://berrykitten.com"
}
```

## Customization

The `/qr` endpoint accepts a set of options if you want to change the appearance of the QR code

##### Request Body

```json
"options": {
    "width": 500, // sets the width of the image in pixels
    "dark": "987fee", // hex color for the dark parts (the dots/squares)
    "light": "fefefe", // hex color for the light parts (the background)
    "quality": 1, // sets quality - range from 0-1
    "margin": 3 // margin from the code to the edge
  }
```

##### Query Parameter

`/qr?data=https://wikipedia.org&width=500&dark=000fff&light=fff&quality=1&margin=3`

## Timeout

Set custom expiration of unclaimed QR code

> Range from 0 - 600 seconds _(maximum lifetime is 60minutes, defaults to 3minutes)_

##### Request Body

```json
{
  "data": "https://berrykitten.com",
  "timeout": 10 // Set custom timeout in seconds
}
```

##### Query Parameter

```
/qr?data=https://wikipedia.org&timeout=10
```

## Contribute

> If you wish to contribute to this project feel free to open a PR

### How to get the project running correctly with MongoDB

1.  [Download](https://www.mongodb.com/try/download/community) and install MongoDB Community Server
2.  install [nodemon]('https://www.npmjs.com/package/nodemon) `npm install -g nodemon # or using yarn: yarn global add nodemon`
3.  In the root folder of the repo, create a `.env` file with the following configuration:

    ```.env
    MONGO_DB_URI = "mongodb://localhost:27017/URL-shortener"
    ```

    > This is the connection string to your local MongoDB, it may look different depending on your settings.

4.  run `npm install` and you are done, the project should now be working on your local machine!
5.  run `npm start` to start the server and serve the API on `http://localhost:3000`

> Since the redirect is done on the same server(localhost) you cannot scan the QR codes with your phone. I would recommentd using a browser plugin or similar software to scan the QR codes. \
> **[I'm using this chrome extension](https://chrome.google.com/webstore/detail/qr-code-reader/likadllkkidlligfcdhfnnbkjigdkmci)**

<br>

## Related Repositories

- [node-qrcode](https://github.com/soldair/node-qrcode)

<br>

## License

[MIT](https://github.com/pingu1337/qrx1/blob/master/license)

The word "QR Code" is registered trademark of:<br>
DENSO WAVE INCORPORATED
