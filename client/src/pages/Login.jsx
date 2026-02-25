import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Globe, Phone, Lock, RefreshCw, Briefcase, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const { t, i18n } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAutoRotating, setIsAutoRotating] = useState(true);

    const languages = ['en', 'hi', 'bn', 'te', 'mr'];
    const nativeNames = {
        en: 'English',
        hi: 'हिंदी',
        bn: 'বাংলা',
        te: 'తెలుగు',
        mr: 'मराठी'
    };

    React.useEffect(() => {
        if (!isAutoRotating) return;
        const timer = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % languages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [isAutoRotating]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
        localStorage.setItem('i18nextLng', newLang); // Force immediate persistence
        setIsAutoRotating(false);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(phone, phone, i18n.language);
            navigate(data.user.role === 'engineer' ? '/engineer' : '/worker');
        } catch (err) {
            setError(err.response?.data?.message || t('login_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="mesh-bg absolute inset-0 -z-10" />

            {/* Top Navigation Bar */}
            <nav className="p-6 flex justify-between items-center relative z-20">
                <Link to="/" className="text-2xl font-black text-gradient flex items-center">
                    <Briefcase className="mr-2 text-primary-400" size={28} />
                    DailyWages
                </Link>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 bg-white hover:bg-slate-50 px-6 py-3 rounded-2xl border-2 border-slate-200 shadow-sm transition-all h-full group cursor-pointer relative">
                        <Globe size={24} className="text-primary-600" />
                        <span className="font-black text-slate-700 uppercase tracking-widest text-sm">
                            {nativeNames[i18n.language]}
                        </span>
                        <select
                            value={i18n.language}
                            onChange={handleLanguageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{nativeNames[lang]}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="max-w-md w-full glass-card p-12 rounded-[2.5rem] relative z-10 border-4 border-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)]"
                >
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className="w-28 h-28 bg-gradient-to-br from-primary-500 to-primary-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_-5px_rgba(14,165,233,0.4)] relative"
                        >
                            <LogIn className="text-white" size={48} />
                        </motion.div>
                        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">{t('login')}</h2>

                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-6 bg-red-50 border-2 border-red-200 text-red-600 rounded-3xl text-sm flex items-center font-black"
                        >
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-4 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-2">{t('phone')}</label>
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 flex items-center justify-center bg-primary-50 text-primary-600 rounded-3xl shadow-inner border-2 border-primary-100">
                                    <Phone size={32} strokeWidth={3} />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="input-field py-6 text-2xl tracking-widest"
                                        placeholder="00000 00000"
                                    />
                                </div>
                            </div>
                        </div>





                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-7 group relative overflow-hidden text-2xl"
                        >
                            <div className="relative flex justify-center items-center">
                                {loading ? (
                                    <RefreshCw className="animate-spin" size={32} />
                                ) : (
                                    <>
                                        <LogIn size={32} className="mr-4" strokeWidth={3} />
                                        <span>{t('login')}</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-12 pt-10 border-t-4 border-slate-50 text-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center px-12 py-5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-3xl border-2 border-slate-200 font-extrabold uppercase tracking-widest text-sm transition-all shadow-sm"
                        >
                            <Briefcase className="mr-3 text-primary-600" size={24} />
                            {t('register')}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
