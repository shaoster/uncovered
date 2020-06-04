import { Server } from 'boardgame.io/server';
import path from 'path';
import serve from 'koa-static';
import sslify, { xForwardedProtoResolver } from 'koa-sslify';
import Game from './game';

const server = Server({ games: [Game] });
const PORT = process.env.PORT || 8000;

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, '../build/');
console.log(frontEndAppBuildPath);
server.app.use(serve(frontEndAppBuildPath))

server.run(PORT, () => {
  if (process.env.NODE_ENV !== 'development') {
    server.app.use(sslify({ xForwardedProtoResolver }));
  }
  server.app.use(
    async (ctx, next) => await serve(frontEndAppBuildPath)(
      Object.assign(ctx, { path: 'index.html' }),
      next
    )
  );
});
