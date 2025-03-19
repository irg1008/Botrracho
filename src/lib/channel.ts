import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import type { VoiceBasedChannel } from 'discord.js';
import { getAudioURLResource, listAudioNames } from './audios';
import { createPlayer } from './player';
import { detectVoiceActivation } from './stt';

export const joinChannel = (channel: VoiceBasedChannel) => {
  const existingConnection = getVoiceConnection(channel.guildId);
  if (existingConnection) {
    existingConnection.rejoin();
    return existingConnection;
  }

  return joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guildId,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });
};

export const joinChannelWithPlayer = (channel: VoiceBasedChannel) => {
  const conn = joinChannel(channel);
  if ('subscription' in conn.state) return conn.state.subscription?.player;

  const player = createPlayer(channel.guildId);
  conn.subscribe(player);

  console.info('Starting voice activation listener');
  listAudioNames();
  detectVoiceActivation(conn.receiver, player, async (audioName) => {
    console.log('Playing audio for voice command', audioName);
    const audio = await getAudioURLResource(audioName);
    if (audio) player?.play(audio);
  });

  return player;
};
