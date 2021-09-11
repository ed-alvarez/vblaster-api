# VBlaster API

VBlaster is an old project of mine that consisted in automating phone campaigns for Asterisk via a web application.
This repo contains the API part of it.

This project is considered completely deprecated.

## Configuration

**You need to configure VBlaster API before bootstraping.**

`config/main.json`

```js
{
	"jwtKey": "secret_jwt_key",
	"jwtRefreshKey": "secret_jwt_refresh_key",
	"http": {
		"port": 8080,
		"allowedOrigins": [
			"localhost"
		]
	},
	"mysql": {
		"host": "host",
		"username": "vblaster",
		"password": "password",
		"database": "vblaster"
	},
	"misc": {
		"audioFilePath": "/var/lib/asterisk/sounds/en/"
	}
}
```

## License

NO LICENSE - This code is free to use.
