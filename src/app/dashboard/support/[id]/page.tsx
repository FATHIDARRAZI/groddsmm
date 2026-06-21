import TicketClient from './TicketClient';

export function generateStaticParams() {
  return [{ id: 'new' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketClient id={id} />;
}
