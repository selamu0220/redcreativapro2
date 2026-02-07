import { Composition } from 'remotion';
import { ShortVideo, ShortVideoProps } from './components/ShortVideo';

export const InstagramShortComposition = ({
  defaultProps,
}: {
  defaultProps: ShortVideoProps;
}) => {
  return (
    <>
      <Composition
        id="instagram-short"
        component={ShortVideo}
        durationInFrames={270} // 9 segundos a 30fps (ideal para Instagram)
        fps={30}
        width={1080}
        height={1920} // 9:16 vertical
        defaultProps={defaultProps}
      />
    </>
  );
};

export default InstagramShortComposition;
