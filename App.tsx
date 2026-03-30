
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RecordList from './components/RecordList';
import RecordDetails from './components/RecordDetails';
import UploadModal from './components/UploadModal';
import AIAssistant from './components/AIAssistant';
import MedicationManager from './components/MedicationManager';
import ProfileView from './components/ProfileView';
import HealthInsights from './components/HealthInsights';
import BodyMap from './components/BodyMap';
import LabComparison from './components/LabComparison';
import HealthJourney from './components/HealthJourney';
import DoctorSummary from './components/DoctorSummary';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import { MedicalRecord, AppView, User, UserProfile, Medication } from './types';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { Menu, Plus, HeartPulse } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [previousView, setPreviousView] = useState<AppView>(AppView.DASHBOARD);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSharedMode, setIsSharedMode] = useState(false);

  const handleSharedRecord = async (shareId: string) => {
      // Simulate loading the shared record
      const record = await storageService.getRecordById(shareId);
      if (record) {
         setSelectedRecord(record);
         setView(AppView.DETAILS);
         setIsAuthenticated(true); // Treat as authenticated guest
         setIsSharedMode(true);
         setShowLanding(false);
      } else {
         // If record not found locally (e.g. cross-device simulation without backend)
         alert("Record not found locally. Ensure you are scanning on the same device used for simulation.");
         setShowLanding(true);
      }
  };

  const loadRecords = async (userId: string) => {
    const loadedRecords = await storageService.getRecords(userId);
    setRecords(loadedRecords);
  };

  // Check auth status and handle shared links on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('shareId');

    if (shareId) {
       setTimeout(() => handleSharedRecord(shareId), 0);
       return;
    }

    const user = authService.getCurrentUser();
    if (user) {
      setTimeout(() => {
        setIsAuthenticated(true);
        setCurrentUser(user);
        setShowLanding(false);
        loadRecords(user.id);
        
        const savedProfile = localStorage.getItem('healthvault_profile');
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        } else {
          // Default profile for demo
          const defaultProfile: UserProfile = {
            name: user.name,
            email: user.email,
            phone: '+1 (555) 000-0000',
            address: '123 Health St, Wellness City',
            dob: '1990-01-01',
            bloodGroup: 'O+',
            weight: '75kg',
            allergies: ['Penicillin'],
            emergencyContacts: [
              { name: 'Jane Doe', relation: 'Wife', phone: '+1 (555) 111-2222', type: 'Primary' }
            ]
          };
          setProfile(defaultProfile);
          localStorage.setItem('healthvault_profile', JSON.stringify(defaultProfile));
        }
      }, 0);
    }
  }, []);

  const medications = useMemo(() => {
    const meds: Medication[] = [];
    records.forEach(r => {
      if (r.medications) {
        r.medications.forEach(m => {
          if (!meds.find(existing => existing.name === m.name)) {
            meds.push(m);
          }
        });
      }
    });
    return meds;
  }, [records]);

  const handleLogin = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      setView(AppView.DASHBOARD);
      setShowLanding(false);
      loadRecords(user.id);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowLanding(true); 
    setView(AppView.DASHBOARD);
    setRecords([]); // Clear records on logout
    setIsSharedMode(false);
    // Clear URL params if logout from shared mode
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleUploadComplete = async (newRecord: MedicalRecord) => {
    if (currentUser) {
       await storageService.saveRecord(newRecord, currentUser.id);
       await loadRecords(currentUser.id); // Reload from source
       
       // Close modal and go to details
       setView(AppView.DETAILS);
       setSelectedRecord(newRecord);
    }
  };

  const handleViewChange = (newView: AppView) => {
    if (newView === AppView.UPLOAD) {
      setPreviousView(view === AppView.UPLOAD ? AppView.DASHBOARD : view);
      setView(AppView.UPLOAD);
    } else {
      setView(newView);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSelectRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setView(AppView.DETAILS);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    // In real app, call delete API here
    setView(AppView.RECORDS);
    setSelectedRecord(null);
  };

  const handleBack = () => {
    if (isSharedMode) {
        // If in shared mode, back acts as logout/return to home
        handleLogout();
    } else {
        setView(AppView.RECORDS);
        setSelectedRecord(null);
    }
  };

  const closeModal = () => {
    setView(previousView);
  };

  // Render Landing Page logic
  if (showLanding && !isAuthenticated) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Render Login Page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen text-slate-50 font-sans overflow-hidden">
      {/* Mobile Header */}
      {!isSharedMode && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-card border-b border-white/10 z-30 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white p-1.5 rounded-lg shadow-lg">
                <HeartPulse className="w-5 h-5" />
            </div>
            HealthVault
            </div>
            <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white/80 hover:bg-white/10 rounded-lg">
                <Menu className="w-6 h-6" />
            </button>
            </div>
        </div>
      )}

      {/* Sidebar - Hide in shared mode */}
      {!isSharedMode && (
        <div className={`
            fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto
            ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}>
            <Sidebar 
            currentView={view} 
            onChangeView={handleViewChange} 
            onLogout={handleLogout} 
            user={currentUser}
            />
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full pt-16 md:pt-0 relative scroll-smooth">
        
        {/* Shared Mode Banner */}
        {isSharedMode && (
            <div className="sticky top-0 z-20 bg-blue-600/90 backdrop-blur-md px-6 py-3 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-white" />
                    <span className="font-bold text-white">HealthVault Guest View</span>
                </div>
                <button 
                    onClick={handleLogout} 
                    className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Exit View
                </button>
            </div>
        )}

        <div className="max-w-6xl mx-auto p-4 md:p-10 min-h-full">
          {view === AppView.DASHBOARD && !isSharedMode && (
            <Dashboard records={records} onChangeView={handleViewChange} />
          )}
          
          {view === AppView.RECORDS && !isSharedMode && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Medical Records</h2>
                  <p className="text-blue-200 mt-1">Manage your history and extracted reports</p>
                </div>
                <button 
                  onClick={() => handleViewChange(AppView.UPLOAD)}
                  className="glass-button px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(79,172,254,0.5)] transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Add New Record
                </button>
              </div>
              <RecordList records={records} onSelectRecord={handleSelectRecord} />
            </div>
          )}

          {view === AppView.ASSISTANT && !isSharedMode && (
             <AIAssistant records={records} />
          )}

          {view === AppView.MEDICATIONS && !isSharedMode && (
             <MedicationManager records={records} />
          )}

          {view === AppView.INSIGHTS && !isSharedMode && (
             <HealthInsights records={records} onBack={() => setView(AppView.DASHBOARD)} />
          )}

          {view === AppView.PROFILE && !isSharedMode && (
             <ProfileView onLogout={handleLogout} />
          )}

          {view === AppView.BODY_MAP && !isSharedMode && (
             <BodyMap records={records} onBack={() => setView(AppView.DASHBOARD)} onViewRecord={handleSelectRecord} />
          )}

          {view === AppView.LAB_COMPARISON && !isSharedMode && (
             <LabComparison records={records} onBack={() => setView(AppView.DASHBOARD)} />
          )}

          {view === AppView.HEALTH_JOURNEY && !isSharedMode && (
             <HealthJourney records={records} medications={medications} onBack={() => setView(AppView.DASHBOARD)} onViewRecord={handleSelectRecord} />
          )}

          {view === AppView.DOCTOR_SUMMARY && !isSharedMode && profile && (
             <DoctorSummary profile={profile} records={records} medications={medications} onBack={() => setView(AppView.DASHBOARD)} />
          )}

          {view === AppView.DETAILS && selectedRecord && (
            <RecordDetails 
              record={selectedRecord} 
              onBack={handleBack} 
              onDelete={handleDeleteRecord} 
              onViewMedications={() => handleViewChange(AppView.MEDICATIONS)}
              readOnly={isSharedMode}
            />
          )}

          {/* If we are in DETAILS but no record is selected (edge case), go back to records */}
          {view === AppView.DETAILS && !selectedRecord && (
            <div className="flex flex-col items-center justify-center h-full text-blue-200">
               <p className="mb-4">No record selected.</p>
               <button onClick={() => setView(AppView.RECORDS)} className="text-white font-semibold hover:underline">Return to Records</button>
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal Overlay */}
      {view === AppView.UPLOAD && (
        <UploadModal 
          onClose={closeModal} 
          onUploadComplete={handleUploadComplete} 
        />
      )}
    </div>
  );
};

export default App;
