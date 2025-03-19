import { env } from '@/config/env';
import { createAudioResource } from '@discordjs/voice';
import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';
import { joinChannelWithPlayer } from './channel';
import { filename } from './path';
import { s3 } from './s3';

export const keysCache = new Map<string, string>();

export const listAudioNames = async () => {
  const audios = await s3.list();

  const audioNames = audios.Contents?.map((audio) => audio.Key)
    .filter((key) => typeof key === 'string')
    .map((key) => {
      const name = filename(key);
      keysCache.set(name, key);
      return name;
    });

  return audioNames;
};

export const getAudioKey = async (audioName: string) => {
  const cacheHit = keysCache.get(audioName);
  if (cacheHit) return cacheHit;

  const audios = await s3.list({
    Prefix: `${audioName}.`, // Be wary of the dot at the end
    MaxKeys: 1,
  });

  const audioKey = audios.Contents?.[0]?.Key;
  if (audioKey) keysCache.set(audioName, audioKey);

  return audioKey;
};

export const getAudioURLResource = async (name: string) => {
  const audioKey = await getAudioKey(name);
  if (!audioKey) return;

  const url = `${env.s3PublicUrl}/${audioKey}`;
  return createAudioResource(url);
};

export const getAudioResource = async (name: string) => {
  const audioKey = await getAudioKey(name);
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
  if (!interaction.deferred) {
    await interaction.deferReply();
  }

  try {
    const audio = await getAudioURLResource(audioName);
    if (!audio) {
      await interaction.editReply(
        `No se ha encontrado el audio '${audioName}'`
      );
      return;
    }

    if (!interaction.member || !('voice' in interaction.member)) {
      await interaction.editReply('No se ha podido obtener el miembro');
      return;
    }

    const { channel } = interaction.member.voice;
    if (!channel) {
      await interaction.editReply('Necesitas estar en un canal de voz');
      return;
    }

    const player = joinChannelWithPlayer(channel);
    player?.play(audio);
  } catch (error) {
    await interaction.editReply(`No se ha encontrado el audio '${audioName}'`);
    throw error;
  }
};
