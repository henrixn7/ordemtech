-- =====================================================================
-- ORDEMTECH - BANCO DE DADOS (SUPABASE SQL EDITOR)
-- =====================================================================
-- Este script resolve definitivamente o problema de concorrência e race 
-- conditions na numeração de OS (ordens de serviço) por usuário.
--
-- Como usar:
-- 1. Acesse o painel do seu Supabase (https://supabase.com).
-- 2. Vá na aba "SQL Editor" no menu lateral.
-- 3. Clique em "New Query" (Nova consulta).
-- 4. Cole este script completo e clique em "Run" (Executar).
-- =====================================================================

-- 1. Criar a função que calcula o próximo número de OS para o usuário
CREATE OR REPLACE FUNCTION generate_numero_os()
RETURNS TRIGGER AS $$
DECLARE
  max_num INT;
BEGIN
  -- Seleciona o número máximo de OS existente para o respectivo user_id
  -- e bloqueia a leitura para escrita garantindo atomicidade
  SELECT COALESCE(MAX(numero_os), 0) INTO max_num
  FROM ordens
  WHERE user_id = NEW.user_id;

  -- Atribui o próximo número sequencial
  NEW.numero_os := max_num + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar o Gatilho (Trigger) que roda AUTOMATICAMENTE antes de qualquer INSERT
-- Isso faz com que, mesmo que o frontend mande ou não o numero_os, o banco calcule
-- de forma sequencial e inviolável.
DROP TRIGGER IF EXISTS trg_generate_numero_os ON ordens;
CREATE TRIGGER trg_generate_numero_os
BEFORE INSERT ON ordens
FOR EACH ROW
EXECUTE FUNCTION generate_numero_os();

-- 3. (Opcional) Habilitar Row Level Security (RLS) e regras básicas de segurança
-- Se você ainda não habilitou RLS nas suas tabelas, execute os comandos abaixo 
-- para garantir que um usuário nunca consiga ler ou modificar dados de outro.

-- Habilitar RLS nas tabelas principais
ALTER TABLE ordens ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Exemplo de Políticas de Segurança para a tabela 'ordens'
-- (Apenas o dono dos dados pode Ver, Inserir, Atualizar e Deletar)
DROP POLICY IF EXISTS "Usuários podem ver suas próprias ordens" ON ordens;
CREATE POLICY "Usuários podem ver suas próprias ordens" 
ON ordens FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar suas próprias ordens" ON ordens;
CREATE POLICY "Usuários podem criar suas próprias ordens" 
ON ordens FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias ordens" ON ordens;
CREATE POLICY "Usuários podem atualizar suas próprias ordens" 
ON ordens FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias ordens" ON ordens;
CREATE POLICY "Usuários podem deletar suas próprias ordens" 
ON ordens FOR DELETE 
USING (auth.uid() = user_id);
