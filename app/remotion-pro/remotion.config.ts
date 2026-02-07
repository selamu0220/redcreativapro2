import { Config } from 'remotion';

// ============================================
// CONFIGURACIÓN DE REMOTION
// ============================================

// Formato de imagen para video
Config.setVideoImageFormat('jpeg');

// Formato de audio
Config.setAudioImageFormat('pcm_s16le');

// Sobrescribir output si existe
Config.setOverwriteOutput(true);

// Formato de píxeles
Config.setPixelFormat('yuv420p');

// Codec de video
Config.setCodec('h264');

// Calidad CRF (0-51, menor = mejor calidad)
Config.setCrf(18);

// Bitrate de video
Config.setVideoBitrate(8000000);

// Bitrate de audio
Config.setAudioBitrate(192000);

// Frecuencia de muestreo
Config.setSamplingRate(48000);

// Concurrencia ( renders simultáneos)
Config.setConcurrency(1);

// Nombre del proyecto
Config.setProjectName('Red Creativa Pro');

// Entrada de datos (para props dinámicos)
Config.setInputProps({});

// Nivel de logging
Config.setLogLevel('info');
