import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { MapPin, User, LogOut, CheckCircle, RefreshCw, Zap, Phone, Briefcase, Star, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import usePincode from '../hooks/usePincode';
import LocationDisplay from '../components/LocationDisplay';

const WorkerDashboard = () => {
    const { user, setUser } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [isError, setIsError] = useState(false);
    const [pincode, setPincode] = useState(user?.pincode || '');
    const { locationData, loading: pincodeLoading, error: pincodeError } = usePincode(pincode);
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('jobs'); // Default to jobs
    const [newPhone, setNewPhone] = useState(user?.phone || '');
    const [updateMsg, setUpdateMsg] = useState('');
    const [isUpdateError, setIsUpdateError] = useState(false);

    React.useEffect(() => {
        if (user?.location?.coordinates) {
            fetchNearbyJobs(user.location.coordinates[0], user.location.coordinates[1]);
        }
    }, [user?.location]);

    const fetchNearbyJobs = async (lng, lat) => {
        try {
            const res = await api.get(`/jobs/nearby?lng=${lng}&lat=${lat}&radius=50`);
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const updateLocation = async () => {
        if (!pincode || pincode.length !== 6) {
            setIsError(true);
            setMsg(t('enterPincode'));
            setTimeout(() => setMsg(''), 3000);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://api.zippopotam.us/in/${pincode}`);
            if (!response.ok) throw new Error('Invalid pincode');
            const data = await response.json();
            const place = data.places[0];
            const coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];

            const res = await api.put('/workers/me', {
                coordinates,
                pincode
            });
            setUser(res.data.user);
            setIsError(false);
            setMsg(t('success'));
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setIsError(true);
            setMsg(t('error'));
            setTimeout(() => setMsg(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const updateProfileData = async () => {
        if (!newPhone || newPhone.length < 10) {
            setIsUpdateError(true);
            setUpdateMsg(t('invalidPhone'));
            setTimeout(() => setUpdateMsg(''), 3000);
            return;
        }

        setLoading(true);
        try {
            const res = await api.put('/auth/profile', { phone: newPhone });
            setUser(res.data.user);
            setIsUpdateError(false);
            setUpdateMsg(t('success'));
            setTimeout(() => setUpdateMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setIsUpdateError(true);
            setUpdateMsg(err.response?.data?.message || t('error'));
            setTimeout(() => setUpdateMsg(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Categories - Hero-like section */}
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-6">{t('categories')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { title: t('nearbyJobs'), count: jobs.length, bg: 'linear-gradient(135deg, #5A4FCF, #7E74D5)', icon: MapPin },
                            { title: t('myProfile'), label: user?.name, bg: 'linear-gradient(135deg, #F97316, #FB923C)', icon: User },
                        ].map((cat, i) => (
                            <div
                                key={i}
                                style={{ background: cat.bg }}
                                className="h-32 md:h-40 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer shadow-lg"
                                onClick={() => i === 1 ? setActiveTab('profile') : setActiveTab('jobs')}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:scale-110 transition-transform"></div>
                                <cat.icon size={32} className="mb-2 md:mb-4 text-white/40 md:size-[40px]" />
                                <p className="text-[10px] md:text-sm font-bold text-white/70 uppercase tracking-widest">{cat.title}</p>
                                <h3 className="text-xl md:text-2xl font-black truncate">{cat.count || cat.label}</h3>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Main Section */}
                <section>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-slate-800">
                            {activeTab === 'profile' ? t('myProfile') : t('allAvailableJobs')}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('jobs')}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'jobs' ? 'bg-[var(--primary)] text-white' : 'bg-white text-slate-400'}`}
                            >
                                {t('jobs')}
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-[var(--primary)] text-white' : 'bg-white text-slate-400'}`}
                            >
                                {t('myProfile')}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' ? (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-10"
                            >
                                {/* Profile Info */}
                                <div className="onshop-card flex flex-col items-center text-center py-10">
                                    <div className="w-24 h-24 bg-[var(--primary)] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200">
                                        <User size={48} className="text-white" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-1">{user?.name}</h3>
                                    <p className="text-slate-400 font-bold mb-6">{user?.phone}</p>
                                    <div className="bg-slate-50 px-6 py-2 rounded-full border border-slate-100 flex items-center gap-2">
                                        <MapPin size={16} className="text-[var(--primary)]" />
                                        <span className="text-sm font-bold text-slate-500">{user?.pincode}</span>
                                    </div>
                                </div>

                                {/* Update Location */}
                                <div className="onshop-card">
                                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                                            <MapPin size={18} />
                                        </div>
                                        {t('updateLocation')}
                                    </h3>
                                    <div className="space-y-6">
                                        <input
                                            type="text"
                                            maxLength="6"
                                            placeholder={t('enterPincode')}
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            className="input-onshop text-center text-2xl font-black tracking-widest py-5"
                                        />
                                        <AnimatePresence>
                                            {(pincodeLoading || locationData || pincodeError) && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-center"
                                                >
                                                    {pincodeLoading && (
                                                        <div className="flex items-center justify-center text-xs font-bold text-slate-400">
                                                            <RefreshCw className="animate-spin mr-2" size={12} />
                                                            {t('fetchingLocation')}
                                                        </div>
                                                    )}
                                                    {locationData && (
                                                        <div className="flex items-center justify-center text-lg font-black text-emerald-500">
                                                            <CheckCircle className="mr-2" size={20} />
                                                            {locationData.placeName}, {locationData.state}
                                                        </div>
                                                    )}
                                                    {pincodeError && (
                                                        <div className="flex items-center justify-center text-xs font-bold text-red-400">
                                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2" />
                                                            {t('invalidPincode')}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <button
                                            onClick={updateLocation}
                                            disabled={loading}
                                            className="btn-onshop w-full py-4 text-lg"
                                        >
                                            {loading ? <RefreshCw className="animate-spin" size={24} /> : <RefreshCw size={24} />}
                                            {t('updateLocation')}
                                        </button>
                                        {msg && (
                                            <p className={`text-center font-bold ${isError ? 'text-red-500' : 'text-green-500'}`}>{msg}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Update Phone Number */}
                                <div className="onshop-card lg:col-span-2">
                                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
                                            <Phone size={18} />
                                        </div>
                                        {t('updatePhone')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t('newPhoneNumber')}</label>
                                            <input
                                                type="tel"
                                                placeholder="Enter new phone number"
                                                value={newPhone}
                                                onChange={(e) => setNewPhone(e.target.value)}
                                                className="input-onshop"
                                            />
                                        </div>
                                        <button
                                            onClick={updateProfileData}
                                            disabled={loading}
                                            className="btn-onshop py-4"
                                        >
                                            {loading ? <RefreshCw className="animate-spin" size={24} /> : <Zap size={24} />}
                                            {t('updatePhone')}
                                        </button>
                                    </div>
                                    {updateMsg && (
                                        <p className={`text-center mt-4 font-bold ${isUpdateError ? 'text-red-500' : 'text-green-500'}`}>{updateMsg}</p>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="jobs"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {jobs.length > 0 ? jobs.map((job) => (
                                    <motion.div
                                        key={job._id}
                                        whileHover={{ y: -5 }}
                                        className="onshop-card relative group"
                                    >


                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-black text-slate-800 line-clamp-1">{job.title}</h3>
                                            <p className="text-[var(--primary)] font-black">{t('daily')}</p>
                                        </div>

                                        <div className="flex items-center gap-1 mb-4">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className="fill-yellow-400 text-yellow-400" />)}
                                        </div>

                                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">
                                            <div className="flex items-center gap-1">
                                                <User size={14} className="text-[var(--primary-light)]" />
                                                {job.contractor?.name}
                                            </div>
                                            <LocationDisplay pincode={job.pincode} />
                                        </div>

                                        <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 h-10">{job.description}</p>

                                        {/* Call Now Button at the Bottom */}
                                        <a
                                            href={`tel:${job.contractor?.phone}`}
                                            className="btn-onshop w-full py-3 flex items-center justify-center gap-3"
                                        >
                                            <Phone size={18} /> {t('callNow')}
                                        </a>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full py-20 text-center onshop-card bg-slate-50/50 border-dashed border-2">
                                        <p className="text-slate-400 font-bold">{t('noJobsFound')}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>


            </div>
        </DashboardLayout>
    );
};

export default WorkerDashboard;

