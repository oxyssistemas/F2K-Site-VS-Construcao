-- ====================================================================
-- F2K MOTORS - SEED DATA INICIAL
-- Popula o estoque inicial oficial da F2K MOTORS
-- ====================================================================

INSERT INTO public.vehicles (
  id, brand, model, version, year_fabrication, year_model, price, fipe_price, mileage,
  category, fuel, transmission, color, plate_end, doors, images, featured, is_new_arrival, tags,
  status, specifications, features, history, description, views_count
) VALUES 
(
  'f2k-porsche-macan-gts',
  'Porsche',
  'Macan GTS',
  '2.9 V6 Biturbo PDK',
  2023,
  2023,
  689000,
  710000,
  14200,
  'SUV',
  'Gasolina',
  'Dupla Embreagem',
  'Cinza Volcano Metálico',
  8,
  4,
  '["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
  true,
  true,
  ARRAY['Garantia Porsche Approved', 'Escapamento Esportivo', 'Teto Solar Panorâmico', 'Pacote Sport Chrono'],
  'disponivel',
  '{"motor":"2.9 V6 Biturbo","potencia":"440 cv","torque":"56,1 kgfm","aceleracao0a100":"4.3s","velocidadeMaxima":"272 km/h","consumoUrbano":"6.8 km/l","consumoRodoviario":"8.9 km/l","tracao":"Integral AWD","portaMalas":"488 L","capacidadeTanque":"75 L","peso":"1.960 kg"}'::jsonb,
  '{"seguranca":["Porsche Stability Management (PSM)","Faróis LED PDLS Plus","Freios Porsche Surface Coated Brake (PSCB)"],"conforto":["Bancos esportivos adaptativos com 18 vias","Ar condicionado Quadrizone","Suspensão a ar pneumática PASM"],"tecnologia":["Porsche Communication Management 10.9 polegadas","Sistema de Som Bose Surround 555W","Apple CarPlay sem fio"]}'::jsonb,
  '{"laudoCautelar":"100% Aprovado","unicoDono":true,"revisoesNaConcessionaria":true,"garantiaMeses":24,"ipvaPago":true}'::jsonb,
  'Exemplar em estado de zero quilômetro com configuração exclusiva Cinza Volcano com interior em couro Preto e costuras em contraste Vermelho Carmine.',
  342
),
(
  'f2k-bmw-320i-m-sport',
  'BMW',
  '320i',
  '2.0 Turbo ActiveFlex M Sport',
  2024,
  2024,
  339900,
  348000,
  6800,
  'Sedan',
  'Flex',
  'Automático',
  'Branco Mineral',
  2,
  4,
  '["https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
  true,
  true,
  ARRAY['Pacote M Sport Completo', 'BMW Curved Display', 'Teto Solar Elétrico', 'Garantia de Fábrica'],
  'disponivel',
  '{"motor":"2.0 TwinPower Turbo","potencia":"184 cv","torque":"30,6 kgfm","aceleracao0a100":"7.1s","velocidadeMaxima":"235 km/h","consumoUrbano":"10.6 km/l","consumoRodoviario":"13.2 km/l","tracao":"Traseira RWD","portaMalas":"480 L","capacidadeTanque":"59 L","peso":"1.460 kg"}'::jsonb,
  '{"seguranca":["Driving Assistant Professional","Alerta de colisão frontal com frenagem autônoma"],"conforto":["Bancos esportivos M com memória","Ar-condicionado automático de 3 zonas"],"tecnologia":["BMW Curved Display de 14.9 polegadas","BMW ConnectedDrive e GPS com Real-Time Traffic"]}'::jsonb,
  '{"laudoCautelar":"100% Aprovado","unicoDono":true,"revisoesNaConcessionaria":true,"garantiaMeses":18,"ipvaPago":true}'::jsonb,
  'Veículo impecável com kit aerodinâmico M Sport original de fábrica.',
  419
)
ON CONFLICT (id) DO UPDATE SET 
  price = EXCLUDED.price,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Inserção de leads/propostas demonstrativas no Supabase
INSERT INTO public.form_submissions (
  form_type, customer_name, customer_phone, customer_email, customer_city, car_id, car_name, data, status, internal_notes
) VALUES
(
  'financiamento',
  'Carlos Eduardo Mello',
  '(43) 99812-4411',
  'carlos.mello@email.com',
  'Londrina - PR',
  'f2k-bmw-320i-m-sport',
  'BMW 320i M Sport 2024',
  '{"downPayment":120000,"installmentsCount":48,"monthlyInstallment":5840.50,"interestRate":1.29}'::jsonb,
  'em_atendimento',
  'Cliente já enviou comprovante de renda, aguardando aprovação bancária Santander.'
),
(
  'avaliacao_troca',
  'Roberto Silveira',
  '(43) 99144-8890',
  'roberto.silveira@email.com',
  'Maringá - PR',
  'f2k-porsche-macan-gts',
  'Porsche Macan GTS 2023',
  '{"tradeInBrand":"Audi","tradeInModel":"Q5 Prestige","tradeInYear":2021,"tradeInKm":38000,"condition":"Excelente"}'::jsonb,
  'novo',
  'Avaliação preliminar do Audi Q5 estimada em R$ 265.000.'
),
(
  'test_drive',
  'Mariana Albuquerque',
  '(43) 98822-1055',
  'mariana.albuquerque@email.com',
  'Londrina - PR',
  'f2k-porsche-macan-gts',
  'Porsche Macan GTS 2023',
  '{"preferredDate":"2026-08-22","preferredTime":"14:30","cnhNumber":"05492817290"}'::jsonb,
  'novo',
  'Cliente agendou test drive para sábado à tarde no Showroom da Rua da Lapa.'
);
