import { EndBehaviorType, VoiceReceiver } from '@discordjs/voice';
import {
  AutomaticSpeechRecognitionPipeline,
  pipeline,
} from '@xenova/transformers';
import EventEmitter from 'node:events';
import prism from 'prism-media';
import wavefile from 'wavefile';
import { keysCache } from './audios';

export let transcriber: AutomaticSpeechRecognitionPipeline;

export const createTranscriber = async () => {
  transcriber = await pipeline(
    'automatic-speech-recognition',
    'Xenova/whisper-small'
  );
};

export const pcmToWavBuffer = (
  pcmBuffer: Buffer,
  sampleRate: number = 48000,
  numChannels: number = 2,
  bitDepth: number = 16
): Buffer => {
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4); // File size - 8
  header.write('WAVE', 8);

  // fmt subchunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(numChannels, 22); // NumChannels
  header.writeUInt32LE(sampleRate, 24); // SampleRate
  header.writeUInt32LE(sampleRate * numChannels * (bitDepth / 8), 28); // ByteRate
  header.writeUInt16LE(numChannels * (bitDepth / 8), 32); // BlockAlign
  header.writeUInt16LE(bitDepth, 34); // BitsPerSample

  // data subchunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40); // Subchunk2Size

  // Retornar buffer WAV completo (header + PCM)
  return Buffer.concat([header, pcmBuffer]);
};

export const resolveReceiverData = (
  receiver: VoiceReceiver,
  userId: string
) => {
  return new Promise<Buffer>((resolve) => {
    const opusDecoder = new prism.opus.Decoder({
      frameSize: 960,
      channels: 2,
      rate: 48000,
    });

    const opusStream = receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 500,
      },
    });
    opusStream.pipe(opusDecoder);

    const detectedBuffer: Buffer[] = [];
    opusDecoder.on('data', (chunk: Buffer) => {
      detectedBuffer.push(chunk);
    });

    opusDecoder.on('end', async () => {
      const inputAudio = Buffer.concat(detectedBuffer);
      const wavBuffer = pcmToWavBuffer(inputAudio);
      resolve(wavBuffer);
    });
  });
};

export const transcribeReceiverData = (receiver: VoiceReceiver) => {
  if (!transcriber) {
    console.error('Transcriber not initialized');
    return;
  }

  const transcriberEvents = new EventEmitter<{
    transcription: [string];
  }>();

  receiver.speaking.on('start', async (userId) => {
    const data = await resolveReceiverData(receiver, userId);

    const wav = new wavefile.WaveFile(data);
    wav.toBitDepth('32f');
    wav.toSampleRate(16000);

    let samples = wav.getSamples();
    if (Array.isArray(samples)) samples = samples[0];

    const outputs = await transcriber(samples, {
      language: 'spanish',
      task: 'transcribe',
      early_stopping: true,
      max_length: 50,
      max_time: 2,
      use_cache: true,
    });

    const output = Array.isArray(outputs) ? outputs[0] : outputs;
    transcriberEvents.emit('transcription', output.text);
  });

  return transcriberEvents;
};

const validCommands = [
  'reproducir',
  'reproduce',
  'play',
  'pon',
  'escuchar',
  'ponme',
];
const commandPattern = validCommands.join('|');
const commandRegex = new RegExp(
  `\\b(${commandPattern})\\s+([\\w\\s]+?)(?=\\s*[.,]|$)`,
  'i'
);

export const detectVoiceActivation = (
  receiver: VoiceReceiver,
  onAudioMatch: (name: string) => void
) => {
  const transcriberEvents = transcribeReceiverData(receiver);

  transcriberEvents?.on('transcription', async (text) => {
    console.debug(`Transcription: ${text}`);

    const match = text.trim().match(commandRegex);
    if (!match) return;

    const [_, _command, audioName] = match;

    if (keysCache.size === 0) {
      console.warn('Please list audios to fill cache');
      return;
    }

    const audioNameMatch = keysCache
      .keys()
      .find((name) => name.toLowerCase().includes(audioName.toLowerCase()));

    if (audioNameMatch) {
      onAudioMatch(audioNameMatch);
    }
  });
};
