import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '800px',
        textAlign: 'center',
        zIndex: 1,
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '300',
          color: '#e2e8f0',
          marginBottom: '1.5rem',
          letterSpacing: '-0.02em',
          lineHeight: '1.2'
        }}>
          A quiet place for<br />remembrance and healing
        </h1>

        <p style={{
          fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
          color: '#94a3b8',
          marginBottom: '3rem',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 3rem'
        }}>
          The journey of grief is often filled with feelings of "unfinished business". 
          Rememory provides a gentle and safe space to share memories, express unspoken words, 
          and find a sense of peace on your own terms.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          alignItems: 'center',
          marginTop: '3rem'
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '1rem 3rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#0f172a',
              background: '#38bdf8',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 14px 0 rgba(56, 189, 248, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0ea5e9';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(56, 189, 248, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#38bdf8';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(56, 189, 248, 0.3)';
            }}
          >
            Begin the journey
          </button>

          <div style={{
            marginTop: '4rem',
            padding: '2rem',
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            maxWidth: '600px'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              lineHeight: '1.6',
              margin: 0
            }}>
              <strong style={{ color: '#e2e8f0' }}>Important:</strong> Rememory creates AI personas 
              as supportive simulations. These are not the real individuals, but tools to help you 
              process your grief. Always remember that AI personas are simulations designed to 
              support your healing journey.
            </p>
          </div>
        </div>
      </div>

      {/* Footer with resources */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 1
      }}>
        <p style={{
          fontSize: '0.875rem',
          color: '#64748b',
          margin: 0
        }}>
          If you're in crisis, please contact a mental health professional or emergency services.
        </p>
      </div>
    </main>
  );
};

