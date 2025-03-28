import type { Command } from '@/types/discord';
import { Collection } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

export const commands = new Collection<string, Command>();

const commandsPath = path.resolve(import.meta.dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => {
  return file.endsWith('.js') || file.endsWith('.ts');
});

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath).default;

  if ('data' in command && 'execute' in command) {
    commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}
