import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { registerUser } from "../redux/slices/authSlice.js";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(registerUser(form)).unwrap();
      toast.success("Account created!");
      navigate(redirect);
    } catch (err) {
      toast.error(err || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <input
          required
          placeholder="Full Name"
          className="border rounded-lg px-3 py-2 w-full"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          type="email"
          placeholder="Email"
          className="border rounded-lg px-3 py-2 w-full"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Phone"
          className="border rounded-lg px-3 py-2 w-full"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          required
          type="password"
          placeholder="Password (min 6 characters)"
          className="border rounded-lg px-3 py-2 w-full"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary-600 text-white w-full py-2.5 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="text-center text-sm mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 font-medium">
          Login
        </Link>
      </p>
    </div>
  );
}
