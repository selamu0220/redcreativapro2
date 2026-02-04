import { getPlaiceholder } from 'plaiceholder';

export async function getBlurData(src: string) {
    try {
        const buffer = await fetch(src).then(async (res) =>
            Buffer.from(await res.arrayBuffer())
        );

        const { base64 } = await getPlaiceholder(buffer);
        return base64;
    } catch (err) {
        console.error('Error generating blur placeholder', err);
        return;
    }
}
