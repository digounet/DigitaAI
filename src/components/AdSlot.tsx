import { useEffect, useRef } from 'react';

type Props = {
  /** Ad slot ID vindo do AdSense (cada unidade criada lá tem o seu) */
  slotId?: string;
  /** Altura mínima pra reservar espaço e evitar CLS (Cumulative Layout Shift) */
  minHeight?: number;
  /** Variação visual do placeholder quando AdSense não está configurado */
  label?: string;
};

/**
 * Slot de anúncio do Google AdSense com flag "child-directed" ativo
 * (obrigatório pra sites infantis por COPPA/LGPD). Renderiza:
 *   - um placeholder visual quando `VITE_ADSENSE_CLIENT_ID` não está
 *     configurado (em dev ou enquanto você não aprovou no AdSense)
 *   - o <ins> real do AdSense quando o client ID está presente
 *
 * Nunca usar DENTRO do gameplay. Lugares OK: rodapé de Home, Ranking,
 * Pro, Diagnóstico (fora do ato de digitar).
 */
export function AdSlot({ slotId, minHeight = 90, label = 'Espaço reservado para anúncio' }: Props) {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined;
  const insRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!clientId || !slotId) return;
    // O script do adsbygoogle.js é carregado no <head> do index.html
    // (pré-requisito da verificação de propriedade do AdSense). Aqui só
    // fazemos o push que ativa o slot renderizado.
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.warn('[adsense] push falhou:', err);
    }
  }, [clientId, slotId]);

  if (!clientId || !slotId) {
    return (
      <div
        className="w-full max-w-3xl mx-auto my-4 bg-gray-100/60 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 text-xs"
        style={{ minHeight }}
      >
        📢 {label}
      </div>
    );
  }

  return (
    <ins
      ref={insRef as never}
      className="adsbygoogle block w-full max-w-3xl mx-auto my-4"
      style={{ display: 'block', minHeight }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
      data-tag-for-child-directed-treatment="1"
    />
  );
}
