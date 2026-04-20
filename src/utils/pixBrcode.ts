/**
 * Gera o payload EMV BRCode (Pix "copia e cola") a partir de uma chave Pix,
 * nome do favorecido e cidade. Esse é o formato que apps de banco lêem
 * quando você mostra um QR Code — eles abrem direto a tela de pagamento
 * com os dados preenchidos.
 *
 * Especificação: Manual BCB Pix v2.1 — cada campo tem ID (2) + len (2) + valor.
 * CRC16-CCITT (poli 0x1021, init 0xFFFF) nos 4 chars finais.
 */

function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/** CRC16-CCITT/FALSE: poly 0x1021, init 0xFFFF, sem reflection. */
function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Remove acentos e limita tamanho — nome e cidade no BRCode precisam ser
 * ASCII e têm limites curtos (25 e 15). Alguns bancos recusam QR com
 * caracteres fora do ASCII básico.
 */
function sanitize(s: string, maxLen: number): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .slice(0, maxLen)
    .trim();
}

type Params = {
  key: string;
  name: string;
  city?: string;
  amount?: number; // se omitido, doador escolhe o valor
  txid?: string;   // identificação livre
};

export function generatePixBrcode({ key, name, city = 'SAO PAULO', amount, txid = '***' }: Params): string {
  const merchantAccount = emv('00', 'br.gov.bcb.pix') + emv('01', key);
  const parts = [
    emv('00', '01'),                   // payload format indicator
    emv('01', '12'),                   // static
    emv('26', merchantAccount),        // merchant account info (pix)
    emv('52', '0000'),                 // merchant category code
    emv('53', '986'),                  // BRL
    ...(amount && amount > 0 ? [emv('54', amount.toFixed(2))] : []),
    emv('58', 'BR'),                   // country
    emv('59', sanitize(name, 25)),
    emv('60', sanitize(city, 15)),
    emv('62', emv('05', sanitize(txid, 25))),
  ].join('');

  // CRC é calculado sobre o payload + "6304" (id+len do CRC) e anexado.
  const withCrcMarker = parts + '6304';
  return withCrcMarker + crc16(withCrcMarker);
}
