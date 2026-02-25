import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Phone, Lock, User, MapPin, Globe, RefreshCw, Briefcase, UserCircle, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const { t, i18n } = useTranslation();
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        role: 'worker',
        pincode: ''
    });
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

    const toggleRole = () => {
        const newRole = formData.role === 'worker' ? 'engineer' : 'worker';
        setFormData({ ...formData, role: newRole });
        setError('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (formData.pincode.length !== 6) {
                throw new Error(t('pincode_length_error'));
            }

            try {
                const response = await fetch(`https://api.zippopotam.us/in/${formData.pincode}`);
                if (!response.ok) throw new Error('Invalid pincode');
                const data = await response.json();
                const place = data.places[0];
                const coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];
                await finalizeRegistration(coordinates);
            } catch (err) {
                console.error('Pincode fetch error:', err);
                setError(t('invalid_pincode_error'));
                setLoading(false);
            }
        } catch (err) {
            setError(err.message || t('registration_failed'));
            setLoading(false);
        }
    };

    const finalizeRegistration = async (coords) => {
        try {
            const data = await register({
                ...formData,
                location: { type: 'Point', coordinates: coords },
                language: i18n.language
            });
            navigate(data.user.role === 'engineer' ? '/engineer' : '/worker');
        } catch (err) {
            setError(err.response?.data?.message || t('registration_failed'));
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

                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleRole}
                        className="flex items-center space-x-3 px-8 py-3 rounded-2xl border-2 shadow-sm transition-all font-black uppercase tracking-widest text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    >
                        <UserCircle size={18} className="text-primary-600" />
                        <span>
                            {formData.role === 'worker' ? t('engineer_portal') : t('worker_registration')}
                        </span>
                    </motion.button>
                </div>
            </nav>

            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <motion.div
                    key={formData.role}
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="max-w-3xl w-full glass-card p-12 rounded-[2.5rem] relative z-10 border-4 border-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)]"
                >
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            className={`w-28 h-28 bg-gradient-to-br ${formData.role === 'worker' ? 'from-primary-500 to-primary-600' : 'from-accent to-accent-dark'} rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl relative`}
                        >
                            <UserPlus className="text-white" size={48} />
                        </motion.div>
                        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
                            {formData.role === 'worker' ? t('join_as_worker') : t('engineer_signup')}
                        </h2>

                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-6 bg-red-50 border-2 border-red-200 text-red-600 rounded-3xl text-sm flex items-center font-black"
                        >
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-4 shadow-sm" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4 col-span-1 md:col-span-2">
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-2">{t('name')}</label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl shadow-inner border-2 border-slate-200">
                                        <User size={28} strokeWidth={3} />
                                    </div>
                                    <input
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-field py-6 text-2xl"
                                        placeholder={t('full_name_placeholder')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-2">{t('phone')}</label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-primary-50 text-primary-600 rounded-2xl shadow-inner border-2 border-primary-100">
                                        <Phone size={28} strokeWidth={3} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <input
                                            name="phone"
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="input-field py-5 text-xl tracking-widest"
                                            placeholder="00000 00000"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest ml-2">{t('pincode')}</label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-accent/5 text-accent rounded-2xl shadow-inner border-2 border-accent/20">
                                        <MapPin size={28} strokeWidth={3} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <input
                                            name="pincode"
                                            required
                                            maxLength="6"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="input-field py-5 text-xl tracking-[0.2em]"
                                            placeholder="000000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>



                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-7 group relative overflow-hidden text-2xl mt-8"
                        >
                            <div className="relative flex justify-center items-center">
                                {loading ? (
                                    <RefreshCw className="animate-spin" size={32} />
                                ) : (
                                    <>
                                        <UserPlus size={32} className="mr-4" strokeWidth={3} />
                                        <span>{t('register')}</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-12 pt-10 border-t-4 border-slate-50 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center px-12 py-5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-3xl border-2 border-slate-200 font-extrabold uppercase tracking-widest text-sm transition-all shadow-sm"
                        >
                            <LogIn className="mr-3 text-primary-600" size={24} />
                            {t('already_have_account')}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
