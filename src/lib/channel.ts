import { joinVoiceChannel } from '@discordjs/voice';
import type { VoiceBasedChannel } from 'discord.js';
import { player } from './player';

export const joinChannel = (channel: VoiceBasedChannel) => {
  const voiceChannel = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guildId,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  voiceChannel.subscribe(player);
  return voiceChannel;
};
