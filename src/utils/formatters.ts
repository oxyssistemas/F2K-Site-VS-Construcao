import { FinancingSimulation } from '../types';
import { STORE_INFO } from '../data/reviews';

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatKM(mileage: number): string {
  return `${new Intl.NumberFormat('pt-BR').format(mileage)} km`;
}

export function calculateFinancing(
  carPrice: number,
  downPaymentPercent: number = 30,
  installmentsCount: number = 48,
  monthlyInterestRate: number = 1.39 // 1.39% a.m.
): FinancingSimulation {
  const downPayment = Math.round((carPrice * downPaymentPercent) / 100);
  const principal = carPrice - downPayment;
  
  // Tabela Price: PMT = P * [i * (1 + i)^n] / [(1 + i)^n - 1]
  const i = monthlyInterestRate / 100;
  const n = installmentsCount;
  
  const factor = (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
  const monthlyInstallment = Math.round(principal * factor);
  const totalPayable = downPayment + (monthlyInstallment * n);
  const totalFinanced = monthlyInstallment * n;
  const estimatedIOF = Math.round(principal * 0.038); // estimativa IOF brasileira

  return {
    carPrice,
    downPayment,
    downPaymentPercent,
    installmentsCount,
    interestRateMonthly: monthlyInterestRate,
    monthlyInstallment,
    totalFinanced,
    totalPayable,
    estimatedIOF
  };
}

export function getWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${STORE_INFO.whatsapp}?text=${encoded}`;
}

export function getCarWhatsAppMessage(carBrand: string, carModel: string, carVersion: string, carPrice: number): string {
  return `Olá, equipe da F2K MOTORS! Tenho interesse no veículo *${carBrand} ${carModel}* (${carVersion}) anunciado por *${formatBRL(carPrice)}*. Gostaria de mais detalhes sobre disponibilidade, formas de pagamento ou agendamento de test-drive.`;
}
