import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mascot } from './Mascot';

// Configure sua chave Pix aqui. Pode ser email, CPF, telefone ou chave aleatória.
const PIX_KEY = (import.meta.env.VITE_PIX_KEY as string | undefined) ?? 'seu-pix@exemplo.com.br';
const PIX_NAME = (import.meta.env.VITE_PIX_NAME as string | undefined) ?? 'DigitAI';

type Props = {
  onClose: () => void;
};

export function DonationModal({ onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso — usuário pode copiar manualmente do <code>
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="bg-white rounded-3xl shadow-bubbly max-w-md w-full p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-2">
          <Mascot mood="cheer" size={100} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-candy text-center">Apoiar o projeto ❤️</h2>
        <p className="mt-2 text-gray-600 text-center text-sm">
          O DigitAI é gratuito e sem anúncios intrusivos. Se ele está ajudando sua família ou escola, considere doar um cafezinho pra manter o projeto no ar.
        </p>

        <div className="mt-5 bg-mint/20 rounded-2xl p-4 border border-mint/40">
          <div className="text-xs text-gray-500 font-bold mb-1">CHAVE PIX</div>
          <code className="block text-sm md:text-base font-mono break-all text-gray-800">{PIX_KEY}</code>
          <div className="text-xs text-gray-500 mt-1">em nome de <b>{PIX_NAME}</b></div>
          <button
            onClick={copy}
            className="mt-3 w-full py-2.5 rounded-xl bg-grass text-white font-bold hover:scale-[1.02] transition"
          >
            {copied ? '✅ Copiado!' : '📋 Copiar chave Pix'}
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>1. Abra o app do seu banco</p>
          <p>2. Vá em <b>Pix → Pagar com chave</b></p>
          <p>3. Cole a chave e escolha o valor</p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-2xl bg-gray-200 font-bold hover:bg-gray-300 transition"
        >
          Fechar
        </button>
      </motion.div>
    </div>
  );
}
