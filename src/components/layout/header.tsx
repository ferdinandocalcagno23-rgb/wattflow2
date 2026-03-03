import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { ConnectionStatus } from '@/components/device/connection-status';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="font-bold font-headline text-lg">WattFlow</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                    <Home className="h-5 w-5" />
                    <span className="sr-only">Home</span>
                </Link>
            </Button>
          <ConnectionStatus />
        </div>
      </div>
    </header>
  );
}
