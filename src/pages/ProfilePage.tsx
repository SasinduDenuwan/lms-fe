import React, { useState, useEffect } from 'react';
import { validate, showErrorToast } from '../utils/validation';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/authContext';
import { getUserProfile, updateUserProfile, changeUserPassword } from '../services/students';
// import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { 
  User, 
  Lock, 
  Save, 
  Loader2, 
  Mail, 

  Shield, 
  Bell, 
  ChevronRight,
  Eye,
  EyeOff,
  Home
} from 'lucide-react';

interface UserProfile {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  mobile: string;
  address: string;
  profilePicLink: string;
  roles: string[];
  isActive?: boolean;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'security' | 'notifications'>('general');


  // Form states
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response && response.data) {
        setProfile(response.data);
        setFormData({
          firstname: response.data.firstname || '',
          lastname: response.data.lastname || ''
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load profile data',
        icon: 'error',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };



  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstname.trim()) {
      showErrorToast("First name is required");
      return;
    }
    const fnError = validate(formData.firstname, 'name');
    if (fnError) {
      showErrorToast(fnError);
      return;
    }

    if (!formData.lastname.trim()) {
      showErrorToast("Last name is required");
      return;
    }
    const lnError = validate(formData.lastname, 'name');
    if (lnError) {
      showErrorToast(lnError);
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to update your profile details?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d9488', // teal-600
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        try {
          const form = new FormData();
          form.append('firstname', formData.firstname);
          form.append('lastname', formData.lastname);

          


          await updateUserProfile(form);
          
          Swal.fire({
            title: 'Updated!',
            text: 'Your profile has been updated.',
            icon: 'success',
            confirmButtonColor: '#0d9488'
          });
          
          // toast.success("Profile updated successfully");
          fetchProfile();
          
        } catch (error) {
          console.error("Error updating profile:", error);
          // toast.error("Failed to update profile");
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update profile.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showErrorToast("New passwords do not match");
      return;
    }

    const passwordError = validate(passwordData.newPassword, 'password');
    if (passwordError) {
      showErrorToast(passwordError);
      return;
    }

    Swal.fire({
      title: 'Change Password?',
      text: "You will be logged out after changing your password.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48', // red-600 because it's security
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        try {
          await changeUserPassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          });
          
          await Swal.fire({
            title: 'Password Changed!',
            html: 'Password changed successfully.<br><b>Logging out in 3 seconds...</b>',
            icon: 'success',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            willClose: () => {
              // Logout logic executed when alert closes
              localStorage.removeItem('accessToken');
              localStorage.removeItem('userRole');
              localStorage.removeItem('firstname');
              localStorage.removeItem('email');
              navigate('/');
              window.location.reload(); 
            }
          });

        } catch (error: any) {
          console.error("Error changing password:", error);
           Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || "Failed to change password",
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        } finally {
          setIsSaving(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-50 via-white to-blue-50">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeSection, icon: any, label: string }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
        activeSection === id 
          ? 'bg-linear-to-r from-teal-50 to-blue-50 text-teal-700 font-medium shadow-sm border border-teal-100' 
          : 'text-gray-600 hover:bg-white hover:shadow-md hover:text-teal-600 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className={`p-2 rounded-lg transition-colors duration-300 ${activeSection === id ? 'bg-white text-teal-600 shadow-sm' : 'bg-gray-50 text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-500'}`}>
          <Icon size={18} />
        </div>
        <span>{label}</span>
      </div>
      {activeSection === id && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-l-xl"
        />
      )}
      {activeSection === id && <ChevronRight size={16} className="text-teal-500 relative z-10" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-3 space-y-6">
            {/* User Short Info */}
            <div className="bg-white rounded-3xl shadow-xl shadow-teal-900/5 border border-white/20 overflow-hidden relative group">
              {/* Card Header Background */}
              <div className="h-24 bg-linear-to-r from-teal-500 via-blue-500 to-indigo-500 relative">
                <div className="absolute inset-0 bg-white/10 pattern-grid-lg opacity-20" />
              </div>
              
              <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center -mt-12">
                <div className="relative mb-4">
                   <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden relative z-10 bg-white">
                    <img
                      src={profile?.profilePicLink || "https://ui-avatars.com/api/?name=" + (profile?.firstname || 'U') + "&background=random"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900">{profile?.firstname} {profile?.lastname}</h2>
                <p className="text-sm text-gray-500 mb-4">{profile?.email}</p>
                
                 <span className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
                      profile?.isActive 
                        ? 'bg-linear-to-r from-teal-50 to-emerald-50 text-teal-700 border-teal-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {profile?.isActive ? 'Active Account' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-xl shadow-blue-900/5 border border-white/40 space-y-2">
              <SidebarItem id="general" icon={User} label="General" />
              <SidebarItem id="security" icon={Lock} label="Security" />
              
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden text-gray-600 hover:bg-white hover:shadow-md hover:text-teal-600 border border-transparent"
              >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-500 transition-colors duration-300 shadow-sm">
                      <Home size={18} />
                    </div>
                    <span className="font-medium">Home</span>
                  </div>
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="md:col-span-9">
             <AnimatePresence mode="wait">
              {activeSection === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-white/20 p-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-teal-50 to-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50" />
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-teal-600 to-blue-600">General Information</h2>
                      <p className="text-gray-500 mt-1">Update your photo and personal details here</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">First Name</label>
                        <input
                          type="text"
                          name="firstname"
                          value={formData.firstname}
                          onChange={handleInputChange}
                          className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300 outline-none"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Last Name</label>
                        <input
                          type="text"
                          name="lastname"
                          value={formData.lastname}
                          onChange={handleInputChange}
                          className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300 outline-none"
                        />
                      </div>
                      <div className="md:col-span-2 group">
                        <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Email Address</label>
                        <div className="relative">
                          <div className="absolute left-4 top-3.5 p-1 bg-gray-100 rounded-lg text-gray-400">
                             <Mail size={16} />
                          </div>
                          <input
                            type="email"
                            value={profile?.email}
                            disabled
                            className="w-full pl-14 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-500 cursor-not-allowed outline-none"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1 ml-1">
                          <Shield size={12} className="text-teal-500" /> Verified email address
                        </p>
                      </div>

                    </div>

                    <div className="pt-8 border-t border-gray-100 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSaving}
                        className="bg-linear-to-r from-teal-500 to-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeSection === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-white/20 p-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-orange-50 to-red-50 rounded-bl-full -mr-16 -mt-16 opacity-50" />
                  
                  <div className="mb-8 relative z-10">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-orange-600 to-red-600">Security Settings</h2>
                    <p className="text-gray-500 mt-1">Manage your password and security preferences</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-6 max-w-2xl relative z-10">
                    <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-800 mb-6 flex gap-3">
                      <div className="p-1 bg-amber-100 rounded-full h-fit text-amber-600">
                        <Lock size={16} />
                      </div>
                      <div>
                        <p className="font-bold mb-1">Password Requirements</p>
                        <ul className="list-disc list-inside space-y-1 text-amber-700/80 pl-1">
                          <li>Minimum 6 characters long</li>
                          <li>Must contain at least one number</li>
                          <li>Must contain at least one special character</li>
                        </ul>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 outline-none pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={6}
                          className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 outline-none pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={6}
                          className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-300 outline-none pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex justify-end">
                      <motion.button
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSaving}
                        className="bg-linear-to-r from-orange-500 to-red-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                         {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Update Password
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-white/20 p-8 flex flex-col items-center justify-center min-h-[500px] text-center relative overflow-hidden"
                >
                  <div className="w-24 h-24 bg-linear-to-tr from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 rounded-full animate-ping bg-indigo-50 opacity-20"></div>
                    <Bell size={40} className="text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">No Notifications</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2">
                    We'll let you know when there are important updates.
                  </p>
                </motion.div>
              )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
