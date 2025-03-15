
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ThankYou = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Obrigado pelo seu contato!</h1>
        <p className="text-gray-600 mb-8">
          Sua mensagem foi recebida com sucesso. 
          Nossa equipe entrará em contato com você em breve.
        </p>
        <Button asChild>
          <Link to="/">Voltar para o formulário</Link>
        </Button>
      </div>
    </div>
  );
};

export default ThankYou;
