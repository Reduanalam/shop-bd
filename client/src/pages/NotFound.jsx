import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-6 text-gray-500">পেজটি খুঁজে পাওয়া যায়নি।</p>
      <Link to="/" className="text-primary-600 font-medium">Go Home</Link>
    </div>
  );
}
