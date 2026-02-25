import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Phone, Lock, User, MapPin, Globe, RefreshCw, Briefcase, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const { t, i18n } = useTranslation();
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
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
        setFormData({ ...formData, role: newRole, password: '' });
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
                throw new Error('Please enter a valid 6-digit pincode');
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
                setError('Invalid pincode. Please check and try again.');
                setLoading(false);
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
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
            setError(err.response?.data?.message || 'Registration failed');
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
                    <div className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-xl transition-all h-full group">
                        <Globe size={18} className="text-primary-400 group-hover:rotate-45 transition-transform duration-500" />
                        <div className="flex flex-col relative">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={isAutoRotating ? currentStep : i18n.language}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-[12px] font-black text-white uppercase tracking-[0.2em] leading-none whitespace-nowrap"
                                >
                                    {isAutoRotating
                                        ? i18n.getResourceBundle(languages[currentStep], 'translation')?.['select_language']
                                        : t('select_language')
                                    }
                                </motion.span>
                            </AnimatePresence>
                            <select
                                value={i18n.language}
                                onChange={handleLanguageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                                <option value="bn">বাংলা</option>
                                <option value="te">తెలుగు</option>
                                <option value="mr">मराठी</option>
                            </select>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleRole}
                        className={`flex items-center space-x-3 px-8 py-3 rounded-2xl border-2 shadow-2xl backdrop-blur-2xl transition-all font-black uppercase tracking-widest text-xs ${formData.role === 'worker'
                            ? 'bg-accent/20 border-accent text-accent hover:bg-accent/30'
                            : 'bg-primary-500/20 border-primary-400 text-primary-400 hover:bg-primary-500/30'
                            }`}
                    >
                        <UserCircle size={18} />
                        <span>
                            {formData.role === 'worker' ? 'Engineer Portal' : 'Worker Registration'}
                        </span>
                    </motion.button>
                </div>
            </nav>

            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <motion.div
                    key={formData.role}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-xl w-full glass-card p-10 rounded-3xl relative z-10"
                >
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className={`w-20 h-20 bg-gradient-to-tr ${formData.role === 'worker' ? 'from-primary-500 to-primary-400' : 'from-accent to-accent-light'} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative rotate-12 hover:rotate-0 transition-transform duration-500`}
                        >
                            <UserPlus className="text-white" size={36} />
                        </motion.div>
                        <h2 className="text-4xl font-black text-gradient mb-2">{formData.role === 'worker' ? 'Join as Worker' : 'Engineer Signup'}</h2>
                        <motion.div
                            key={isAutoRotating ? currentStep : i18n.language}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-6"
                        >
                            <p className="text-white/50 font-medium text-sm tracking-wide">
                                {isAutoRotating
                                    ? i18n.getResourceBundle(languages[currentStep], 'translation')?.['welcome']
                                    : t('welcome')
                                }
                            </p>
                        </motion.div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-8 p-4 bg-red-500/20 border border-red-500/50 text-red-100 rounded-2xl text-xs backdrop-blur-md flex items-center font-bold"
                        >
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-3 ml-1">{t('name')}</label>
                                <div className="flex items-center space-x-3 group">
                                    <div className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/30 group-focus-within:text-primary-400 group-focus-within:border-primary-400/50 transition-all shadow-inner">
                                        <User size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="input-field py-4"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-3 ml-1">{t('phone')}</label>
                                <div className="flex items-center space-x-3 group">
                                    <div className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/30 group-focus-within:text-primary-400 group-focus-within:border-primary-400/50 transition-all shadow-inner">
                                        <Phone size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            name="phone"
                                            type="text"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="input-field py-4"
                                            placeholder="Phone Number"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-3 ml-1">{t('pincode')}</label>
                                <div className="flex items-center space-x-3 group">
                                    <div className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/30 group-focus-within:text-accent-light group-focus-within:border-accent/50 transition-all shadow-inner">
                                        <MapPin size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            name="pincode"
                                            type="text"
                                            required
                                            maxLength="6"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="input-field py-4"
                                            placeholder="Pincode"
                                        />
                                    </div>
                                </div>
                            </div>

                            {formData.role !== 'worker' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="group"
                                >
                                    <label className="block text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-3 ml-1">{t('password')}</label>
                                    <div className="flex items-center space-x-3 group">
                                        <div className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/30 group-focus-within:text-accent-light group-focus-within:border-accent/50 transition-all shadow-inner">
                                            <Lock size={22} />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                name="password"
                                                type="password"
                                                required={formData.role !== 'worker'}
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="input-field py-4"
                                                placeholder="Create Password"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>



                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary w-full py-5 group relative overflow-hidden ${formData.role === 'worker' ? '' : 'from-accent to-accent-dark'}`}
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
                            <span className="relative flex justify-center items-center font-black uppercase tracking-[0.2em] text-sm">
                                {loading ? (
                                    <RefreshCw className="animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus size={20} className="mr-3" />
                                        {t('register')}
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-white/5 text-center">
                        <p className="text-white/40 font-bold text-xs uppercase tracking-widest mb-4">
                            {t('already_have_account')}
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 font-black uppercase tracking-widest text-[10px] transition-all"
                        >
                            {t('login')}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
