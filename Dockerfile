FROM oven/bun:1.2.5

COPY . .

RUN apt-get update && apt-get install -y ffmpeg

RUN bun install --production
RUN bun run build

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "start"]