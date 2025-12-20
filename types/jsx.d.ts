export { };

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': {
        'agent-id': string;
        children?: React.ReactNode;
        [key: string]: any;
      };
    }
  }
}