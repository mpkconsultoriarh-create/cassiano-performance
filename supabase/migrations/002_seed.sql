-- ============================================================
-- SEED DATA — Cassiano Sociedade de Advogados
-- Run after migration 001
-- ============================================================

-- Demo employees
insert into public.employees (nome, email, setor, cargo, nivel, gestor_nome, admissao, oab, status) values
('Ana Paula Ferreira',  'ana@cassiano.com',     'Jurídico Cível',       'Advogado Associado Pleno',   5, 'Dr. Cassiano', '2021-03-15', 'SP 234567', 'Ativo'),
('Bruno Rodrigues',     'bruno@cassiano.com',   'Jurídico Trabalhista', 'Advogado Associado Júnior',  2, 'Carla Mendes', '2023-08-02', 'SP 345678', 'Ativo'),
('Carla Mendes',        'carla@cassiano.com',   'Jurídico Trabalhista', 'Advogado Coordenador',       8, 'Dr. Cassiano', '2019-01-10', 'SP 123456', 'Ativo'),
('Diego Souza',         'diego@cassiano.com',   'Comercial',            'Closer',                     4, 'Marcos Lima',  '2022-06-05', null,        'Ativo'),
('Elisa Costa',         'elisa@cassiano.com',   'Comercial',            'SDR',                        2, 'Marcos Lima',  '2023-11-12', null,        'Ativo'),
('Felipe Nunes',        'felipe@cassiano.com',  'Jurídico Tributário',  'Advogado Associado Sênior',  7, 'Dr. Cassiano', '2020-04-20', 'SP 456789', 'Ativo'),
('Gabriela Torres',     'gabi@cassiano.com',    'Administrativo',       'Analista Administrativo',    3, 'Mariana Pires','2022-02-07', null,        'Ativo'),
('Henrique Lopes',      'henrique@cassiano.com','Jurídico Cível',       'Estagiário Jurídico',        3, 'Ana Paula',    '2024-03-01', null,        'Ativo'),
('Isabela Ramos',       'isa@cassiano.com',     'RH',                   'Analista de RH',             4, 'Mariana Pires','2021-09-14', null,        'Ativo'),
('João Carvalho',       'joao@cassiano.com',    'Financeiro',           'Analista Financeiro',        5, 'Mariana Pires','2020-07-28', null,        'Licença');
