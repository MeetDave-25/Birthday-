import React from 'react';
import {Composition} from 'remotion';
import {KhamoshHaveli} from './KhamoshHaveli';
import {FPS, TOTAL} from './timeline';
import {Plate, PlateId} from './three/Plates';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="KhamoshHaveli"
      component={KhamoshHaveli}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {/* 3D still plates, rendered once each at 2560x1440 (zoom headroom) */}
    <Composition
      id="Plate"
      component={Plate as React.FC<{plate: PlateId}>}
      durationInFrames={1}
      fps={FPS}
      width={2560}
      height={1440}
      defaultProps={{plate: 'ext' as PlateId}}
    />
  </>
);
