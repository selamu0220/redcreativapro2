declare module 'mp3-duration' {
  export default function mp3Duration(file: string | Buffer): Promise<number>;
}
