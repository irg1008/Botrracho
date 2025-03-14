import { env } from '@/config/env';
import { REST, Routes } from 'discord.js';
import { commands } from './loader';

const rest = new REST({ version: '10' }).setToken(env.token);

const commandsData = commands.map((cmd) => cmd.data.toJSON());

try {
  const deployRoute = env.guildId
    ? Routes.applicationGuildCommands(env.clientId, env.guildId)
    : Routes.applicationCommands(env.clientId);

  await rest.put(deployRoute, { body: commandsData });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}
