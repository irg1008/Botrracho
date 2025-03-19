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

  const player = conn.subscribe(createPlayer(channel.guildId))?.player;

  listAudioNames();
  detectVoiceActivation(conn.receiver, async (audioName) => {
    console.log('Playing audio for voice command', audioName);
    const audio = await getAudioURLResource(audioName);
    if (audio) player?.play(audio);
  });

  return player;
};
