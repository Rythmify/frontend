/**
 * audioTranscoder.ts
 *
 * Converts a Blob in any browser-native recording format (ogg/opus, webm/opus)
 * to a standard 16-bit PCM WAV Blob that the Rythmify backend accepts.
 *
 * Usage:
 *   import { toWav } from './audioTranscoder';
 *   const wavBlob = await toWav(oggBlob);
 *   // wavBlob.type === 'audio/wav'
 */

/** Write a 32-bit little-endian uint to a DataView */
function writeUint32LE(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true);
}

/** Write a 16-bit little-endian uint to a DataView */
function writeUint16LE(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

/**
 * Encodes a multi-channel AudioBuffer as a 16-bit PCM WAV ArrayBuffer.
 * Channels are interleaved in the standard way.
 */
function encodeWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const headerSize = 44;

  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk
  view.setUint8(0, 0x52);
  view.setUint8(1, 0x49); // 'R','I'
  view.setUint8(2, 0x46);
  view.setUint8(3, 0x46); // 'F','F'
  writeUint32LE(view, 4, 36 + dataSize); // file size - 8
  view.setUint8(8, 0x57);
  view.setUint8(9, 0x41); // 'W','A'
  view.setUint8(10, 0x56);
  view.setUint8(11, 0x45); // 'V','E'

  // fmt  sub-chunk
  view.setUint8(12, 0x66);
  view.setUint8(13, 0x6d); // 'f','m'
  view.setUint8(14, 0x74);
  view.setUint8(15, 0x20); // 't',' '
  writeUint32LE(view, 16, 16); // sub-chunk size (PCM = 16)
  writeUint16LE(view, 20, 1); // audio format (1 = PCM)
  writeUint16LE(view, 22, numChannels);
  writeUint32LE(view, 24, sampleRate);
  writeUint32LE(view, 28, byteRate);
  writeUint16LE(view, 32, blockAlign);
  writeUint16LE(view, 34, bitsPerSample);

  // data sub-chunk
  view.setUint8(36, 0x64);
  view.setUint8(37, 0x61); // 'd','a'
  view.setUint8(38, 0x74);
  view.setUint8(39, 0x61); // 't','a'
  writeUint32LE(view, 40, dataSize);

  // Interleave PCM samples (clamped to [-1, 1], scaled to int16)
  const offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }

  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      // Convert float32 → int16
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset + (i * numChannels + c) * 2, int16, true);
    }
  }

  return buffer;
}

/**
 * Converts any audio Blob (ogg, webm, mp4, etc.) to a WAV Blob
 * by decoding through the Web Audio API and re-encoding as 16-bit PCM.
 *
 * @param blob  - The recorded audio blob from MediaRecorder
 * @returns     - A new Blob with type 'audio/wav'
 * @throws      - If the browser cannot decode the source format
 */
export async function toWav(blob: Blob): Promise<Blob> {
  // 1. Read blob → ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();

  // 2. Decode to AudioBuffer using a temporary AudioContext
  //    OfflineAudioContext works even when no audio output is available
  const tempCtx = new AudioContext();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
  } finally {
    // Always close the context to free resources, even on error
    await tempCtx.close();
  }

  // 3. Encode AudioBuffer → WAV ArrayBuffer
  const wavBuffer = encodeWav(audioBuffer);

  return new Blob([wavBuffer], { type: "audio/wav" });
}
export default toWav;