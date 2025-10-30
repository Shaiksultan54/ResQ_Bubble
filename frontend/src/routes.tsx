import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/inventory/InventoryPage';
import InventoryItemPage from './pages/inventory/InventoryItemPage';
import NewInventoryPage from './pages/inventory/NewInventoryPage';
import AgenciesPage from './pages/agencies/AgenciesPage';
import AgencyProfilePage from './pages/agencies/AgencyProfilePage';
import MessagesPage from './pages/messages/MessagesPage';
import ConversationPage from './pages/messages/ConversationPage';
import AlertsPage from './pages/alerts/AlertsPage';
import CreateAlertPage from './pages/alerts/CreateAlertPage';
import MapPage from './pages/map/MapPage';
import ProfilePage from './pages/profile/ProfilePage';
import BorrowPage from './pages/borrow/BorrowPage';
import BorrowRequestPage from './pages/borrow/BorrowRequestPage';
import UsersPage from './pages/users/UsersPage';
import CreateUserPage from './pages/users/CreateUserPage';
import TrackingPage from './pages/tracking/TrackingPage';
import CreateTransferPage from './pages/tracking/CreateTransferPage';
import MobileTrackingPage from './pages/tracking/MobileTrackingPage';
import NotFoundPage from './pages/NotFoundPage';
import NearbyAgenciesPage from './pages/agency/NearbyAgenciesPage';
import AllAgenciesInventoryPage from './pages/inventory/AllAgenciesInventoryPage';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col ">
      <Navbar />
      <main className="flex-1 pt-20">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/new"
            element={
              <ProtectedRoute>
                <NewInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/:id"
            element={
              <ProtectedRoute>
                <InventoryItemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/all-agencies"
            element={
              <ProtectedRoute>
                <AllAgenciesInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agencies"
            element={
              <ProtectedRoute>
                <AgenciesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agencies/:id"
            element={
              <ProtectedRoute>
                <AgencyProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agencies/nearby"
            element={
              <ProtectedRoute>
                <NearbyAgenciesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:agencyId"
            element={
              <ProtectedRoute>
                <ConversationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AlertsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts/new"
            element={
              <ProtectedRoute>
                <CreateAlertPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrow"
            element={
              <ProtectedRoute>
                <BorrowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrow/:id"
            element={
              <ProtectedRoute>
                <BorrowRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              user && (user.role === 'admin' || user.role === 'manager')
                ? <CreateUserPage />
                : <Navigate to="/dashboard" />
            }
          /> <Route
          path="/tracking"
          element={
            <ProtectedRoute>
              <TrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracking/new"
          element={
            <ProtectedRoute requiredRole="manager">
              <CreateTransferPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracking/mobile/:transferId"
          element={
            <ProtectedRoute>
              <MobileTrackingPage />
            </ProtectedRoute>
          }
        />
          
          {/* Catch-all route */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </main>
      <footer className="bg-gray-100 py-4 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ResQ Bubble. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AppRoutes; 