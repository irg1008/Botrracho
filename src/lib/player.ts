import { createAudioPlayer, NoSubscriberBehavior } from '@discordjs/voice';

const audioPlayer = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause,
  },
});

export const player = audioPlayer;
