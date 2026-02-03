import React from 'react';
import { WithContext, Thing } from 'schema-dts';

interface SchemaJSONLDProps<T extends Thing> {
    json: WithContext<T>;
}

export function SchemaJSONLD<T extends Thing>({ json }: SchemaJSONLDProps<T>) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
        />
    );
}
