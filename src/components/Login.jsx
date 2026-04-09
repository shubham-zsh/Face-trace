import React, { useState } from "react";
import { Shield, Eye, EyeOff, ArrowRight, Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest, saveAuth } from "../utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await loginRequest(formData);
      const { token, user } = response.data;
      saveAuth(token, user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121417] flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#0078D4 0.5px, transparent 0.5px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-[#0078D4]/10 rounded-full blur-[120px]" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-[#0078D4]/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#1F2227]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-[#0078D4] p-3 rounded-2xl shadow-[0_0_20px_rgba(0,120,212,0.3)] mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#E0E0E0] tracking-tight">
              Expert Portal
            </h2>
            <p className="text-[#555] text-sm mt-2">
              Authorized Personnel Access Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#888] uppercase tracking-wider ml-1">
                Work Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] group-focus-within:text-[#0078D4] transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="name@agency.gov"
                  className="w-full bg-black/20 border border-[#1F2227] focus:border-[#0078D4] rounded-xl py-3.5 pl-12 pr-4 text-[#E0E0E0] outline-none transition-all placeholder:text-[#333]"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#888] uppercase tracking-wider ml-1">
                Security Key
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] group-focus-within:text-[#0078D4] transition-colors"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="w-full bg-black/20 border border-[#1F2227] focus:border-[#0078D4] rounded-xl py-3.5 pl-12 pr-12 text-[#E0E0E0] outline-none transition-all placeholder:text-[#333]"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/sign-up" className="text-xs text-[#0078D4] hover:underline">
                create an account
              </Link>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0078D4] hover:bg-[#0086ED] disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all shadow-[0_10px_20px_-5px_rgba(0,120,212,0.4)] flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? "Logging in..." : "Secure Login"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
