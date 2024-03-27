# Build localy with vars in .env

NUXT_APP_BACKEND_URL=https://admin.renaudcollet.com
NUXT_APP_URL=https://renaudcollet.com
NUXT_API_URL=https://admin.renaudcollet.com/api

Upload to ionos, then restart Nodejs App in Plesk admin panel

Logs: Nodejs Logs on server are in /var/log/passenger/passenger.log, access with root user

## Plesk Server errors logs

Have a look in /var/log/passenger with root user

## Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install --shamefully-hoist
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
