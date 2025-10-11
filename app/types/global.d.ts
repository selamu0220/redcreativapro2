// Declaraciones de tipos globales para elementos personalizados

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': {
        'buy-button-id': string;
        'publishable-key': string;
        children?: React.ReactNode;
      };
      'elevenlabs-convai': {
        'agent-id': string;
      };
    }
  }
}

export {};