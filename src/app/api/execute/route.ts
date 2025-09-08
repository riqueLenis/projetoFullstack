import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const encryptedDataUrl = process.env.ENCRYPTED_DATA_URL;
  const n8nAddWebhookUrl = process.env.N8N_ADD_URL;

  if (!encryptedDataUrl || !n8nAddWebhookUrl) {
    return NextResponse.json(
      { message: 'Erro de configuração no servidor' },
      { status: 500 }
    );
  }

  try {
    const encryptedResponse = await fetch(encryptedDataUrl);
    if (!encryptedResponse.ok) throw new Error('Falha ao buscar os dados criptografados.');

    const dataPackage = await encryptedResponse.json();
    const encryptedData = dataPackage?.data?.encrypted;
    const secretKey = dataPackage?.data?.secretKey;

    if (!encryptedData || !secretKey) {
      throw new Error('A resposta do endpoint não contém todos os campos necessários.');
    }

    const { iv, authTag, encrypted } = encryptedData;
    if (!iv || !authTag || !encrypted) {
      throw new Error('Dados criptografados incompletos.');
    }

    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(secretKey, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const decryptedData = JSON.parse(decrypted);

    const n8nResponse = await fetch(n8nAddWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decryptedData),
    });

    if (!n8nResponse.ok) {
      throw new Error(`O n8n respondeu com status: ${n8nResponse.status}`);
    }

    const usersFromN8N = await n8nResponse.json();
    let finalData: any[] = [];

    if (Array.isArray(usersFromN8N)) {
      finalData = usersFromN8N.map((item: any) => item.json ?? item);
    } else if (usersFromN8N && typeof usersFromN8N === 'object') {
      finalData = [usersFromN8N.json ?? usersFromN8N];
    }

    return NextResponse.json(finalData, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Ocorreu um erro no fluxo de execução:', errorMessage);
    return NextResponse.json(
      { message: 'Ocorreu um erro no fluxo de execução: ' + errorMessage },
      { status: 500 }
    );
  }
}
