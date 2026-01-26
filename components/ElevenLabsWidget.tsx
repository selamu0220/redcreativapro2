'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/hooks/useAuth'

export default function ElevenLabsWidget() {
    const { user } = useAuth()
    const [shouldShow, setShouldShow] = useState(false)
    const [signedUrl, setSignedUrl] = useState<string | null>(null)

    // Helper: Add web component script if not present
    useEffect(() => {
        if (!document.querySelector('script[src*="convai-widget-embed"]')) {
            const script = document.createElement('script');
            script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
            script.async = true;
            script.type = "text/javascript";
            document.body.appendChild(script);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            if (user) {
                const showAssistant = user.user_metadata?.show_assistant !== false
                if (showAssistant) {
                    try {
                        // Fetch signed URL to bypass domain restrictions and secure usage
                        const agentId = 'agent_01jzq9c12eek7a564sba1a4tfk';
                        const res = await fetch(`/api/elevenlabs/signed-url?agent_id=${agentId}`);
                        if (res.ok) {
                            const data = await res.json();
                            setSignedUrl(data.signedUrl);
                            setShouldShow(true);
                        } else {
                            console.error("Failed to get signed URL for ElevenLabs widget");
                            // Fallback to unsecured if fails (optional, might still fail if domain blocked)
                            // setShouldShow(true); 
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            } else {
                setShouldShow(false)
            }
        };

        init();
    }, [user])

    if (!shouldShow || !signedUrl) return null

    return (
        <elevenlabs-convai agent-id="agent_01jzq9c12eek7a564sba1a4tfk" signed-url={signedUrl}></elevenlabs-convai>
    )
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { 'agent-id': string }, HTMLElement>;
        }
    }
}
