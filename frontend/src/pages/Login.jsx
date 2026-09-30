import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

export default function Login({ onLogin, onGoSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  // const navigate = useNavigate();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setLoading(true);
  //   try {
  //     await onLogin(email, password);
  //   } catch (err) {
  //     setError(err.message || "Login failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {

  e.preventDefault();

  setError("");
  setLoading(true);

  try {
        await onLogin(email, password);


    // const response = await axios.post(
    //   "http://127.0.0.1:8000/auth/login",
    //   {
    //     email,
    //     password
    //   }
    // );

    // // Save token

    // localStorage.setItem(
    //   "token",
    //   response.data.token
    // );

    // // Save user

    // localStorage.setItem(
    //   "user",
    //   JSON.stringify(response.data.user)
    // );

    // // Role-based navigation

    // // if(response.data.user.role === "admin"){

    // //   navigate("/admin");

    // // } else {

    // //   navigate("/dashboard");

    // // }
    

  } catch (err) {

    setError(
      err?.data?.detail ||
      err?.detail ||
      err?.message ||
      "Login failed"
    );

  } finally {

    setLoading(false);

  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
            <span className="text-2xl">🛒</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SmartPOS</h1>
          <p className="text-slate-400 text-sm mt-1">AI-Powered Retail Store</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Welcome back </h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to your dashboard</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">Email address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@store.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : "Sign In →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <button onClick={onGoSignup} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create one
              </button>
            </p>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-indigo-300 text-xs text-center">Demo: any email + 6+ char password</p>
          </div>
        </div>
      </div>
    </div>
  );
}
