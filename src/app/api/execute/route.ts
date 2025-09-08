// src/app/api/execute/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(_request: Request) {
  const encryptedDataUrl = process.env.ENCRYPTED_DATA_URL;
  const n8nAddWebhookUrl = process.env.N8N_ADD_URL;

  if (!encryptedDataUrl || !n8nAddWebhookUrl) {
    return NextResponse.json({ message: "Erro de configuração no servidor." }, { status: 500 });
  }

  try {
    const encryptedResponse = await fetch(encryptedDataUrl);
    if (!encryptedResponse.ok) throw new Error("Falha ao buscar os dados criptografados.");
    
    const dataPackage = await encryptedResponse.json();
    
    const { iv, authTag, encrypted } = dataPackage.data.encrypted;
    const { secretKey } = dataPackage.data;

    if (!iv || !authTag || !encrypted || !secretKey) {
        throw new Error("A resposta do endpoint não contém todos os campos necessários.");
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

    if (!n8nResponse.ok) throw new Error(`O N8N respondeu com o status: ${n8nResponse.status}`);

    const usersFromN8N = await n8nResponse.json();
    
    // --- MODO DETETIVE FINAL ---
    // Vamos imprimir a estrutura exata da resposta do N8N
    console.log("RESPOSTA FINAL RECEBIDA DO N8N:", JSON.stringify(usersFromN8N, null, 2));

    // Esta linha vai falhar, mas o log acima nos dará a resposta.
    const finalData = usersFromN8N.map((item: any) => item.json);
    
    return NextResponse.json(finalData, { status: 200 });

  } catch (error: unknown) {
    let errorMessage = 'Um erro desconhecido ocorreu.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Ocorreu um erro no fluxo de execução:", errorMessage);
    return NextResponse.json(
      { message: 'Ocorreu um erro no fluxo de execução: ' + errorMessage },
      { status: 500 }
    );
  }
}