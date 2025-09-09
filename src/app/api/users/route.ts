import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        id: 'asc',
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ message: "Erro ao buscar dados do banco." }, { status: 500 });
  }
}