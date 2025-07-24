import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-black p-4 flex items-center justify-between gap-4">
      <div className="flex items-center">
        {/* Logo */}
        <Link href="/" passHref>
          <Image
            src="/violetLogo_w.png"
            alt="Logo"
            width={50}
            height={50}
            className="mr-4"
          />
        </Link>
        <h1 className="text-white text-xl font-bold">BrandGram+Gpt</h1>
      </div>
      
      {/* Navigation */}
      <nav>
        <ul className="flex space-x-4 items-center">
          <li>
            <Link href="/create">
              <span className="rounded-full border border-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 text-transparent bg-clip-text border-current animate-pulse hover:opacity-90 transition-all duration-600">
                Create website
              </span>
            </Link>
          </li>
          <li>
            <Link href="/" className="text-white hover:text-gray-200">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-white hover:text-gray-200">
              About
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;