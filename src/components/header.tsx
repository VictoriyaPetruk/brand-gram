// components/Header.tsx
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-black p-4 flex items-center justify-between">
      <div className="flex items-center">
        {/* Logo */}
        <Link href="/" passHref>
          <Image
            src="/violetLogo_w.png" // Add the path to your logo image here
            alt="Logo"
            width={50} // Adjust the size of the logo
            height={50}
            className="mr-4"
          />
        </Link>
        <h1 className="text-white text-xl font-bold">BrandGram+Gpt</h1>
      </div>
      {/* Navigation (optional) */}
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="text-white hover:text-gray-200">Home</Link>
          </li>
          <li>
            <Link href="/about" className="text-white hover:text-gray-200">About</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
