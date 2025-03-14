import { s3 } from '@/lib/s3';
import type { Command, CommandExecute } from '@/types/discord';
import { SlashCommandBuilder } from 'discord.js';
import { extname } from 'node:path';

const attachmentOption = 'audio';
const nameOption = 'nombre';

const maxAudioSize = 8 * 1024 * 1024; // 8MB

const addAudio = new SlashCommandBuilder()
  .setName('add')
  .setDescription('Añade un audio nuevo')
  .addStringOption((option) =>
    option
      .setName('nombre')
      .setDescription('Nombre del audio')
      .setMinLength(3)
      .setMaxLength(50)
      .setRequired(true)
  )
  .addAttachmentOption((option) =>
    option
      .setRequired(true)
      .setName(attachmentOption)
      .setDescription('Archivo de audio a añadir')
  );

const executeAddAudio: CommandExecute = async (interaction) => {
  const audio = interaction.options.get(attachmentOption);
  const audioName = interaction.options.get(nameOption);

  if (!audio?.attachment) {
    await interaction.reply('No se ha proporcionado ningún archivo de audio');
    return;
  }

  const { contentType, name, url, size } = audio.attachment;

  const isAudioType = contentType?.startsWith('audio/');
  if (!isAudioType) {
    await interaction.reply('El archivo proporcionado no es un audio');
    return;
  }

  const hasValidSize = size <= maxAudioSize;
  if (!hasValidSize) {
    await interaction.reply('El archivo proporcionado es demasiado grande');
    return;
  }

  const extension = extname(name ?? '');
  const customAudioName = `${audioName?.value}${extension}`;

  await interaction.deferReply();

  const audioList = await s3.list();
  if (audioList.Contents?.some((audio) => audio.Key === customAudioName)) {
    await interaction.reply('Ya existe un audio con ese nombre');
    return;
  }

  const audioFileRes = await fetch(url);
  const audioFile = await audioFileRes.arrayBuffer();

  await s3.upload({
    Key: customAudioName,
    Body: Buffer.from(audioFile),
  });

  await interaction.editReply(
    `Se ha añadido el audio '${audioName?.value}' correctamente`
  );
};

export default {
  data: addAudio,
  execute: executeAddAudio,
} satisfies Command;
