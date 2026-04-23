import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ContractList from './pages/ContractList';
import ContractDetail from './pages/ContractDetail';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ImportModal from './components/ImportModal';
import CreateContractModal from './components/CreateContractModal';
import ExportModal from './components/ExportModal';
import { MOCK_USER_ADMIN, MOCK_USER_EMPLOYEE, INITIAL_CATEGORIES } from './data';
import { Shield } from 'lucide-react';
import { supabase } from './supabaseClient';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const generateContractNumber = (categoryName) => {
    const category = categories.find(c => c.name === categoryName) || categories[0];
    const year = new Date().getFullYear().toString().slice(-2); // e.g. "26"
    
    // Find highest sequence for this prefix and year
    const prefix = category.prefix;
    const regex = new RegExp(`^${prefix}-${year}(\\d{3})$`);
    
    let maxSeq = 0;
    contracts.forEach(c => {
      const match = c.number.match(regex);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    });

    const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
    return `${prefix}-${year}${nextSeq}`;
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContracts();
    }
  }, [isAuthenticated]);

  const fetchContracts = async () => {
    setLoadingContracts(true);
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching contracts:', error);
    } else {
      setContracts(data || []);
    }
    setLoadingContracts(false);
  };

  const handleArchiveContract = async (id) => {
    const { error } = await supabase
      .from('contracts')
      .update({ status: 'archived' })
      .eq('id', id);
    if (!error) {
      setContracts(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'archived' } : c
      ));
    } else {
      alert('Failed to archive contract in database.');
    }
  };

  const handleImportContracts = async (importedData) => {
    const dataWithOwner = importedData.map(c => {
      const { id, ...rest } = c; // remove client-side generated ID
      return { ...rest, ownerId: currentUser.id };
    });
    const { data, error } = await supabase.from('contracts').insert(dataWithOwner).select();
    if (!error && data) {
      setContracts(prev => [...data, ...prev]);
    } else {
      console.error(error);
      alert('Failed to import contracts to database.');
    }
  };

  const handleAddContract = async (newContract) => {
    const { id, ...rest } = newContract; // remove client-side generated ID
    const contractWithOwner = { ...rest, ownerId: currentUser.id };
    const { data, error } = await supabase.from('contracts').insert([contractWithOwner]).select();
    if (!error && data && data.length > 0) {
      setContracts(prev => [data[0], ...prev]);
    } else {
      console.error(error);
      alert('Failed to save contract to database.');
    }
  };

  const handleUpdateContract = async (updatedContract) => {
    const { id, created_at, ...updateData } = updatedContract;
    const { error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', id);
    if (!error) {
      setContracts(prev => prev.map(c => 
        c.id === id ? updatedContract : c
      ));
    } else {
      console.error(error);
      alert('Failed to update contract in database.');
    }
  };

  const toggleUser = () => {
    setCurrentUser(prev => prev.role === 'admin' ? MOCK_USER_EMPLOYEE : MOCK_USER_ADMIN);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const visibleContracts = currentUser.role === 'admin' 
    ? contracts 
    : contracts.filter(c => c.ownerId === currentUser.id);

  return (
    <Router>
      <div className="app-container fade-in">
        <Sidebar user={currentUser} onChangeRole={toggleUser} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard contracts={visibleContracts} />} />
            <Route 
              path="/contracts" 
              element={<ContractList 
                contracts={visibleContracts}
                categories={categories}
                user={currentUser}
                onOpenImport={() => setIsImportModalOpen(true)} 
                onOpenCreate={() => setIsCreateModalOpen(true)} 
                onOpenExport={() => setIsExportModalOpen(true)}
              />} 
            />
            <Route 
              path="/contracts/:id" 
              element={
                <ContractDetail 
                  contracts={contracts} 
                  user={currentUser} 
                  categories={categories}
                  onArchive={handleArchiveContract} 
                  onUpdate={handleUpdateContract}
                />
              } 
            />
            <Route 
              path="/settings" 
              element={
                currentUser.role === 'admin' ? (
                  <Settings categories={categories} setCategories={setCategories} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </main>

        <ImportModal 
          isOpen={isImportModalOpen} 
          onClose={() => setIsImportModalOpen(false)} 
          onImport={handleImportContracts} 
          categories={categories}
        />

        <CreateContractModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreate={handleAddContract} 
          categories={categories}
          generateContractNumber={generateContractNumber}
        />

        <ExportModal 
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          contracts={contracts}
        />

        <div className="role-selector">
          <div className="role-selector-title">Test Demo Panel</div>
          <div style={{ fontSize: '12px', color: 'var(--apple-text-secondary)', marginBottom: '8px' }}>
            Click the user profile in the sidebar to toggle roles.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span style={{ fontWeight: currentUser.role === 'admin' ? 600 : 400 }}>Admin</span>
            <div style={{ width: '32px', height: '16px', background: 'var(--apple-accent)', borderRadius: '16px', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                width: '12px', height: '12px', 
                background: 'white', 
                borderRadius: '50%', 
                top: '2px', 
                left: currentUser.role === 'employee' ? '18px' : '2px',
                transition: 'all 0.3s ease'
              }}></div>
            </div>
            <span style={{ fontWeight: currentUser.role === 'employee' ? 600 : 400 }}>Employee</span>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
