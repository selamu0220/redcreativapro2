import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setAudioImageFormat('pcm_s16le');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);
Config.setVideoBitrate(8000000);
Config.setAudioBitrate(192000);
Config.setSamplingRate(48000);
Config.setConcurrency(1);
