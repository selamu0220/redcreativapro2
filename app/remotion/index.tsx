import { Composition, registerRoot } from 'remotion';
import { RedCreativaVideo } from './RedCreativaVideo';

registerRoot(() => <RedCreativaVideo />);

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="redcreativa-pro"
        component={RedCreativaVideo}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};

export default RemotionVideo;
