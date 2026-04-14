import Link from 'next/link';
import { CharacterMascot } from '@/components/ui/CharacterMascot';

const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-card/85 px-6 py-2 shadow-soft backdrop-blur-md flex items-center justify-between gap-3">
      <div className="flex items-center">
        <Link
          href="/"
          className="mr-3 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-border/25"
          aria-label="Home"
        >
          <div className="scale-[0.52] origin-center">
            <CharacterMascot energy={8} sessionType="hobby" size="compact" showSublabel={false} />
          </div>
        </Link>
        <h1 className="text-foreground text-lg font-bold tracking-tight">BrandGram</h1>
      </div>
      
      {/* Navigation */}
      <nav>
        <ul className="flex space-x-2 sm:space-x-3 items-center">
          <li>
            <Link href="/create">
              <span className="rounded-full bg-brand-gradient px-3 py-1.5 text-sm font-semibold text-white shadow-soft hover:opacity-90 transition-opacity">
                Create website
              </span>
            </Link>
          </li>
          <li>
            <Link href="/" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              About
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;