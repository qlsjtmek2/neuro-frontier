import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6 max-w-4xl mx-auto space-y-12">
      <button 
        onClick={() => navigate('/')}
        className="text-primary font-bold flex items-center gap-2 hover:underline"
      >
        ← 메인으로 돌아가기
      </button>

      <div className="space-y-8">
        <h1 className="text-4xl font-black text-white">이용약관</h1>
        
        <section className="space-y-6 text-slate-400 leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">1. 서비스의 목적</h3>
            <p>본 서비스는 사용자의 인지 반응 속도를 측정하고 훈련할 수 있는 환경을 제공하는 것을 목적으로 합니다.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">2. 이용자의 의무</h3>
            <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>자동화된 도구(매크로, 봇 등)를 사용하여 기록을 조작하는 행위</li>
              <li>글로벌 랭킹 등록 시 타인에게 불쾌감을 주는 닉네임을 사용하는 행위</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">3. 책임의 제한</h3>
            <p>
              본 서비스는 훈련 도구로서의 정보만을 제공하며, 결과값에 대한 의학적 효능이나 정확성을 보장하지 않습니다. 또한, 서비스 이용 중 발생한 데이터 손실 등에 대해 책임을 지지 않습니다.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">4. 약관의 변경</h3>
            <p>본 약관은 사전 고지 없이 변경될 수 있으며, 변경된 약관은 사이트 게시와 동시에 효력이 발생합니다.</p>
          </div>
        </section>
      </div>

      <footer className="pt-12 border-t border-white/5 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
        Last Updated: 2026. 02. 13.
      </footer>
    </div>
  );
};

export default TermsPage;
