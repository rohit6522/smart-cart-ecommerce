import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">🛒 Smart Cart</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Shop smarter with real-time budget tracking. Never overspend at checkout again.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition"
        >
          Register
        </Link>
      </div>
    </main>
  );
}