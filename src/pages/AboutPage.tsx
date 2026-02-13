import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6 max-w-4xl mx-auto space-y-16">
      <button 
        onClick={() => navigate('/')}
        className="text-primary font-bold flex items-center gap-2 hover:underline"
      >
        ← 메인으로 돌아가기
      </button>

      <section className="space-y-6">
        <h1 className="text-5xl font-black text-white tracking-tighter">
          BEHIND THE <br />
          <span className="text-blue-500">NEURO FRONTIER</span>
        </h1>
        <p className="text-xl text-slate-400 font-medium leading-relaxed">
          기술적 정교함과 인문학적 성찰의 교차점에서, <br />
          우리는 인간의 '반응' 그 이상의 가치를 탐구합니다.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-12">
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white border-b border-blue-500 pb-2 inline-block">Vision</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Neuro Frontier는 단순한 게임이 아닙니다. 에이징 커브라는 물리적 제약을 인지적 훈련으로 극복하고자 하는 '철학적 공학자'의 실험실입니다. 우리는 인간의 뇌가 가진 가소성을 믿으며, 데이터를 통해 자신의 한계를 정량적으로 이해하고 확장하는 경험을 제공하고자 합니다.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white border-b border-blue-500 pb-2 inline-block">The Persona</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            이 프로젝트는 근본 원리를 파악하고자 하는 공학적 태도와 의미 중심의 라이프스타일을 추구하는 철학적 태도의 융합으로 탄생했습니다. 모든 기능과 디자인은 사용자가 '몰입(Flow)' 상태에 도달하여 자신의 진정한 퍼포먼스를 마주할 수 있도록 설계되었습니다.
          </p>
        </section>
      </div>

      <section className="p-10 bg-secondary/30 rounded-3xl border border-white/5 space-y-6">
        <h2 className="text-2xl font-black text-white">Contact & Connect</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          프로젝트에 대한 피드백이나 협업 제안은 언제나 환영합니다. 인간의 잠재력을 끌어올리는 기술에 관심이 있다면 함께 고민하고 싶습니다.
        </p>
        <div className="flex gap-4">
          <span className="text-blue-500 font-bold">Email:</span>
          <span className="text-white">shinhuigon@gmail.com</span>
        </div>
      </section>

      <footer className="text-center opacity-30 text-[10px] font-bold uppercase tracking-[0.5em]">
        Cultivating Potential Through Cognitive Agility
      </footer>
    </div>
  );
};

export default AboutPage;
