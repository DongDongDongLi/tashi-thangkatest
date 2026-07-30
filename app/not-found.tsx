import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-gold-dark">404</p>
      <h1 className="mt-4 font-serif text-4xl text-burgundy">Page Not Found</h1>
      <p className="mt-4 max-w-md text-stone">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Return Home
      </Link>
    </div>
  );
}
