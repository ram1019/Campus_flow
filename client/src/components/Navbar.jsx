import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Layers,
  Bell,
  CheckCheck,
  PlusCircle,
  BarChart3,
  ListTodo,
  LogOut,
  User,
  Shield,
  Wrench,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, quickLogin, isAdmin, isStaff, isStudent } = useAuth();
  const {
    notifications,
    unreadCount,
    isOpen: notifOpen,
    setIsOpen: setNotifOpen,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const navigate = useNavigate();
  const location = useLocation();
  const [switchingRole, setSwitchingRole] = useState(false);

  const handleRoleSwitch = async (role) => {
    try {
      setSwitchingRole(true);
      await quickLogin(role);
      navigate('/');
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setSwitchingRole(false);
    }
  };

  const roleBadgeConfig = {
    admin: { label: 'Admin', icon: Shield, bg: 'bg-purple-100 text-purple-800 border-purple-300' },
    staff: { label: 'Staff / Tech', icon: Wrench, bg: 'bg-blue-100 text-blue-800 border-blue-300' },
    student: { label: 'Student', icon: GraduationCap, bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  };

  const currentRole = roleBadgeConfig[user?.role] || roleBadgeConfig.student;
  const RoleIcon = currentRole.icon;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-campus-600 to-campus-500 flex items-center justify-center text-white shadow-md shadow-campus-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-campus-900 via-campus-700 to-campus-600 bg-clip-text text-transparent">
                  CampusFlow
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Issue Engine
                </span>
              </div>
            </Link>

            {/* Main Nav Links */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-campus-50 text-campus-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/complaints"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/complaints')
                    ? 'bg-campus-50 text-campus-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                All Complaints
              </Link>

              {isAdmin && (
                <Link
                  to="/analytics"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/analytics')
                      ? 'bg-campus-50 text-campus-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher Pill */}
            <div className="hidden lg:flex items-center bg-slate-100 rounded-full p-1 border border-slate-200 text-xs">
              <span className="px-2 font-medium text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Demo Role:
              </span>
              <button
                type="button"
                onClick={() => handleRoleSwitch('student')}
                disabled={switchingRole}
                className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                  isStudent
                    ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('staff')}
                disabled={switchingRole}
                className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                  isStaff
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                disabled={switchingRole}
                className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                  isAdmin
                    ? 'bg-white text-purple-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Report Issue Button (Student or any user) */}
            <Link
              to="/new-complaint"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-campus-600 hover:bg-campus-700 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-campus-600" />
                      Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-campus-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n._id);
                            if (n.complaint?._id || n.complaint) {
                              navigate(`/complaints/${n.complaint._id || n.complaint}`);
                              setNotifOpen(false);
                            }
                          }}
                          className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-campus-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-800">
                              {n.title}
                            </span>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-campus-600 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                  {user?.name}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${currentRole.bg}`}
                >
                  <RoleIcon className="w-2.5 h-2.5" />
                  {currentRole.label}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
