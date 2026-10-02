import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

const col = "space-y-2 text-sm text-white/70";
const head = "text-white font-semibold mb-3";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link to="/" className="text-2xl font-bold">Shop<span className="text-accent-500">BD</span></Link>
          <p className="mt-3 text-sm text-white/70 max-w-xs">আপনার বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। সেরা দামে সেরা প্রোডাক্ট।</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-[#e2136e] px-3 py-1">bKash</span>
            <span className="rounded-full bg-[#f6821f] px-3 py-1">Nagad</span>
            <span className="rounded-full bg-white/15 px-3 py-1">Cash on Delivery</span>
          </div>
        </div>

        <div>
          <h3 className={head}>Quick Links</h3>
          <ul className={col}>
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/products" className="hover:text-white">Shop</Link></li>
            <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
            <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h3 className={head}>My Account</h3>
          <ul className={col}>
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li><Link to="/register" className="hover:text-white">Register</Link></li>
            <li><Link to="/orders" className="hover:text-white">My Orders</Link></li>
            <li><Link to="/profile" className="hover:text-white">Profile</Link></li>
          </ul>
        </div>

        <div>
          <h3 className={head}>Get in touch</h3>
          <ul className={col}>
            <li className="flex items-center gap-2"><Icon name="mail" className="w-4 h-4 text-accent-500" /> support@shopbd.com</li>
            <li className="flex items-center gap-2"><Icon name="pin" className="w-4 h-4 text-accent-500" /> Dhaka, Bangladesh</li>
            <li className="flex items-center gap-2"><Icon name="clock" className="w-4 h-4 text-accent-500" /> Sat–Thu, 10am–8pm</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs text-white/60 py-4">
        © {new Date().getFullYear()} ShopBD. All rights reserved.
      </div>
    </footer>
  );
}
