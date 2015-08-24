# music-visualizer
Visualize music notation with Node by playing MP3 and MIDI (silently) in sync.

## Setup

1. Acquire the MP3 of *Uptown Funk* and place into the `media` folder.
1. Install node dependencies with `npm install`.
1. Run the application with `node index`.

## Known issues

The application crashes at the end of the music because the MIDI and MP3 lengths are not identical. 