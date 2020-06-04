import { Server } from 'boardgame.io/server';
import path from 'path';
import serve from 'koa-static';
import Game from './game';

const server = Server({ games: [Game] });
const PORT = process.env.PORT || 8000;

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, '../build/');
console.log(frontEndAppBuildPath);
server.app.use(serve(frontEndAppBuildPath))

server.run(PORT, () => {
  server.app.use(
    async (ctx, next) => {
      console.log(ctx.headers);
      await serve(frontEndAppBuildPath)(
        Object.assign(ctx, { path: 'index.html' }),
        next
      );
    };
  );
});
