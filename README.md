# Ledstrip by Emil Djupvik

This project is about controlling a LED strip using a Raspberry Pi. The LED strip is a WS2812B strip, which is a LED strip with individually addressable LEDs. The Raspberry Pi is running a [Python script](./api/app.py) that controls the LED strip, based on the commands it receives over MQTT. The project also includes a [Next.js web app](./client/README.md) that can be used to control the LED strip over MQTT, proxied with WS server that is used for authentication. The WS server is part of the Next.js app.

## Development

I have setup a development environment to make it easy to develop without having access to any kind of physical hardware. The ledstrip itself is instead simulated in python, and shown to the user with pygame.

### API

It's kinda cringe to call it an API, but it's the backend part of the project. It's a python script that controls the LED strip. It's running on a Raspberry Pi in the real world, but in the development environment it's running on your computer.

- Make sure to have python 3.11+ installed.
- Make sure you have access to a MQTT broker. Run one locally with `docker compose up -d`. You will need to have [docker](https://www.docker.com/) installed for this.

To start the API, run the following commands:

```bash
# Set your PYTHONPATH
export PYTHONPATH=$PWD
# Alternatively, append the following to your  ~/.bashrc file
export PYTHONPATH=$PYTHONPATH:<path-to-repo>

cd api

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Then, create a `.env` file in the `api` directory with the following content:

```bash
LEDSTRIP_SERVICE=pygame
MQTT_HOST=localhost
LEDSTRIP_ID=0
```

Finally, start the API:

```bash
cd api
python app.py
```

### Client

The client is a Next.js web app that can be used to control the LED strip.

- Make sure to have [node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
- A Clerk project is required to run the client. Create one at [clerk.com](https://clerk.com/).
- Make sure you have access to a MQTT broker. Run one locally with `docker compose up -d`. You will need to have [docker](https://www.docker.com/) installed for this.

Create a `.env` file in the `client` directory with the following content:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
CLERK_PEM_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----YOUR\nPUBLIC\nKEY-----END PUBLIC KEY-----"
MQTT_URL=ws://localhost:9001
DATABASE_URL=file:sqlite.db
```

Finally, start the client:

```bash
cd client
npm ci
npx next-ws-cli@latest patch
npx prisma db push
npm run dev
```
