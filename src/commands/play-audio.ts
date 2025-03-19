import { listAudioNames, playAudioForInteraction } from '@/lib/audios';
import { MAX_AUTOCOMPLETE_CHOICES } from '@/lib/constants';
import type {
  AutocompleteExecute,
  Command,
  CommandExecute,
} from '@/types/discord';
import { SlashCommandBuilder } from 'discord.js';

const nameOption = 'nombre';

const playAudio = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Reproduce un audio')
  .addStringOption((option) =>
    option
      .setAutocomplete(true)
      .setName(nameOption)
      .setDescription('Nombre del audio')
      .setRequired(true)
  );

const executePlayAudio: CommandExecute = async (interaction) => {
  const audioName = interaction.options.getString(nameOption);

  if (!audioName) {
    await interaction.reply('No se ha proporcionado un nombre de audio');
    return;
  }

  await interaction.deferReply();
  await playAudioForInteraction(interaction, audioName);

  if (!interaction.replied) {
    await interaction.editReply(`Reproduciendo '${audioName}'`);
  }
};

const autocompleteAudioName: AutocompleteExecute = async (interaction) => {
  const focusedValue = interaction.options.getFocused();
  const audioNames = await listAudioNames();

  const result = audioNames?.filter((name) =>
    name.toLowerCase().includes(focusedValue.toLowerCase())
  );

  const choices = result
    ?.map((name) => ({ name, value: name }))
    .slice(0, MAX_AUTOCOMPLETE_CHOICES);
  await interaction.respond(choices ?? []);
};

export default {
  data: playAudio,
  execute: executePlayAudio,
  autocomplete: autocompleteAudioName,
} satisfies Command;
