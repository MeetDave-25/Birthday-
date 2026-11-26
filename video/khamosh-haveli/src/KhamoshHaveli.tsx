import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Grade, Grain, Letterbox, Subtitles, Vignette} from './fx';
import {Opening} from './scenes';
import {AlbumP, ArrivalP, ClockP, CorridorP, DesertP, FinalP, JumpScareP, MontageP, RevealP, TitleP} from './plateScenes';
import {SCENES} from './timeline';

const parts: [keyof typeof SCENES, React.FC][] = [
  ['opening', Opening],
  ['desert', DesertP],
  ['clock', ClockP],
  ['arrival', ArrivalP],
  ['corridor', CorridorP],
  ['album', AlbumP],
  ['reveal', RevealP],
  ['montage', MontageP],
  ['jumpscare', JumpScareP],
  ['title', TitleP],
  ['final', FinalP],
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
