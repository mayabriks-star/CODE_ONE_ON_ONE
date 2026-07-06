import { TriangleAlert } from 'lucide-react';

interface Props {
  onAssess: () => void;
  onDismiss?: () => void;
}

export default function AlertBanner({ onAssess, onDismiss }: Props) {
  return (
    <>
      <style>{`
        @keyframes bannerIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .banner-in { animation: bannerIn 0.3s ease-out forwards; }
      `}</style>

      <div
        className="banner-in"
        style={{
          position: 'absolute',
          top: 72,
          left: 16,
          right: 16,
          zIndex: 9000,
          pointerEvents: 'auto',
        }}
      >
        <div
          className="glass-shadow rounded-[14px]"
          style={{
            background: 'rgba(185,29,29,0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '11px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <TriangleAlert size={17} color="white" strokeWidth={2.2} style={{ flexShrink: 0 }} />

          <span style={{
            flex: 1, fontSize: 16, fontWeight: 600,
            color: 'white', letterSpacing: '-0.3px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            Sea level rise detected - Harbor District at risk
          </span>

          <button
            onClick={onAssess}
            style={{
              height: 30, padding: '0 14px', borderRadius: 100,
              background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.4)',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'white',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            Assess Now
          </button>

        </div>
      </div>
    </>
  );
}
