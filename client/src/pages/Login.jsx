import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginUser } from "../redux/slices/authSlice.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(form)).unwrap();
      toast.success("Logged in successfully");
      navigate(redirect);
    } catch (err) {
      toast.error(err || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <input
          required
          type="email"
          placeholder="Email"
          className="border rounded-lg px-3 py-2 w-full"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="border rounded-lg px-3 py-2 w-full"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-600 text-white w-full py-2.5 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="text-center text-sm mt-4">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary-600 font-medium">
          Register
        </Link>
      </p>
    </div>
  );
}
