import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Search, MapPin, Phone, LogOut, Filter, Info, Users, Zap, Navigation, RefreshCw, User, Globe, Briefcase, CheckCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/DashboardLayout';
import usePincode from '../hooks/usePincode';
import LocationDisplay from '../components/LocationDisplay';

const ContractorDashboard = () => {
    const { user, setUser } = useAuth();
    const { t } = useTranslation();
    const [workers, setWorkers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [activeTab, setActiveTab] = useState('workers'); // 'workers' or 'jobs'
    const [radius, setRadius] = useState(5);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState(null);
    const [pincode, setPincode] = useState(user?.pincode || '');

    // Pincode Details Hooks
    const { locationData: searchLoc, loading: searchLoading, error: searchErr } = usePincode(pincode);
    const [jobMsg, setJobMsg] = useState('');
    const [error, setError] = useState('');

    const [jobFormData, setJobFormData] = useState({
        title: '',
        description: '',
        pincode: ''
    });
    const { locationData: jobLoc, loading: jobLoading, error: jobErr } = usePincode(jobFormData.pincode);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        pincode: user?.pincode || ''
    });
    const { locationData: profileLoc, loading: profileLoading, error: profileErr } = usePincode(profileData.pincode);

    const [profileMsg, setProfileMsg] = useState('');
    const [profileError, setProfileError] = useState(false);

    const nativeNames = {
        en: 'English', hi: 'हिंदी', te: 'తెలుగు', mr: 'मराठी', pa: 'ਪੰਜਾਬੀ', bn: 'বাংলা'
    };

    useEffect(() => {
        if (user?.pincode) {
            handlePincodeSearch(user.pincode);
        }
        fetchMyJobs();
    }, []);

    const fetchWorkers = async (location, r) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/contractors/workers?lng=${location.lng}&lat=${location.lat}&radius=${r}`);
            setWorkers(res.data);
        } catch (err) {
            console.error(err);
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchMyJobs = async () => {
        try {
            const res = await api.get('/jobs/contractor');
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePincodeSearch = async (pin) => {
        if (!pin || pin.length !== 6) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`https://api.zippopotam.us/in/${pin}`);
            if (!response.ok) throw new Error('Invalid pincode');
            const data = await response.json();
            const place = data.places[0];
            const newCoords = { lng: parseFloat(place.longitude), lat: parseFloat(place.latitude) };
            setCoords(newCoords);
            // Re-fetch with new coords
            const res = await api.get(`/contractors/workers?lng=${newCoords.lng}&lat=${newCoords.lat}&radius=${radius}`);
            setWorkers(res.data);
        } catch (err) {
            console.error('Pincode fetch error:', err);
            setError(t('enterPincode'));
            setWorkers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`https://api.zippopotam.us/in/${jobFormData.pincode}`);
            if (!response.ok) throw new Error('Invalid pincode');
            const data = await response.json();
            const place = data.places[0];
            const coordinates = [parseFloat(place.longitude), parseFloat(place.latitude)];

            await api.post('/jobs', { ...jobFormData, coordinates });
            setJobMsg(t('success'));
            setJobFormData({ title: '', description: '', pincode: '' });
            fetchMyJobs();
            setTimeout(() => setJobMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || t('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleRadiusChange = (e) => {
        const newRadius = e.target.value;
        setRadius(newRadius);
        if (coords) {
            api.get(`/contractors/workers?lng=${coords.lng}&lat=${coords.lat}&radius=${newRadius}`)
                .then(res => setWorkers(res.data));
        }
    };

    const handleCallClick = async (workerId, phone) => {
        try {
            await api.patch(`/contractors/workers/${workerId}/call`);
            window.location.href = `tel:${phone}`;
        } catch (err) {
            console.error('Tracking call error:', err);
            window.location.href = `tel:${phone}`;
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setProfileMsg('');
        try {
            let updatePayload = {
                name: profileData.name,
                phone: profileData.phone,
                pincode: profileData.pincode
            };

            if (profileData.pincode !== user.pincode) {
                const response = await fetch(`https://api.zippopotam.us/in/${profileData.pincode}`);
                if (!response.ok) throw new Error('Invalid pincode');
                const data = await response.json();
                updatePayload.coordinates = [parseFloat(data.places[0].longitude), parseFloat(data.places[0].latitude)];
            }

            const res = await api.put('/auth/profile', updatePayload);
            setUser(res.data.user);
            setProfileMsg(t('success'));
            setProfileError(false);
            setTimeout(() => setProfileMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setProfileMsg(err.response?.data?.message || err.message || t('error'));
            setProfileError(true);
            setTimeout(() => setProfileMsg(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Hero Stats */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="onshop-card bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white p-6 md:p-8">
                        <Users size={32} className="mb-4 opacity-50" />
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70">{t('nearbyWorkers')}</p>
                        <h3 className="text-2xl md:text-3xl font-black">{workers.length}</h3>
                    </div>
                    <div className="onshop-card bg-gradient-to-br from-orange-400 to-orange-500 text-white p-6 md:p-8">
                        <Briefcase size={32} className="mb-4 opacity-50" />
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70">{t('myPostedJobs')}</p>
                        <h3 className="text-2xl md:text-3xl font-black">{jobs.length}</h3>
                    </div>
                    <div className="onshop-card sm:col-span-2 flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 gap-4">
                        <div>
                            <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{t('searchRadius')}</p>
                            <h3 className="text-xl md:text-2xl font-black text-slate-800">{radius} km</h3>
                        </div>
                        <div className="w-full md:flex-1 md:max-w-[200px]">
                            <input
                                type="range" min="1" max="50" value={radius}
                                onChange={handleRadiusChange}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex overflow-x-auto pb-4 md:pb-0 md:justify-between items-center mb-8 scrollbar-hide">
                        <div className="flex gap-2 md:gap-4 flex-nowrap min-w-max">
                            <button
                                onClick={() => setActiveTab('workers')}
                                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all ${activeTab === 'workers' ? 'bg-[var(--primary)] text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400'}`}
                            >
                                {t('findWorkers')}
                            </button>
                            <button
                                onClick={() => setActiveTab('jobs')}
                                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all ${activeTab === 'jobs' ? 'bg-[var(--primary)] text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400'}`}
                            >
                                {t('myPostedJobs')}
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-[var(--primary)] text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400'}`}
                            >
                                {t('myProfile')}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'workers' ? (
                            <motion.div
                                key="workers"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                {/* Search Pincode */}
                                <div className="onshop-card flex flex-col md:flex-row gap-6 items-center">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-[var(--primary)]">
                                        <Navigation size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800">{t('changeLocation')}</h3>
                                        <p className="text-xs text-slate-400 font-medium">{t('findWorkersByPincode')}</p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                maxLength="6"
                                                placeholder={t('pincode')}
                                                value={pincode}
                                                onChange={(e) => setPincode(e.target.value)}
                                                className="input-onshop md:w-32 text-center font-bold tracking-widest"
                                            />
                                            <AnimatePresence>
                                                {(searchLoading || searchLoc || searchErr) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute top-full right-0 mt-2 bg-white p-2 rounded-lg shadow-xl border border-slate-100 z-30 min-w-[200px]"
                                                    >
                                                        {searchLoading && (
                                                            <div className="flex items-center text-[10px] font-bold text-slate-400">
                                                                <RefreshCw className="animate-spin mr-2" size={10} />
                                                                {t('fetchingLocation')}
                                                            </div>
                                                        )}
                                                        {searchLoc && (
                                                            <div className="flex items-center text-xs font-black text-emerald-500">
                                                                <CheckCircle className="mr-2" size={14} />
                                                                {searchLoc.placeName}, {searchLoc.state}
                                                            </div>
                                                        )}
                                                        {searchErr && (
                                                            <div className="flex items-center text-[10px] font-bold text-red-400">
                                                                <div className="w-1 h-1 bg-red-400 rounded-full mr-2" />
                                                                {t('invalidPincode')}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <button
                                            onClick={() => handlePincodeSearch(pincode)}
                                            className="btn-onshop px-6"
                                        >
                                            <Search size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Workers Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {workers.length > 0 ? workers.map((worker) => (
                                        <motion.div
                                            key={worker._id}
                                            whileHover={{ y: -5 }}
                                            className="onshop-card"
                                        >
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                                    <User size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 leading-none mb-1">{worker.name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{worker.role || t('vendor')}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-8">
                                                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                    <Globe size={10} /> {nativeNames[worker.language] || worker.language}
                                                </div>
                                                <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                    <Star size={10} className="fill-amber-600" /> 4.9
                                                </div>
                                            </div>

                                            <LocationDisplay pincode={worker.pincode} variant="worker-card" />

                                            <button
                                                onClick={() => handleCallClick(worker._id, worker.phone)}
                                                className="btn-onshop w-full"
                                            >
                                                <Phone size={18} /> {t('callWorker')}
                                            </button>
                                        </motion.div>
                                    )) : (
                                        <div className="col-span-full py-20 text-center onshop-card bg-slate-50/50 border-dashed border-2">
                                            <p className="text-slate-400 font-bold">{t('noWorkersFound')}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : activeTab === 'jobs' ? (
                            <motion.div
                                key="jobs"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                            >
                                <div className="onshop-card h-fit sticky top-32 lg:col-span-1">
                                    <h2 className="text-xl font-black text-slate-800 mb-6 font-bold flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
                                            <Zap size={18} />
                                        </div>
                                        {t('postAJob')}
                                    </h2>
                                    <form onSubmit={handleJobSubmit} className="space-y-5">
                                        <input
                                            type="text"
                                            required
                                            value={jobFormData.title}
                                            onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                                            className="input-onshop"
                                            placeholder={t('jobTitlePlaceholder')}
                                        />
                                        <textarea
                                            required
                                            rows="4"
                                            value={jobFormData.description}
                                            onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                                            className="input-onshop text-sm"
                                            placeholder={t('jobDescriptionPlaceholder')}
                                        />
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                maxLength="6"
                                                required
                                                value={jobFormData.pincode}
                                                onChange={(e) => setJobFormData({ ...jobFormData, pincode: e.target.value })}
                                                className="input-onshop text-center font-bold tracking-widest"
                                                placeholder={t('workPincode')}
                                            />
                                            <AnimatePresence>
                                                {(jobLoading || jobLoc || jobErr) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0 }}
                                                        className="text-center"
                                                    >
                                                        {jobLoading && <p className="text-[10px] font-bold text-slate-400">{t('fetchingLocation')}</p>}
                                                        {jobLoc && <p className="text-xs font-black text-emerald-500">{jobLoc.placeName}, {jobLoc.state}</p>}
                                                        {jobErr && <p className="text-[10px] font-bold text-red-400">{t('invalidPincode')}</p>}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-onshop w-full py-4 from-orange-500 to-orange-600 bg-gradient-to-r"
                                        >
                                            {loading ? <RefreshCw className="animate-spin" size={24} /> : <span>{t('postJobNow')}</span>}
                                        </button>
                                        {jobMsg && <p className="text-emerald-500 text-center font-bold text-sm">{jobMsg}</p>}
                                        {profileMsg && !profileError && <p className="text-emerald-500 text-center font-bold text-sm">{profileMsg}</p>}
                                        {error && <p className="text-red-500 text-center font-bold text-sm">{error}</p>}
                                    </form>
                                </div>

                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="font-bold text-slate-800 mb-4 ml-2">{t('myRecentlyPostedJobs')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {jobs.length > 0 ? jobs.map((job) => (
                                            <motion.div
                                                key={job._id}
                                                whileHover={{ scale: 1.01 }}
                                                className="onshop-card border-none"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] bg-indigo-50 px-2 py-1 rounded-md">{t('live')}</span>
                                                    <span className="text-slate-300"><MapPin size={16} /></span>
                                                </div>
                                                <h3 className="text-lg font-black text-slate-800 mb-2 truncate">{job.title}</h3>
                                                <p className="text-sm text-slate-400 font-medium line-clamp-2 mb-6 h-10">{job.description}</p>
                                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-50">
                                                    <LocationDisplay pincode={job.pincode} />
                                                    <span className="text-emerald-500">{t('active')}</span>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="col-span-full py-20 text-center onshop-card bg-slate-50/50 border-dashed border-2">
                                                <p className="text-slate-400 font-bold">{t('noJobsPosted')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-2xl mx-auto"
                            >
                                <div className="onshop-card p-10">
                                    <div className="flex flex-col items-center text-center mb-10">
                                        <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-[var(--primary)] mb-6 shadow-xl shadow-indigo-50">
                                            <User size={48} />
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-800">{user?.name}</h2>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">{t('contractorProfile')}</p>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('fullName')}</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    className="input-onshop"
                                                    placeholder={t('fullName')}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('phoneNumber')}</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    className="input-onshop"
                                                    placeholder={t('phoneNumber')}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('pincode')}</label>
                                            <input
                                                type="text"
                                                maxLength="6"
                                                required
                                                value={profileData.pincode}
                                                onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })}
                                                className="input-onshop text-center text-2xl font-black tracking-[0.5em]"
                                                placeholder="000000"
                                            />
                                            <AnimatePresence>
                                                {(profileLoading || profileLoc || profileErr) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0 }}
                                                        className="text-center"
                                                    >
                                                        {profileLoading && <p className="text-xs font-bold text-slate-400">{t('fetchingLocation')}</p>}
                                                        {profileLoc && <p className="text-base font-black text-emerald-500">{profileLoc.placeName}, {profileLoc.state}</p>}
                                                        {profileErr && <p className="text-xs font-bold text-red-100">{t('invalidPincode')}</p>}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-onshop w-full py-5 text-lg shadow-xl shadow-indigo-100"
                                        >
                                            {loading ? <RefreshCw className="animate-spin" size={24} /> : <CheckCircle size={24} />}
                                            {t('updateProfile')}
                                        </button>

                                        {profileMsg && (
                                            <p className={`text-center font-bold mt-4 ${profileError ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {profileMsg}
                                            </p>
                                        )}
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default ContractorDashboard;
