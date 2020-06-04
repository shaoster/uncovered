import { Server } from 'boardgame.io/server';
import path from 'path';
import serveStatic from 'koa-static';
import sslify, { xForwardedProtoResolver } from 'koa-sslify';
import Game from './game';

const server = Server({ games: [Game] });
const PORT = process.env.PORT || 8000;

// The client uses localStorage rather than cookies, which has the
// security feature of not sharing keys between http and https urls.
// Thus, we'll force clients to use SSL.
// Note: Heroku uses the xForwardedProto header to indicate the protocol
// of the original request before ssl-termination at the LB.
if (process.env.NODE_ENV === 'production') {
  server.app.use(sslify({ resolver: xForwardedProtoResolver}));
}

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, '../build/');
server.app.use(serveStatic(frontEndAppBuildPath));

// Dispatch everything else back to the react-router-dom.
// You can hit this rule by refreshing on any page but '/'
server.run(PORT, () => {
  server.app.use(
    async (ctx, next) => await serveStatic(frontEndAppBuildPath)(
      Object.assign(ctx, { path: 'index.html' }),
      next
    )
  )
});
