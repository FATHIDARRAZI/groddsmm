import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إنشاء حساب - Grodd Media SMM',
  description: 'سجل الآن في أرخص سيرفر بيع متابعين SMM في الشرق الأوسط وابدأ في زيادة متابعينك وتكبير حساباتك بأسعار تنافسية.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
