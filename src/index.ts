import sequencer from 'heartbeat-sequencer';
import { loadJSON, addAssetPack } from './action-utils';

let raqSong: number = -1;
let raqTransport: number = -1;
let video: HTMLVideoElement;
let mixer: HTMLInputElement;
let transport: HTMLDivElement;
let song: Heartbeat.Song;
const offset: number = 23000 + ((24 / 30) * 1000); // 30fps
const midiFileName: string = '/mozk545a-2';
const midiFileUrl: string = `./assets/${midiFileName}.mid`;
const instrumentName: string = 'TP03-Vibraphone';//'TP00-PianoStereo';
const instrumentUrl: string = `./assets/${instrumentName}.mp3.json`;

const loadMIDIFile = (url: string): Promise<void> => {
  return new Promise(resolve => {
    sequencer.addMidiFile({ url }, () => { resolve(); });
  });
}

const getSyncPosition = (): { pos: number, sync: boolean } => {
  const vp = video.currentTime * 1000;
  const min = offset;
  const max = offset + song.durationMillis;
  // console.log(vp, min, max);
  if (vp <= min) {
    // console.log('[MIN]', min);
    return {
      pos: 0,
      sync: false,
    }
  }
  if (vp >= max) {
    // console.log('[MAX]', max);
    return {
      pos: song.durationMillis,
      sync: false,
    }
  }
  return {
    pos: vp - offset,
    sync: true,
  };
}

const setupSequencer = async () => {
  await sequencer.ready();
  await loadMIDIFile(midiFileUrl);
  song = sequencer.createSong(sequencer.getMidiFile(midiFileName));
  const json = await loadJSON(instrumentUrl);
  await addAssetPack(json);
  song.tracks.forEach(track => { track.setInstrument(instrumentName); })
  song.setVolume(0.5);
}

const syncTransport = () => {
  updateTransportDisplay(transport, song);
  raqTransport = requestAnimationFrame(syncTransport);
}

const syncSequencer = () => {
  const { pos, sync } = getSyncPosition();
  if (sync && video.paused === false && song.playing === false) {
    song.play();
  } else if (!sync) {
    if (song.playing) {
      console.log('[STOP SYNC]')
      song.stop();
    }
    if (song.millis !== pos) {
      console.log('[SYNC PLAYHEAD]')
      song.setPlayhead('millis', pos);
    }
  }
  raqSong = requestAnimationFrame(syncSequencer);
}

const updateTransportDisplay = (div: HTMLDivElement, song: Heartbeat.Song) => {
  const { sync } = getSyncPosition();
  if (sync) {
    div.innerHTML = `<span>${song.bar}:${song.beat}:${song.sixteenth}:${song.tick}</span><span>${song.playhead.data.timeAsString}</span>`;
  } else {
    div.innerHTML = 'sequencer not active';
  }
}

const updateMixer = (value: number) => {
  video.volume = value;
  song.setVolume(1 - value);
}

window.onload = async () => {

  video = document.getElementsByTagName('video')[0] as HTMLVideoElement;
  mixer = document.getElementById('mixer-slider') as HTMLInputElement;
  transport = document.getElementById('transport') as HTMLDivElement;

  if (video === null) {
    throw new Error('no video element found');
  }

  video.volume = 0.5;

  await setupSequencer();

  video.addEventListener('play', (e) => {
    // console.log('play');
    raqSong = requestAnimationFrame(syncSequencer);
    raqTransport = requestAnimationFrame(syncTransport);
  });

  video.addEventListener('pause', (e) => {
    // console.log('pause');
    cancelAnimationFrame(raqSong);
    cancelAnimationFrame(raqTransport);
    if (song.playing) {
      song.pause();
    }
  });

  video.addEventListener('complete', (e) => {
    // console.log('complete');
    cancelAnimationFrame(raqSong);
    cancelAnimationFrame(raqTransport);
    song.stop();
  });

  video.addEventListener('seeking', (e) => {
    // console.log('seeking');
    cancelAnimationFrame(raqTransport);
    updateTransportDisplay(transport, song);
  });

  video.addEventListener('seeked', (e) => {
    // console.log('seeked');
    const { pos } = getSyncPosition()
    song.setPlayhead('millis', pos);
    if (song.playing) {
      raqTransport = requestAnimationFrame(syncTransport);
    }
  });

  mixer.addEventListener('change', (e: Event): any => {
    updateMixer(mixer.valueAsNumber);
  })

  mixer.addEventListener('input', (e: Event): any => {
    updateMixer(mixer.valueAsNumber);
  })
}


