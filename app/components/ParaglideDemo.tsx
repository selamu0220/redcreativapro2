'use client';

import * as m from '@/src/paraglide/messages';

export function ParaglideDemo() {
    return (
        <div className="p-4 border rounded-lg bg-background my-8">
            <h3 className="text-lg font-bold">Paraglide Translation Integration Test</h3>
            <p className="text-muted-foreground mb-4">
                This text comes from Paraglide message files (messages/en.json, messages/es.json):
            </p>

            <div className="text-2xl font-bold text-primary">
                "{m.hello()}"
            </div>

            <div className="mt-4 text-xs text-muted-foreground bg-muted p-2 rounded">
                Usage: <code>import * as m from '@/src/paraglide/messages';</code> then <code>m.hello()</code>
            </div>
        </div>
    );
}
