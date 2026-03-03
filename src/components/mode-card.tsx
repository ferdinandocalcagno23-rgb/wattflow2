import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface ModeCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function ModeCard({ href, icon, title, description }: ModeCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-all duration-300 ease-in-out group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:-translate-y-1">
        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <div className="text-primary mb-4">{icon}</div>
            <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
          <CardTitle className="font-headline text-2xl">{title}</CardTitle>
          <CardDescription className="pt-2">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
