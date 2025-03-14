import type { Command, CommandExecute } from '@/types/discord';
import { SlashCommandBuilder } from 'discord.js';

const ping = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Comprueba si el bot está activo');

const executePing: CommandExecute = async (interaction) => {
  await interaction.reply('Pong! Lokete');
};

export default {
  data: ping,
  execute: executePing,
} satisfies Command;
