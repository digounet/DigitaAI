import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mascot } from '../components/Mascot';

export function Pro() {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [interestCount, setInterestCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('../services/interests').then(({ getInterestCount }) => {
      getInterestCount().then((n) => {
        if (!cancelled) setInterestCount(n);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg(null);
    try {
      const { registerInterest } = await import('../services/interests');
      await registerInterest(email, note);
      setStatus('done');
      setInterestCount((prev) => (prev == null ? prev : prev + 1));
    } catch (err) {
      console.error(err);
      setErrorMsg((err as Error).message || 'Erro ao enviar');
      setStatus('error');
    }
  };

  return (
    <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden">
      <div className="absolute inset-0 clouds-bg pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto p-4 md:p-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="h-10 px-4 rounded-full bg-white/85 shadow-pop flex items-center gap-2 hover:scale-105 active:scale-95 transition"
          >
            🏠 <span className="font-bold">Início</span>
          </Link>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/95 rounded-3xl shadow-bubbly p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mascot mood="cheer" size={90} />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-candy">DigitAI Pro ✨</h1>
              <p className="text-sm text-gray-600">Experiência completa, sem distrações.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 my-6">
            <Benefit emoji="🚫" title="Zero anúncios" desc="Nenhum banner, nenhum vídeo, nada no caminho da criança." />
            <Benefit emoji="🎨" title="Mascotes e skins" desc="Novos personagens, cores de balão, temas extras." />
            <Benefit emoji="📊" title="Relatório pros pais" desc="PDF mensal com evolução: PPM, precisão, horas praticadas." />
            <Benefit emoji="🎓" title="Trilhas bônus" desc="Digitação em inglês, números avançados, código básico." />
            <Benefit emoji="👨‍👩‍👧" title="Até 4 perfis" desc="Cada criança com seu progresso separado." />
            <Benefit emoji="☁️" title="Backup automático" desc="Progresso em todos os dispositivos, sempre sincronizado." />
          </div>

          <div className="bg-gradient-to-br from-grape/10 to-candy/10 rounded-2xl p-5 text-center">
            <div className="text-gray-600 text-sm">Lançamento previsto</div>
            <div className="text-2xl font-bold my-1">R$ 9,90 <span className="text-base font-normal text-gray-600">/mês</span></div>
            <div className="text-xs text-gray-500">ou R$ 79/ano (33% de economia)</div>
          </div>

          {interestCount != null && interestCount > 0 && (
            <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-sun/20 border border-sun/40 px-4 py-3 text-center">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
              <span className="text-sm">
                <b>{interestCount.toLocaleString('pt-BR')}</b>{' '}
                {interestCount === 1 ? 'família já está' : 'famílias já estão'} na lista de espera
              </span>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-bold mb-1">Quer ser avisado no lançamento?</h2>
            <p className="text-sm text-gray-600 mb-3">
              Deixe seu email abaixo. Sem spam — só um aviso quando o Pro estiver pronto, e você ganha 30 dias grátis.
            </p>
            {status === 'done' ? (
              <div className="bg-grass/15 text-grass font-bold rounded-2xl p-4 text-center">
                ✅ Anotado! Vou te avisar em primeira mão.
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu-email@exemplo.com"
                  className="w-full rounded-2xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-candy/30"
                />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="(opcional) o que você mais gostaria de ver no Pro?"
                  className="w-full rounded-2xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-candy/30 resize-none"
                />
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-3 rounded-2xl bg-grape text-white font-bold hover:scale-[1.01] transition disabled:opacity-60"
                >
                  {status === 'sending' ? 'Enviando...' : 'Me avise no lançamento ✨'}
                </button>
                {errorMsg && <div className="text-sm text-coral">{errorMsg}</div>}
              </form>
            )}
          </div>

          <p className="text-[11px] text-gray-400 text-center mt-6">
            O DigitAI continua 100% gratuito. O Pro é um apoio opcional pra ajudar o projeto a crescer.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Benefit({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="bg-sky2/40 rounded-2xl p-3">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="font-bold text-sm">{title}</div>
      <div className="text-xs text-gray-600 leading-tight">{desc}</div>
    </div>
  );
}
