import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Grade, Grain, Letterbox, Subtitles, Vignette} from './fx';
import {Album, Arrival, ClockScene, Corridor, Desert, Final, JumpScare, Montage, Opening, Reveal, Title} from './scenes';
import {SCENES} from './timeline';

const parts: [keyof typeof SCENES, React.FC][] = [
  ['opening', Opening],
  ['desert', Desert],
  ['clock', ClockScene],
  ['arrival', Arrival],
  ['corridor', Corridor],
  ['album', Album],
  ['reveal', Reveal],
  ['montage', Montage],
  ['jumpscare', JumpScare],
  ['title', Title],
  ['final', Final],
];

export const KhamoshHaveli: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {parts.map(([key, Comp]) => {
      const [from, to] = SCENES[key];
      return (
        <Sequence key={key} from={from} durationInFrames={to - from} name={key}>
          <Comp />
        </Sequence>
      );
    })}
    <Grade />
    <Vignette />
    <Grain />
    <Subtitles />
    <Letterbox />
    <Audio src={staticFile('soundtrack.wav')} />
  </AbsoluteFill>
);
