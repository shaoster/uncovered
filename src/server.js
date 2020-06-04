import { Server } from 'boardgame.io/server';
import path from 'path';
import serveStatic from 'koa-static';
import Game from './game';

const server = Server({ games: [Game] });
const PORT = process.env.PORT || 8000;

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, '../build/');
server.app.use(async (ctx) => {
  console.log(ctx.headers);
  return await serveStatic(frontEndAppBuildPath)(ctx);
});

server.run(PORT);
