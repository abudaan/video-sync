import sequencer from 'heartbeat-sequencer';
import { loadJSON, initSequencer, addAssetPack } from './action-utils';

let raqSong: number = -1;
let raqTransport: number = -1;
let video: HTMLVideoElement;
let transport: HTMLDivElement;
let song: Heartbeat.Song;
const offset: number = 23000 + ((26 / 30) * 1000); // 30fps
const midiFileName: string = '/mozk545a-2';
const midiFileUrl: string = `./assets/${midiFileName}.mid`;
const instrumentName: string = 'TP03-Vibraphone';//'TP00-PianoStereo';
const instrumentUrl: string = `./assets/${instrumentName}.mp3.json`;

const loadMIDIFile = (url: string): Promise<void> => {
  return new Promise(resolve => {
    sequencer.addMidiFile({ url }, () => { resolve(); });
  });
}

const translatePostion = () => {
  const vp = video.currentTime * 1000;
  const min = vp + offset;
  const max = offset + song.durationMillis;
  console.log(vp, min, max);
  if (vp <= min) {
    return 0
  }
  if (vp >= max) {
    return song.durationMillis;
  }
  return vp;
}

const setupSequencer = async () => {
  await sequencer.ready();
  await loadMIDIFile(midiFileUrl);
  song = sequencer.createSong(sequencer.getMidiFile(midiFileName));
  const json = await loadJSON(instrumentUrl);
  await addAssetPack(json);
  song.tracks.forEach(track => { track.setInstrument(instrumentName); })
}

const syncTransport = () => {
  updateTransportDisplay(transport, song);
  raqTransport = requestAnimationFrame(syncTransport);
}

const syncSequencer = () => {
  // console.log(video.currentTime * 1000, offset, video.paused);
  if ((video.currentTime * 1000) > offset && video.paused === false && song.playing === false) {
    song.play();
  }
  raqSong = requestAnimationFrame(syncSequencer);
  // raqTransport = requestAnimationFrame(syncTransport);
}

const updateTransportDisplay = (div: HTMLDivElement, song: Heartbeat.Song) => {
  // console.log(video.currentTime * 1000, offset, song.durationMillis);
  // console.log(song.millis, offset);
  // // if ((video.currentTime * 1000) < offset || (video.currentTime * 1000) > (offset + song.durationMillis)) {
  // if (song.millis < offset) {
  //   div.innerHTML = '';
  // } else {
  // }
  div.innerHTML = `${song.bar}: ${song.beat} : ${song.sixteenth} : ${song.tick}<br/>${song.playhead.data.timeAsString}`;
}

window.onload = async () => {
  await setupSequencer();

  video = document.getElementsByTagName('video')[0] as HTMLVideoElement;

  transport = document.getElementById('transport') as HTMLDivElement;
  updateTransportDisplay(transport, song);

  if (video === null) {
    throw new Error('no video element found');
  }

  video.addEventListener('play', (e) => {
    console.log('play', e, raqSong, song.playing, video.currentTime);
    // if ((video.currentTime * 1000) < offset) {
    //   raqSong = requestAnimationFrame(syncSequencer);
    //   cancelAnimationFrame(raqTransport);
    // } else {
    // song.play();
    raqSong = requestAnimationFrame(syncSequencer);
    raqTransport = requestAnimationFrame(syncTransport);
    // }
  });

  video.addEventListener('pause', (e) => {
    console.log('pause', e);
    cancelAnimationFrame(raqSong);
    cancelAnimationFrame(raqTransport);
    if (song.playing) {
      song.pause();
    }
  });

  video.addEventListener('complete', (e) => {
    console.log('complete', e);
    cancelAnimationFrame(raqSong);
    cancelAnimationFrame(raqTransport);
    song.stop();
  });

  video.addEventListener('seeking', (e) => {
    // console.log('seeking', song.playing);
    // cancelAnimationFrame(raqSong);
    cancelAnimationFrame(raqTransport);
    const pos = (video.currentTime * 1000) - offset;
    // song.setPlayhead('millis', pos < 0 ? 0 : pos);
    updateTransportDisplay(transport, song);
  });

  video.addEventListener('seeked', (e) => {
    // console.log('complete', e, (video.currentTime * 1000), song);
    // cancelAnimationFrame(raqSong);
    // cancelAnimationFrame(raqTransport);
    const pos = (video.currentTime * 1000);
    // console.log(pos > song.durationMillis);
    // song.setPlayhead('millis', pos <= offset ? 0 : pos >= (offset + song.durationMillis) ? song.durationMillis : pos);
    song.setPlayhead('millis', pos <= offset ? 0 : pos - offset);
    if (song.playing) {
      raqTransport = requestAnimationFrame(syncTransport);
    }
  });
}


