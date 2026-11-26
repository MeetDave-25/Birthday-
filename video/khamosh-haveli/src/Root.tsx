import React from 'react';
import {Composition} from 'remotion';
import {KhamoshHaveli} from './KhamoshHaveli';
import {FPS, TOTAL} from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="KhamoshHaveli"
    component={KhamoshHaveli}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
