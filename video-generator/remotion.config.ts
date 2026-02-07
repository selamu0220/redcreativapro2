import { Config } from 'remotion';

Config.setVideoImageFormat('jpeg');
Config.setAudioImageFormat('pcm_s16le');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);
