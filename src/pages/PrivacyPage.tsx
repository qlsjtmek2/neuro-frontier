import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
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
        <h1 className="text-4xl font-black text-white">개인정보처리방침</h1>
        
        <section className="space-y-4 text-slate-400 leading-relaxed">
          <p>
            Neuro Frontier(이하 '본 서비스')는 사용자의 개인정보를 소중히 다루며, 관련 법령을 준수합니다. 본 방침은 사용자가 서비스를 이용할 때 수집되는 정보와 그 활용 방안에 대해 설명합니다.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">1. 수집하는 정보</h3>
              <p>본 서비스는 다음과 같은 최소한의 정보만을 수집합니다:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>닉네임</strong>: 글로벌 랭킹 등록 시 사용자가 직접 입력한 닉네임</li>
                <li><strong>게임 데이터</strong>: 점수, 반응 속도, 정확도 등의 훈련 기록</li>
                <li><strong>기술 정보</strong>: 서비스 최적화 및 오류 분석을 위한 익명의 로그 데이터 (브라우저 종류, 접속 시간 등)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">2. 정보의 수집 방법 및 저장</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>로컬 저장소(Local Storage)</strong>: 사용자의 개인 훈련 기록(History)은 사용자의 브라우저 로컬 저장소에만 저장되며, 서버로 전송되지 않습니다.</li>
                <li><strong>데이터베이스(Supabase)</strong>: 글로벌 랭킹 등록을 선택한 경우에 한해, 닉네임과 점수가 본 서비스의 데이터베이스에 저장됩니다.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">3. 정보의 이용 목적</h3>
              <p>수집된 정보는 오직 랭킹 서비스 제공 및 서비스 품질 개선을 위해서만 사용됩니다.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">4. 제3자 제공 및 광고</h3>
              <p>
                본 서비스는 Google AdSense를 통해 광고를 게재합니다. Google은 사용자의 서비스 방문 기록을 바탕으로 맞춤형 광고를 제공하기 위해 쿠키를 사용할 수 있습니다. 사용자는 Google 광고 설정에서 맞춤형 광고를 해제할 수 있습니다.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">5. 정보의 삭제</h3>
              <p>사용자는 브라우저의 '데이터 삭제' 기능을 통해 로컬 데이터를 직접 삭제할 수 있으며, 랭킹에 등록된 정보의 삭제를 원하는 경우 개발자에게 문의하시기 바랍니다.</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="pt-12 border-t border-white/5 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
        Last Updated: 2026. 02. 13.
      </footer>
    </div>
  );
};

export default PrivacyPage;
