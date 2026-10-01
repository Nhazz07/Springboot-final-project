import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import {
  Users as UsersIcon,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Camera,
  Check,
  AlertCircle,
  X,
  Mail,
  Lock,
  RefreshCw,
  Sparkles,
  ArrowRightLeft,
  KeyRound,
} from 'lucide-react';

const Users = () => {
  const { user: currentUser, updateUserData } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'ADMIN' | 'USER'
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Avatar upload state
  const [uploadingAvatarId, setUploadingAvatarId] = useState(null);
  const fileInputRef = useRef(null);
  const [targetAvatarUser, setTargetAvatarUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER',
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      showNotification('error', err.response?.data?.message || 'Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id?.toString().includes(searchQuery);

    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'ADMIN' && u.role === 'ADMIN') ||
      (roleFilter === 'USER' && u.role === 'USER');

    return matchesSearch && matchesRole;
  });

  // Analytics Metrics
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
  const totalStandard = users.filter((u) => u.role === 'USER').length;
  const verifiedAvatars = users.filter((u) => u.imageUrl && u.imageUrl.trim() !== '').length;

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'USER',
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (userToEdit) => {
    setSelectedUser(userToEdit);
    setFormData({
      username: userToEdit.username,
      email: userToEdit.email,
      password: '', // optional on edit
      role: userToEdit.role || 'USER',
    });
    setIsEditModalOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      showNotification('error', 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await userService.create({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      showNotification('success', `Account for "${formData.username}" created successfully.`);
      setIsCreateModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      showNotification('error', err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser?.id) return;
    if (!formData.username.trim() || !formData.email.trim()) {
      showNotification('error', 'Username and email cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        role: formData.role,
      };
      if (formData.password && formData.password.trim() !== '') {
        payload.password = formData.password.trim();
      }

      const updated = await userService.update(selectedUser.id, payload);

      // If updating own account, update context
      if (selectedUser.id === currentUser?.id || selectedUser.username === currentUser?.username) {
        updateUserData({
          email: updated.email,
          role: updated.role,
        });
      }

      showNotification('success', `User "${updated.username}" updated successfully.`);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      showNotification('error', err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Role Toggle
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmMessage =
      targetUser.role === 'ADMIN'
        ? `Demote "${targetUser.username}" to standard USER? They will lose access to the Admin Dashboard.`
        : `Promote "${targetUser.username}" to ADMIN? They will have full system administrative access.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await userService.update(targetUser.id, {
        username: targetUser.username,
        email: targetUser.email,
        role: newRole,
      });

      if (targetUser.id === currentUser?.id) {
        updateUserData({ role: newRole });
      }

      showNotification('success', `Role for ${targetUser.username} switched to ${newRole}.`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to change role:', err);
      showNotification('error', err.response?.data?.message || 'Failed to update role.');
    }
  };

  // Request Delete User (Show Popup Confirmation)
  const handleDeleteUser = (targetUser) => {
    if (targetUser.id === currentUser?.id || targetUser.username === currentUser?.username) {
      showNotification('error', 'You cannot delete your own active administrator account.');
      return;
    }
    setDeleteConfirmation(targetUser);
  };

  // Confirm and Execute User Deletion
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;

    setDeletingUser(true);
    try {
      await userService.delete(deleteConfirmation.id);
      showNotification('success', `Account "${deleteConfirmation.username}" deleted successfully.`);
      setDeleteConfirmation(null);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      showNotification('error', err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeletingUser(false);
    }
  };

  // Avatar Upload Trigger
  const handleTriggerAvatarUpload = (targetUser) => {
    setTargetAvatarUser(targetUser);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleAvatarFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !targetAvatarUser) return;

    setUploadingAvatarId(targetAvatarUser.id);
    try {
      const updated = await userService.uploadAvatarById(targetAvatarUser.id, file);

      // If own avatar, reflect across app
      if (targetAvatarUser.id === currentUser?.id || targetAvatarUser.username === currentUser?.username) {
        updateUserData({ imageUrl: updated.imageUrl });
      }

      showNotification('success', `Avatar for ${targetAvatarUser.username} updated on Cloudinary!`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      showNotification('error', err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatarId(null);
      setTargetAvatarUser(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hidden File Input for Avatar Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileSelected}
        accept="image/*"
        className="hidden"
      />

      {/* Floating Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-emerald-500/95 text-white border-emerald-400/40 shadow-emerald-500/20'
              : 'bg-red-500/95 text-white border-red-400/40 shadow-red-500/20'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium tracking-tight">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-75 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">Staff & Access Control</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-black/5 text-[#86868b] border border-black/8">
              Admin Only
            </span>
          </div>
          <p className="text-sm text-[#86868b] mt-1">
            Manage team accounts, assign administrative privileges, and supervise user profiles.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1d1d1f] hover:bg-[#333336] active:bg-black text-white text-sm font-medium transition-all shadow-md shadow-black/15 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Staff Member</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Total Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-[#1d1d1f]">
              <UsersIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{totalUsers}</span>
            <span className="text-xs text-[#86868b]">registered</span>
          </div>
        </div>

        {/* Administrators */}
        <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Administrators</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{totalAdmins}</span>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/50">
              Full Access
            </span>
          </div>
        </div>

        {/* Standard Users */}
        <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Standard Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{totalStandard}</span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/50">
              Shopping Only
            </span>
          </div>
        </div>

        {/* Cloudinary Avatars */}
        <div className="bg-white rounded-2xl p-5 border border-black/8 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Cloudinary Media</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{verifiedAvatars}</span>
            <span className="text-xs text-[#86868b]">avatars synced</span>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-black/8 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
          <input
            type="text"
            placeholder="Search staff by username, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f5f5f7] border-0 rounded-xl text-sm text-[#1d1d1f] placeholder-[#86868b] focus:ring-2 focus:ring-[#1d1d1f]/20 focus:bg-white transition-all outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f5f5f7] rounded-xl self-start sm:self-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Accounts' },
            { id: 'ADMIN', label: 'Admins' },
            { id: 'USER', label: 'Users' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                roleFilter === tab.id
                  ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table Card */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-[#86868b]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1d1d1f]" />
            <p className="text-sm font-medium">Loading staff records...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-black/5 text-[#86868b] flex items-center justify-center mx-auto mb-3">
              <UsersIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#1d1d1f]">No accounts found</h3>
            <p className="text-sm text-[#86868b] mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No staff matches "${searchQuery}". Try a different keyword.`
                : 'No staff accounts exist under this filter category.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/8 bg-[#fbfbfd]">
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                    Staff Identity
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                    Role & Privileges
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                    Registered On
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#86868b] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8">
                {filteredUsers.map((item) => {
                  const isCurrent =
                    item.id === currentUser?.id || item.username === currentUser?.username;
                  const isItemAdmin = item.role === 'ADMIN';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#fbfbfd]/80 transition-colors group"
                    >
                      {/* Identity & Avatar */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="relative group/avatar">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.username}
                                className="w-10 h-10 rounded-full object-cover border border-black/10 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-[#1d1d1f] to-[#434347] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                {item.username ? item.username.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}

                            {/* Quick Avatar Upload Overlay Button */}
                            <button
                              onClick={() => handleTriggerAvatarUpload(item)}
                              title="Upload profile picture to Cloudinary"
                              disabled={uploadingAvatarId === item.id}
                              className="absolute inset-0 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-xs"
                            >
                              {uploadingAvatarId === item.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Camera className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#1d1d1f]">
                                {item.username}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1d1d1f] text-white tracking-wider uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#86868b]">ID: #{item.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2 text-sm text-[#1d1d1f]">
                          <Mail className="w-3.5 h-3.5 text-[#86868b]" />
                          <span>{item.email}</span>
                        </div>
                      </td>

                      {/* Role Badge & Quick Switch */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isItemAdmin
                                ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                                : 'bg-blue-50 text-blue-700 border-blue-200/60'
                            }`}
                          >
                            {isItemAdmin ? (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                            {item.role || 'USER'}
                          </span>

                          {/* Quick Role Toggle button */}
                          <button
                            onClick={() => handleToggleRole(item)}
                            title={`Switch to ${isItemAdmin ? 'USER' : 'ADMIN'}`}
                            className="p-1 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 transition-colors"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-5 text-xs text-[#86868b]">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Pre-seeded'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit user details"
                            className="p-2 rounded-xl text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(item)}
                            title={
                              isCurrent
                                ? 'Cannot delete current account'
                                : 'Delete account'
                            }
                            disabled={isCurrent}
                            className={`p-2 rounded-xl transition-colors ${
                              isCurrent
                                ? 'text-black/20 cursor-not-allowed'
                                : 'text-[#86868b] hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= CREATE USER MODAL ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-black/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <div>
                <h3 className="text-lg font-bold text-[#1d1d1f]">Add Staff Member</h3>
                <p className="text-xs text-[#86868b] mt-0.5">
                  Create a new team account with customizable role
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-[#86868b] hover:text-[#1d1d1f] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] border-0 focus:ring-2 focus:ring-[#1d1d1f]/20 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. staff@etec.edu.kh"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] border-0 focus:ring-2 focus:ring-[#1d1d1f]/20 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                  Initial Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] border-0 focus:ring-2 focus:ring-[#1d1d1f]/20 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                  Access Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'USER' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.role === 'USER'
                        ? 'border-[#1d1d1f] bg-black/5 font-semibold text-[#1d1d1f]'
                        : 'border-black/8 hover:border-black/20 text-[#86868b]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#1d1d1f]">Standard User</div>
                    <div className="text-[11px] text-[#86868b] mt-0.5">Shopping & Orders</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.role === 'ADMIN'
                        ? 'border-purple-600 bg-purple-50/60 font-semibold text-purple-900'
                        : 'border-black/8 hover:border-black/20 text-[#86868b]'
                    }`}
                  >
                    <div className="text-xs font-bold text-purple-900">Administrator</div>
                    <div className="text-[11px] text-[#86868b] mt-0.5">Full System Access</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/8">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-black/8 text-sm font-medium text-[#1d1d1f] hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1d1d1f] hover:bg-[#333336] text-white text-sm font-medium transition-all shadow-md shadow-black/15 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT USER MODAL ================= */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-black/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <div>
                <h3 className="text-lg font-bold text-[#1d1d1f]">Edit Staff Member</h3>
                <p className="text-xs text-[#86868b] mt-0.5">
                  Update account credentials for {selectedUser.username}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-[#86868b] hover:text-[#1d1d1f] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] border-0 focus:ring-2 focus:ring-[#1d1d1f]/20 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] border-0 focus:ring-2 focus:ring-[#1d1d1f]/20 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                    New Password
                  </label>
                  <span className="text-[11px] text-[#86868b]">Optional</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
                  <input
                    type="password"
                    minLength={6}
                    placeholder="Leave blank to keep unchanged"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f5f5f7] rounded-xl text-sm text-[#1d1d1f] border-0 focus:ring-2 focus:ring-[#1d1d1f]/20 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                  Access Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'USER' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.role === 'USER'
                        ? 'border-[#1d1d1f] bg-black/5 font-semibold text-[#1d1d1f]'
                        : 'border-black/8 hover:border-black/20 text-[#86868b]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#1d1d1f]">Standard User</div>
                    <div className="text-[11px] text-[#86868b] mt-0.5">Shopping & Orders</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.role === 'ADMIN'
                        ? 'border-purple-600 bg-purple-50/60 font-semibold text-purple-900'
                        : 'border-black/8 hover:border-black/20 text-[#86868b]'
                    }`}
                  >
                    <div className="text-xs font-bold text-purple-900">Administrator</div>
                    <div className="text-[11px] text-[#86868b] mt-0.5">Full System Access</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/8">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-black/8 text-sm font-medium text-[#1d1d1f] hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1d1d1f] hover:bg-[#333336] text-white text-sm font-medium transition-all shadow-md shadow-black/15 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION POPUP MODAL */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 border border-black/8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-[#ff3b30] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1d1d1f] mb-1">
              Delete User Account?
            </h3>
            <p className="text-xs text-[#86868b] mb-4">
              Are you sure you want to permanently remove{' '}
              <strong className="text-[#1d1d1f]">"{deleteConfirmation.username}"</strong>? This action cannot be undone.
            </p>

            {/* User Mini Summary Card */}
            <div className="p-3 rounded-2xl bg-[#f5f5f7] border border-black/5 text-left flex items-center gap-3 mb-5">
              {deleteConfirmation.avatarUrl ? (
                <img
                  src={deleteConfirmation.avatarUrl}
                  alt={deleteConfirmation.username}
                  className="w-10 h-10 rounded-full object-cover border border-black/10 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {deleteConfirmation.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-[#1d1d1f] truncate">
                  {deleteConfirmation.fullName || deleteConfirmation.username}
                </p>
                <p className="text-[11px] text-[#86868b] truncate">
                  {deleteConfirmation.email || `@${deleteConfirmation.username}`}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  deleteConfirmation.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-black/5 text-[#1d1d1f]'
                }`}
              >
                {deleteConfirmation.role}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                disabled={deletingUser}
                className="px-5 py-2.5 rounded-full bg-[#f5f5f7] hover:bg-black/5 text-xs font-semibold text-[#1d1d1f] transition active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingUser}
                className="px-5 py-2.5 rounded-full bg-[#ff3b30] hover:bg-[#e03126] text-xs font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {deletingUser && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{deletingUser ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
