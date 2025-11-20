import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const username = searchParams.get('username') || 'unknown';
    const displayName = searchParams.get('displayName') || 'Unknown User';
    const score = searchParams.get('score') || '0';
    const egoScore = searchParams.get('egoScore') || '0';
    const valueScore = searchParams.get('valueScore') || '0';
    const tier = searchParams.get('tier') || 'Balanced Creator';
    const tierEmoji = searchParams.get('tierEmoji') || '⚖️';

    // Determine gradient based on score
    const scoreNum = parseInt(score);
    let gradientStart, gradientEnd;

    if (scoreNum <= 40) {
      gradientStart = '#667EEA';
      gradientEnd = '#764BA2';
    } else if (scoreNum <= 60) {
      gradientStart = '#FA8BFF';
      gradientEnd = '#2BD2FF';
    } else {
      gradientStart = '#FF6B6B';
      gradientEnd = '#FF8E53';
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0A0A0A',
            backgroundImage: `linear-gradient(135deg, ${gradientStart}20, ${gradientEnd}20)`,
          }}
        >
          {/* Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '800px',
              height: '1000px',
              background: '#0A0A0A',
              borderRadius: '48px',
              border: `4px solid ${gradientStart}`,
              padding: '60px',
              position: 'relative',
            }}
          >
            {/* Profile header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  color: '#F5F5F5',
                  fontWeight: 'bold',
                }}
              >
                {displayName}
              </div>
            </div>
            <div
              style={{
                fontSize: '20px',
                color: '#A0A0A0',
                marginBottom: '60px',
                marginTop: '-30px',
              }}
            >
              @{username}
            </div>

            {/* Main score */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '60px',
              }}
            >
              <div
                style={{
                  fontSize: '200px',
                  fontWeight: 900,
                  background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                  backgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: 1,
                  marginBottom: '20px',
                }}
              >
                {score}
              </div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#F5F5F5',
                  letterSpacing: '4px',
                }}
              >
                EGO INDEX
              </div>
            </div>

            {/* Detailed scores */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '28px',
                }}
              >
                <span style={{ color: '#A0A0A0' }}>🎭 Ego</span>
                <span style={{ color: '#F5F5F5', fontWeight: 'bold' }}>
                  {egoScore}/100
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '28px',
                }}
              >
                <span style={{ color: '#A0A0A0' }}>💎 Value</span>
                <span style={{ color: '#F5F5F5', fontWeight: 'bold' }}>
                  {valueScore}/100
                </span>
              </div>
            </div>

            {/* Tier badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${gradientStart}20`,
                border: `2px solid ${gradientStart}50`,
                borderRadius: '24px',
                padding: '24px',
                marginBottom: '40px',
              }}
            >
              <span style={{ fontSize: '40px', marginRight: '16px' }}>{tierEmoji}</span>
              <span style={{ fontSize: '28px', color: '#F5F5F5', fontWeight: 600 }}>
                {tier}
              </span>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '40px',
                borderTop: '1px solid #FFFFFF20',
                fontSize: '20px',
                color: '#A0A0A0',
              }}
            >
              egoindex.app →
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 1500,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
