import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface N8NItem {
  json?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function POST(_request: NextRequest) {
  const encryptedDataUrl = process.env.ENCRYPTED_DATA_URL;
  const n8nAddWebhookUrl = process.env.N8N_ADD_URL;

  if (!encryptedDataUrl || !n8nAddWebhookUrl) {
    return NextResponse.json({ message: 'Erro de configuração no servidor' }, { status: 500 });
  }

  try {
    const encryptedResponse = await fetch(encryptedDataUrl);
    const dataPackage = await encryptedResponse.json();
    const { iv, authTag, encrypted } = dataPackage.data.encrypted;
    const { secretKey } = dataPackage.data;

    const key = Buffer.from(secretKey, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const decryptedData = JSON.parse(decrypted);

    const n8nResponse = await fetch(n8nAddWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decryptedData),
    });

    const usersFromN8N: N8NItem[] | N8NItem = await n8nResponse.json();
    let finalData: Record<string, unknown>[] = [];

    if (Array.isArray(usersFromN8N)) {
      finalData = usersFromN8N.map(item => item.json ?? item);
    } else if (usersFromN8N && typeof usersFromN8N === 'object') {
      finalData = [usersFromN8N.json ?? usersFromN8N];
    }

    return NextResponse.json(finalData, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro no fluxo de execução:', errorMessage);
    return NextResponse.json({ message: 'Erro: ' + errorMessage }, { status: 500 });
  }
}
