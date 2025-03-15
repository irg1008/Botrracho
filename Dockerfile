FROM oven/bun:1.2.5

COPY . .

RUN bun install --production
RUN bun run build

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "start"]