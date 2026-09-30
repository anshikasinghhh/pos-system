// import { useState } from "react";
import { useState, useEffect } from "react";
import { api } from "./services/api";
import Login from "./pages/Login";
import SalesHistory from "./pages/SalesHistory";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import AISuggestions from "./pages/AISuggestions";
import Profile from "./pages/Profile";
import Sidebar from "./layouts/Sidebar";
import Navbar from "./components/Navbar";
import Predictions from "./pages/Predictions";

export default function App()  {
  const [authPage, setAuthPage] = useState("login"); // "login" | "signup"
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [aiSuggestionCount, setAISuggestionCount] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isValidating, setIsValidating] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const validateAuth = async () => {
      const userData = await api.auth.validateToken();
      if (userData) {
        setUser(userData);
      }
      setIsValidating(false);
    };
    
    validateAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadAISuggestionCount = async () => {
      try {
        const suggestions = await api.aiSuggestions.getSuggestions();
        setAISuggestionCount(Array.isArray(suggestions) ? suggestions.length : 0);
      } catch (error) {
        console.error("Failed to load AI suggestion count:", error);
        setAISuggestionCount(0);
      }
    };

    loadAISuggestionCount();
  }, [user]);
  useEffect(() => {

  if (!user) return;

  const loadAnalytics = async () => {
    try {

      const data = await api.analytics.getAnalytics();

      setAnalyticsData(data);

    } catch (err) {

      console.error("Failed to load analytics:", err);

    }
  };

  loadAnalytics();

}, [user]);

  // const handleLogin = async (email, password) => {
  //   const res = await api.auth.login(email, password);
  //   setUser(res.user);
  // };
  const handleLogin = async (email, password) => {

    const res = await api.auth.login(email, password);
    const loggedInUser = res?.user || {
      email,
      name: email.split("@")[0],
      role: "customer"
    };

    setUser(loggedInUser);
    setActivePage("dashboard");

    // Role-based default page

    // if(res.user.role === "admin"){

    //     setActivePage("dashboard");

    // } else {

    //     setActivePage("billing");

    // }
};

  const handleSignup = async (name, email, password) => {
    await api.auth.signup(name, email, password);
    // After signup → go to login
    setAuthPage("login");
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
    setAuthPage("login");
    setActivePage("dashboard");
  };

  // Show loading while validating auth
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authPage === "login"
      ? <Login onLogin={handleLogin} onGoSignup={() => setAuthPage("signup")} />
      : <Signup onSignup={handleSignup} onGoLogin={() => setAuthPage("login")} />;
  }

  // const pages = {
  //   dashboard: Dashboard,
  //   billing: Billing,
  //   inventory: Inventory,
  //   analytics: Analytics,
  //   profile: Profile,
  //   sales: SalesHistory,
  //   predictions: Predictions,
  //   "ai-suggestions": () => <AISuggestions onCountChange={setAISuggestionCount} />
  // };
  const pages = {

  dashboard: () => (
    <Dashboard analytics={analyticsData} />
  ),

  billing: Billing,

  inventory: Inventory,

  analytics: () => (
    <Analytics analytics={analyticsData} />
  ),

  profile: Profile,

  sales: SalesHistory,

  predictions: Predictions,

  "ai-suggestions": () => (
    <AISuggestions onCountChange={setAISuggestionCount} />
  )

};

  const PageComponent = pages[activePage] || Dashboard;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
        user={user}
        aiSuggestionCount={aiSuggestionCount}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar user={user} activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          <PageComponent />
        </main>
      </div>
    </div>
  );
}
