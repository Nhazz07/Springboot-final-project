import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import {
  User,
  Mail,
  Shield,
  Camera,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form edit state
  const [email, setEmail] = useState('');

  const loadProfile = async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const data = await userService.getProfile(user.username);
      setProfileData(data);
      setEmail(data.email || '');
    } catch (err) {
      console.warn('Could not load detailed profile, using session data:', err);
      setProfileData(user);
      setEmail(user.email || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.username]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });
    try {
      const updatedUser = await userService.uploadAvatar(user.username, file);
      setProfileData(updatedUser);
      // Immediately reflect across navbar & sidebar
      updateUserData({ imageUrl: updatedUser.imageUrl });
      setMessage({ type: 'success', text: 'Profile picture updated and uploaded to Cloudinary!' });
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload image. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileData?.id) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const updated = await userService.update(profileData.id, {
        username: profileData.username,
        email: email.trim(),
        role: profileData.role,
      });
      setProfileData(updated);
      updateUserData({ email: updated.email });
      setMessage({ type: 'success', text: 'Account details saved successfully.' });
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Could not update profile information.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-[#1d1d1f]" />
          My Profile & Settings
        </h2>
        <p className="text-xs text-[#86868b] mt-1">
          Manage your personal account credentials and profile picture
        </p>
      </div>

      {/* Alert Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-[#34c759]/12 border border-[#34c759]/25 text-[#248a3d]'
              : 'bg-[#ff3b30]/12 border border-[#ff3b30]/25 text-[#d70015]'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar Card */}
        <div className="bg-white rounded-3xl p-6 border border-black/8 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="relative group mb-4">
            {/* Avatar Image */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-black/8 shadow-md bg-[#f5f5f7] flex items-center justify-center">
              {profileData?.imageUrl ? (
                <img
                  src={profileData.imageUrl}
                  alt={profileData.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-extrabold text-[#1d1d1f] uppercase">
                  {profileData?.username?.[0] || 'U'}
                </span>
              )}
            </div>

            {/* Hover Camera Overlay for Upload */}
            <label className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <Camera className="w-7 h-7 mb-1" />
              <span className="text-[11px] font-semibold">Change Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-[#1d1d1f] mb-0.5">{profileData?.username}</h3>
          <p className="text-xs text-[#86868b] mb-3">{profileData?.email}</p>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-[#1d1d1f] border border-black/10 text-xs font-semibold">
            <Shield className="w-3 h-3" />
            <span>{profileData?.role || 'ROLE_ADMIN'}</span>
          </span>

          <p className="text-[11px] text-[#86868b] mt-4">
            Click avatar to upload a new picture directly to Cloudinary.
          </p>
        </div>

        {/* Right Column: Profile Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-black/8 shadow-sm">
          <h3 className="text-base font-bold text-[#1d1d1f] mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1d1d1f]" />
            Account Details
          </h3>
          <p className="text-xs text-[#86868b] mb-6">
            Review and update your system administrator details
          </p>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  type="text"
                  value={profileData?.username || ''}
                  disabled
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#86868b] bg-[#f5f5f7] border border-black/8 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-[#86868b] mt-1 block">
                Username identifier is fixed for seeded administrator accounts.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1d1d1f] placeholder-[#86868b] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:ring-2 focus:ring-black/10 focus:bg-white focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                Assigned Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  type="text"
                  value={profileData?.role || 'ADMIN'}
                  disabled
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#86868b] bg-[#f5f5f7] border border-black/8 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
