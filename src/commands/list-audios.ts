import { listAudioNames, playAudioForInteraction } from '@/lib/audios';
import { MAX_COMPONENTS } from '@/lib/constants';
import { id } from '@/lib/id';
import { chunk } from '@/lib/utils';
import type { ButtonExecute, Command, CommandExecute } from '@/types/discord';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent,
  ButtonStyle,
  SlashCommandBuilder,
} from 'discord.js';

const commandName = 'list';

const listAudios = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription('Lista los audios disponibles');

const executeListAudios: CommandExecute = async (interaction) => {
  const audioNames = await listAudioNames();
  if (!audioNames) {
    await interaction.reply('No se han encontrado audios');
    return;
  }

  const playButtons = audioNames.map((name) =>
    new ButtonBuilder()
      .setLabel(name)
      .setCustomId(id.createId(commandName, name))
      .setStyle(ButtonStyle.Secondary)
  );

  const buttonRows = chunk(playButtons, MAX_COMPONENTS).map((buttons) =>
    new ActionRowBuilder<ButtonBuilder>().setComponents(buttons)
  );

  const messages = chunk(buttonRows, MAX_COMPONENTS);

  for (let message of messages) {
    const { replied } = interaction;

    await interaction[replied ? 'followUp' : 'reply']({
      content: replied ? '' : 'Selecciona un audio para reproducir',
      components: message,
    });
  }
};

const executePlayAudio: ButtonExecute = async (interaction) => {
  if (!(interaction.component instanceof ButtonComponent)) return;

  const { customId } = interaction.component;
  if (!customId) {
    await interaction.reply('Datos inválidos. Revisa la creación del botón');
    return;
  }

  await interaction.deferUpdate();

  const [, audioName] = id.getId(customId);
  await playAudioForInteraction(interaction, audioName);
};

export default {
  data: listAudios,
  execute: executeListAudios,
  button: executePlayAudio,
} satisfies Command;
