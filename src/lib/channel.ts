import { player } from '@/lib/player';
import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import type { VoiceBasedChannel } from 'discord.js';

export const joinChannel = (channel: VoiceBasedChannel) => {
  const alreadyConnected = getVoiceConnection(channel.guildId);
  if (alreadyConnected) return alreadyConnected;

  const voiceChannel = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guildId,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  voiceChannel.subscribe(player);
  return voiceChannel;
};
