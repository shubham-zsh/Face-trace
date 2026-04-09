import React, { useState } from "react";
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest, saveAuth } from "../utils/auth";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerDataChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const registerSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await registerRequest(formData);
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
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#0078D4 0.5px, transparent 0.5px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#0078D4]/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-xl relative z-10">
        <div className="bg-[#1F2227]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0078D4]/10 border border-[#0078D4]/30 text-[#0078D4] text-[10px] font-bold uppercase tracking-widest mb-4">
              <ShieldCheck size={12} />
              Personnel Registration
            </div>
            <h2 className="text-3xl font-bold text-[#E0E0E0] tracking-tight">
              Create Expert Profile
            </h2>
            <p className="text-[#555] text-sm mt-2">
              Request access to the FaceTrace Forensic Suite
            </p>
          </div>

          <form onSubmit={registerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#888] uppercase tracking-wider ml-1 text-[10px]">
                Full Name
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#0078D4] transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  placeholder="John Doe"
                  className="w-full bg-black/20 border border-[#1F2227] focus:border-[#0078D4] rounded-xl py-3 pl-12 pr-4 text-[#E0E0E0] outline-none transition-all text-sm placeholder:text-[#333]"
                  onChange={registerDataChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-[#888] uppercase tracking-wider ml-1 text-[10px]">
                Official Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#0078D4] transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="officer@agency.gov"
                  className="w-full bg-black/20 border border-[#1F2227] focus:border-[#0078D4] rounded-xl py-3 pl-12 pr-4 text-[#E0E0E0] outline-none transition-all text-sm placeholder:text-[#333]"
                  onChange={registerDataChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-[#888] uppercase tracking-wider ml-1 text-[10px]">
                Create Security Key
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-[#0078D4] transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  placeholder="************"
                  className="w-full bg-black/20 border border-[#1F2227] focus:border-[#0078D4] rounded-xl py-3 pl-12 pr-4 text-[#E0E0E0] outline-none transition-all text-sm placeholder:text-[#333]"
                  onChange={registerDataChange}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="md:col-span-2 text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="md:col-span-2 w-full bg-[#0078D4] hover:bg-[#0086ED] disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all shadow-[0_10px_20px_-5px_rgba(0,120,212,0.4)] flex items-center justify-center gap-2 group mt-2"
            >
              {isSubmitting ? "Creating account..." : "Request Provisioning"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 flex justify-between items-center px-2">
            <div className="flex items-center gap-2 text-[10px] text-[#333] font-mono">
              <CheckCircle2 size={12} className="text-green-500/50" />
              SECURE END-TO-END
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#333] font-mono">
              <CheckCircle2 size={12} className="text-green-500/50" />
              AUDIT LOG ACTIVE
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-[#555] text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0078D4] cursor-pointer hover:underline font-medium">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
