FROM oven/bun:1.2.5

COPY . .

RUN bun install
RUN bun run build

ARG PORT
EXPOSE ${PORT:-3000}

CMD ["bun", "run", "start"]