import { AudioPlayer, createAudioPlayer } from '@discordjs/voice';
import { Collection } from 'discord.js';

const playerCollection = new Collection<string, AudioPlayer>();

export const createPlayer = (guildId: string) => {
  if (playerCollection.has(guildId)) {
    return playerCollection.get(guildId) as AudioPlayer;
  }

  const player = createAudioPlayer();
  playerCollection.set(guildId, player);

  return player;
};

export const destroyPlayer = (guildId: string) => {
  const player = playerCollection.get(guildId);
  if (!player) return;
  player.removeAllListeners();
  player.stop();
  playerCollection.delete(guildId);
};
