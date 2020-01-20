[**live version&#8599;**](https://heartbeatjs.org/prototypes/video-sync/)<br/>
> **summary:** ==This a prototype that shows that a MIDI file rendered to audio can be synchronized to live MIDI playback of that same file in a sequencer==.

By rendering MIDI to audio I mean: MIDI exported to an audio file. In Logic this function is called 'bounce', in most other DAWs it is simply called 'export to audio'.

This prototype works equally well for audio and video files; in this case I have chosen to use video. I exported the audio by recording my screen while [Pianoteq](https://www.modartt.com/pianoteq) was playing back a MIDI file of Mozart's Sonata Facile.

I embedded the video in a webpage that also loads the same MIDI file in [heartbeat](https://heartbeatjs.org) websequencer and then I added some logic to trigger and control the playback of the sequencer when the video controls are used.

When 2 or more entities (devices, programs, etc.) are synchronized there usually is a master and one or more slaves; in this prototype the video is the master and the sequencer is the slave.

In the video you will see a short introduction that shows how I load the MIDI file into Pianoteq and how I select an instrument for playback. Because of this there is an offset of about 23 seconds before the rendered audio starts, as you can see in this screenshot of the video in [kdenlive](https://kdenlive.org/en/):

![](https://i.imgur.com/OCs663k.png)

The synchronization is simply done by matching the position of the playheads of the video and the sequencer. Because of the offset, the playhead of the sequencer is only controlled by the video when its playhead position > offset  and < (offset + duration of the song).

In the UI you can see when the video controls the sequencer; if the playhead of the sequencer is not controlled it reads "sequencer inactive" below the video, and when the playhead of the video does control the sequencer you will see the bars and beats position as calculated (in real time) by the sequencer. This happens both during regular playback and when you drag the video position slider while seeking.

Note that this prototype uses the same source (MIDI file) for both audio and MIDI; therefor we only need a single synchronization point and from there both playheads can keep running in their own threads. If you use a different source for the audio, for instance a performance of the piece on YouTube this prototype falls short.

There are two solutions for this, both need to be done manually and the more the audio file differs from the MIDI file in terms of interpretation (tempo changes, volume changes, etc.), the more work it will involve:

1. add more synchronization points to the code that synchronizes the playheads
2. add the timing of the audio file as a tempo track to the MIDI file 

The second option is the most elegant solution, so I decided to give that a try. My plan was to sync the MIDI file to a video of a beautiful interpretation of the piece by Daniel Barenboim, you can watch it [here](https://www.youtube.com/watch?v=1vDxlnJVvW8) and as you can hear the tempo is *very* fluid.

I extracted the audio from the video and let Logic create a tempo map but result was very poor. Probably because of the many tempo changes and the lack of a clear beat. The result in Cubase was a bit better but still I needed to do a lot of manual adjustments.

The problem is that it isn't sufficient to adjust the tempo per bar; even within a bar there are a lot of tempo changes, for instance in the fast scales in bar 5 to 10. This means that in some bars you have to adjust the tempo almost on 8th or even 16th level. It is doable but it is a lot of work; I managed to get to bar 16 but that took me over 2 hours of editing. 

And so far we have only discussed the tempo; we also have the parameter volume that needs to be adjusted per phrase or per note in order to match the interpretation

But the situation is that in this example the audio file differs a lot from the MIDI file; I can imagine that for learning purposes the MIDI files and their audio interpretations are more alike, so in these cases extracting tempo maps from audio files and add these to the MIDI files might be sufficient.
