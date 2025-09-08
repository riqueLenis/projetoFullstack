import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const encryptedDataUrl = process.env.ENCRYPTED_DATA_URL;
  const n8nAddWebhookUrl = process.env.N8N_ADD_URL;

  if (!encryptedDataUrl || !n8nAddWebhookUrl) {
    return NextResponse.json({ message: "erro de config no servidor." }, { status: 500 });
  }

  try {
    const encryptedResponse = await fetch(encryptedDataUrl);
    if (!encryptedResponse.ok) throw new Error("falha ao buscar os dados criptografados.");

    const dataPackage = await encryptedResponse.json();
    const { iv, authTag, encrypted } = dataPackage.data.encrypted;
    const { secretKey } = dataPackage.data;

    if (!iv || !authTag || !encrypted || !secretKey) {
        throw new Error("a resposta do endpoint não contem todos os campos necessarios.");
    }

    const algorithm = 'aes-128-gcm';
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

    if (!n8nResponse.ok) throw new Error(`O N8N respondeu com o status: ${n8nResponse.status}`);

    const usersFromN8N = await n8nResponse.json();
    return NextResponse.json(usersFromN8N, { status: 200 });

  } catch (error: any) {
    console.error("Ocorreu um erro no fluxo de execução:", error.message);
    return NextResponse.json(
      { message: 'Ocorreu um erro no fluxo de execução: ' + error.message },
      { status: 500 }
    );
  }
}