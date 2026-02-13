import React, { useEffect } from 'react';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: 'true' | 'false';
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdSense: React.FC<AdSenseProps> = ({ 
  slot, 
  format = 'auto', 
  responsive = 'true',
  style = { display: 'block' } 
}) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="ad-container my-8 overflow-hidden flex flex-col items-center gap-2">
      <span className="text-[10px] text-slate-700 font-bold tracking-widest uppercase">Advertisement</span>
      {/* 실제 애드센스 코드 (승인 후 활성화) */}
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-6426723216092180" // 본인의 클라이언트 ID로 교체 필요
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
      
      {/* 광고 위치 가이드 (개발 모드용) */}
      <div className="hidden bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-widest p-2 border border-dashed border-slate-700 rounded-lg w-full text-center">
        Advertisement Slot: {slot}
      </div>
    </div>
  );
};
