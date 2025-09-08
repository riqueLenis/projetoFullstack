'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User {
  id: number;
  nome: string;
  email: string;
  phone: string;
}

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setUsers([]);
    try {
      const response = await fetch('/api/execute', { method: 'POST' });
      if (!response.ok) throw new Error('Falha ao buscar e processar os dados.');
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/clear', { method: 'POST' });
      if (!response.ok) throw new Error('Falha ao limpar os dados.');
      setUsers([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-slate-50 dark:bg-slate-900">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-800 dark:text-slate-100">teste vaga fullstack henrique lenis</h1>
      </div>
      <div className="flex gap-4 my-8">
        <Button onClick={handleExecute} disabled={loading}>{loading ? 'Executando...' : 'Executar'}</Button>
        <Button onClick={handleClear} disabled={loading} variant="destructive">Limpar</Button>
      </div>
      <div className="w-full max-w-5xl rounded-lg border dark:border-slate-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={4} className="text-center">Carregando dados...</TableCell></TableRow>}
            {error && <TableRow><TableCell colSpan={4} className="text-center text-red-500">{error}</TableCell></TableRow>}
            {!loading && !error && users.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">A tabela está vazia. Clique em "Executar".</TableCell></TableRow>}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.nome}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}