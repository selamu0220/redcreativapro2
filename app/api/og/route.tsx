import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // ?title=<title>
        const hasTitle = searchParams.has('title');
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'Red Creativa Pro';

        return new ImageResponse(
            (
                <div
                    style={{
                        backgroundImage: 'linear-gradient(to bottom right, #000000, #111111)',
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        textAlign: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        flexWrap: 'nowrap',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            justifyItems: 'center',
                        }}
                    >
                        <img
                            alt="Red Creativa Pro Logo"
                            height={80}
                            src="https://escritor-ia.com/icon.png" // Fallback to absolute URL
                            style={{ margin: '0 30px' }}
                            width={80}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 60,
                            fontStyle: 'normal',
                            color: 'white',
                            marginTop: 30,
                            lineHeight: 1.2,
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {title}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 30,
                            fontStyle: 'normal',
                            color: '#d1d5db',
                            marginTop: 20,
                            lineHeight: 1.4,
                        }}
                    >
                        IA Para Periodistas
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
