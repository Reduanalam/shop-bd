import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice.js";
import { fetchCategories } from "../services/productService.js";
import Icon from "./Icon.jsx";

const linkCls = ({ isActive }) =>
  `py-3 border-b-2 transition-colors ${isActive ? "border-primary-600 text-primary-700" : "border-transparent hover:text-primary-700"}`;

export default function Navbar() {
  const { userInfo } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [cats, setCats] = useState([]);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCats(Array.isArray(res) ? res : res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const onSearch = (e) => {
    e.preventDefault();
    navigate(keyword.trim() ? `/products?keyword=${encodeURIComponent(keyword.trim())}` : "/products");
  };

  const iconBtn = "flex flex-col items-center gap-0.5 text-[11px] text-gray-600 hover:text-primary-700";

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap md:flex-nowrap">
        <Link to="/" className="text-2xl font-bold text-primary-700 shrink-0 order-1">
          Shop<span className="text-accent-500">BD</span>
        </Link>

        <form onSubmit={onSearch} className="order-3 md:order-2 w-full md:flex-1 md:max-w-2xl flex items-center rounded-xl border border-primary-100 bg-primary-50/60 focus-within:ring-2 focus-within:ring-primary-500 overflow-hidden">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search for products, brands…"
            aria-label="Search products"
            className="flex-1 min-w-0 bg-transparent px-4 py-2.5 text-sm outline-none"
          />
          <button aria-label="Search" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5">
            <Icon name="search" className="w-5 h-5" />
          </button>
        </form>

        <div className="order-2 md:order-3 ml-auto flex items-center gap-5">
          <Link to="/wishlist" className={iconBtn}>
            <Icon name="heart" className="w-6 h-6" />
            <span className="hidden sm:block">Wishlist</span>
          </Link>
          {userInfo ? (
            <div className="relative group">
              <Link to="/profile" className={iconBtn}>
                <Icon name="user" className="w-6 h-6" />
                <span className="hidden sm:block max-w-[70px] truncate">{userInfo.name}</span>
              </Link>
              <div className="absolute right-0 top-full pt-2 hidden group-hover:block group-focus-within:block">
                <div className="w-40 rounded-xl bg-white shadow-lg ring-1 ring-black/5 py-1 text-sm">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-primary-50">Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 hover:bg-primary-50">My Orders</Link>
                  {userInfo.role === "admin" && (
                    <Link to="/admin" className="block px-4 py-2 text-primary-700 hover:bg-primary-50">Admin</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50">Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className={iconBtn}>
              <Icon name="user" className="w-6 h-6" />
              <span className="hidden sm:block">Login</span>
            </Link>
          )}
          <Link to="/cart" className={`${iconBtn} relative`}>
            <Icon name="cart" className="w-6 h-6" />
            <span className="hidden sm:block">Cart</span>
            {items?.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-accent-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
          {!userInfo && (
            <Link to="/register" className="hidden md:inline-block rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2">
              Register
            </Link>
          )}
        </div>
      </div>

      <div className="hidden md:block border-t border-primary-100">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 text-sm font-medium text-gray-700">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="my-1.5 inline-flex items-center gap-2 rounded-lg bg-primary-700 hover:bg-primary-800 text-white px-4 py-2"
            >
              <Icon name="menu" className="w-5 h-5" /> All Categories
            </button>
            {open && (
              <ul className="absolute left-0 top-full mt-1 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/5 py-1 z-50">
                {cats.length === 0 && <li className="px-4 py-2 text-gray-400">No categories yet</li>}
                {cats.map((c) => (
                  <li key={c._id}>
                    <Link to={`/products?category=${c._id}`} onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-primary-50">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <NavLink to="/products" className={linkCls}>Shop</NavLink>
          <NavLink to="/orders" className={linkCls}>Track Order</NavLink>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Icon name="pin" className="w-4 h-4 text-primary-600" /> Deliver to Bangladesh
          </span>
        </div>
      </div>
    </header>
  );
}
