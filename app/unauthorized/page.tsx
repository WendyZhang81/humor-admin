import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border rounded-2xl p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-500 mb-3">
          ACCESS DENIED
        </p>

        <h1 className="text-3xl font-bold mb-4">
          Admin access required
        </h1>

        <p className="text-gray-600 mb-7">
          Your account is signed in, but it is not authorized
          to access the admin panel.
        </p>

        <Link
          href="/login"
          className="inline-block border rounded-lg px-5 py-3 hover:bg-gray-50"
        >
          Back to Sign In
        </Link>
      </div>
    </main>
  );
}