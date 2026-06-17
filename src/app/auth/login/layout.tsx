import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل الدخول - Grodd Media SMM',
  description: 'قم بتسجيل الدخول إلى حسابك في منصة Grodd Media للوصول إلى لوحة التحكم وإدارة طلباتك لزيادة المتابعين.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
