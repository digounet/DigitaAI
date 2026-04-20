import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Mascot } from './Mascot';
import { generatePixBrcode } from '../utils/pixBrcode';

// Configure sua chave Pix aqui. Pode ser email, CPF, telefone ou chave aleatória.
const PIX_KEY = (import.meta.env.VITE_PIX_KEY as string | undefined) ?? 'seu-pix@exemplo.com.br';
const PIX_NAME = (import.meta.env.VITE_PIX_NAME as string | undefined) ?? 'DigitAI';
const PIX_CITY = (import.meta.env.VITE_PIX_CITY as string | undefined) ?? 'SAO PAULO';

type Props = {
  onClose: () => void;
};

export function DonationModal({ onClose }: Props) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Payload EMV BRCode — o que vai dentro do QR. Apps de banco leem esse
  // string e abrem direto a tela de pagamento Pix.
  const brcode = useMemo(
    () => generatePixBrcode({ key: PIX_KEY, name: PIX_NAME, city: PIX_CITY }),
    [],
  );

  const copy = async (value: string, setFlag: (b: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(value);
      setFlag(true);
      setTimeout(() => setFlag(false), 2000);
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
        className="bg-white rounded-3xl shadow-bubbly max-w-md w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-2">
          <Mascot mood="cheer" size={90} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-candy text-center">Apoiar o projeto ❤️</h2>
        <p className="mt-2 text-gray-600 text-center text-sm">
          O DigitAI é gratuito. Se ele está ajudando, considere doar um cafezinho.
        </p>

        <div className="mt-5 flex justify-center">
          <div className="bg-white p-3 rounded-2xl border-2 border-mint/40 shadow-pop">
            <QRCodeSVG value={brcode} size={180} level="M" />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center">
          Escaneie com o app do seu banco na opção <b>Pix</b>
        </p>

        <div className="mt-4 bg-mint/20 rounded-2xl p-3 border border-mint/40">
          <div className="text-xs text-gray-500 font-bold mb-1">CHAVE PIX</div>
          <code className="block text-sm font-mono break-all text-gray-800">{PIX_KEY}</code>
          <div className="text-xs text-gray-500 mt-1">em nome de <b>{PIX_NAME}</b></div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => copy(PIX_KEY, setCopiedKey)}
              className="flex-1 py-2 rounded-xl bg-grass text-white font-bold hover:scale-[1.02] transition text-sm"
            >
              {copiedKey ? '✅ Chave copiada' : '📋 Copiar chave'}
            </button>
            <button
              onClick={() => copy(brcode, setCopiedCode)}
              className="flex-1 py-2 rounded-xl bg-sun font-bold hover:scale-[1.02] transition text-sm"
            >
              {copiedCode ? '✅ Código copiado' : '📲 Copiar e colar'}
            </button>
          </div>
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
