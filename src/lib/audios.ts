import { createAudioResource } from '@discordjs/voice';
import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  GuildMember,
} from 'discord.js';
import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';
import { joinChannel } from './channel';
import { filename } from './path';
import { player } from './player';
import { s3 } from './s3';

export const listAudioNames = async () => {
  const audios = await s3.list();
  const audioNames = audios.Contents?.map((audio) => audio.Key)
    .filter((key) => typeof key === 'string')
    .map(filename);

  return audioNames;
};

export const getAudio = async (name: string) => {
  const audios = await s3.list({
    Prefix: `${name}.`, // Be wary of the dot at the end
    MaxKeys: 1,
  });

  const audioKey = audios.Contents?.[0]?.Key;
  if (!audioKey) return;

  const audio = await s3.get({ Key: audioKey });
  const audioStream = audio.Body?.transformToWebStream();
  if (!audioStream) return;

  const audioRedeable = Readable.fromWeb(audioStream as ReadableStream);
  return createAudioResource(audioRedeable);
};

export const playAudioForInteraction = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  audioName: string
) => {
  try {
    const audio = await getAudio(audioName);
    if (!audio) {
      await interaction.editReply(
        `No se ha encontrado el audio '${audioName}'`
      );
      return;
    }

    if (!(interaction.member instanceof GuildMember)) {
      await interaction.editReply('No se ha podido obtener el miembro');
      return;
    }

    const { channel } = interaction.member.voice;
    if (!channel) {
      await interaction.editReply('Necesitas estar en un canal de voz');
      return;
    }

    joinChannel(channel);
    player.play(audio);
  } catch (error) {
    await interaction.editReply(`No se ha encontrado el audio '${audioName}'`);
    throw error;
  }
};
