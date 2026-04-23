import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ContractList from './pages/ContractList';
import ContractDetail from './pages/ContractDetail';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Logs from './pages/Logs';
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
    const prefix = category.prefix;
    
    // 特殊规则：如果是“立项编号”，采用 YYYY+PREFIX+NNN (例如 2026GA001)
    if (categoryName.includes('立项编号')) {
      const year = new Date().getFullYear().toString(); // "2026"
      const regex = new RegExp(`^${year}${prefix}(\\d{3})$`);
      
      let maxSeq = 0;
      contracts.forEach(c => {
        const match = c.number.match(regex);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) maxSeq = seq;
        }
      });
      const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
      return `${year}${prefix}${nextSeq}`;
    } 
    
    // 默认规则：PREFIX-YYNNN (例如 GJSCKJ-26001)
    else {
      const year = new Date().getFullYear().toString().slice(-2); // "26"
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
    }
  };

  useEffect(() => {
    // Restore session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = session.user;
        const isAdmin = user.email === 'ma.yangyue@star.vision';
        setCurrentUser({
          id: user.id,
          email: user.email,
          name: user.email.split('@')[0],
          role: isAdmin ? 'admin' : 'employee',
          avatar: user.email.charAt(0).toUpperCase()
        });
        setIsAuthenticated(true);
      }
    });

    // Listen for auth state changes (e.g., login from another tab, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = session.user;
        const isAdmin = user.email === 'ma.yangyue@star.vision';
        setCurrentUser({
          id: user.id,
          email: user.email,
          name: user.email.split('@')[0],
          role: isAdmin ? 'admin' : 'employee',
          avatar: user.email.charAt(0).toUpperCase()
        });
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContracts();
      fetchCategories();
    }
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      if (data.length === 0) {
        // Auto-seed initial categories if table is empty
        const defaultsToInsert = INITIAL_CATEGORIES.map(c => ({ name: c.name, prefix: c.prefix }));
        const { data: insertedData, error: insertError } = await supabase.from('categories').insert(defaultsToInsert).select();
        if (!insertError && insertedData) {
          setCategories(insertedData);
        }
      } else {
        setCategories(data);
      }
    }
  };

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

  const logAction = async (contractNumber, action) => {
    await supabase.from('audit_logs').insert([{
      contract_number: contractNumber,
      action: action,
      user_email: currentUser.email
    }]);
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
      const archivedContract = contracts.find(c => c.id === id);
      if (archivedContract) {
        logAction(archivedContract.number, 'Archived Contract');
      }
    } else {
      alert('Failed to archive contract in database.');
    }
  };

  const handleImportContracts = async (importedData) => {
    // Sanitize imported numbers (remove trailing spaces)
    const sanitizedData = importedData.map(c => ({
      ...c,
      number: c.number ? String(c.number).trim() : c.number
    }));

    // Identify existing contracts to update vs insert
    const importedNumbers = sanitizedData.map(c => c.number);
    const { data: existingContracts } = await supabase
      .from('contracts')
      .select('id, number, ownerId')
      .in('number', importedNumbers);

    const existingMap = new Map((existingContracts || []).map(c => [c.number, c]));

    const toUpdate = [];
    const toInsert = [];

    sanitizedData.forEach(c => {
      const { id, ...rest } = c; // remove client-side generated ID
      const existing = existingMap.get(rest.number);
      if (existing) {
        // Update existing, PRESERVING the original ownerId so the original owner doesn't lose access
        toUpdate.push({ ...rest, id: existing.id, ownerId: existing.ownerId });
      } else {
        // Insert new, assigning ownership to current user
        toInsert.push({ ...rest, ownerId: currentUser.id });
      }
    });

    let hasError = false;

    // Perform updates
    if (toUpdate.length > 0) {
      const { error: updateError } = await supabase.from('contracts').upsert(toUpdate);
      if (updateError) {
        console.error('Failed to update existing contracts:', updateError);
        hasError = true;
      }
    }

    // Perform inserts
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from('contracts').insert(toInsert);
      if (insertError) {
        console.error('Failed to insert new contracts:', insertError);
        hasError = true;
      }
    }

    if (hasError) {
      alert('Some contracts failed to import/update. Please check the console.');
    } else {
      fetchContracts(); // Refresh to accurately reflect state
      logAction(`Batch Import (${sanitizedData.length})`, 'Imported/Updated Contracts');
    }
  };

  const handleAddContract = async (newContract) => {
    const { id, ...rest } = newContract; // remove client-side generated ID
    const contractWithOwner = { ...rest, ownerId: currentUser.id };
    const { data, error } = await supabase.from('contracts').insert([contractWithOwner]).select();
    if (!error && data && data.length > 0) {
      setContracts(prev => [data[0], ...prev]);
      logAction(data[0].number, 'Created Contract');
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
      logAction(updatedContract.number, 'Updated Contract');
    } else {
      console.error(error);
      alert('Failed to update contract in database.');
    }
  };

  const handleDeleteContract = async (id) => {
    const contractToDelete = contracts.find(c => c.id === id);
    if (!contractToDelete) return;
    
    if (window.confirm(`Are you sure you want to delete contract ${contractToDelete.number}? This cannot be undone.`)) {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);
        
      if (!error) {
        setContracts(prev => prev.filter(c => c.id !== id));
        logAction(contractToDelete.number, 'Deleted Contract');
      } else {
        console.error(error);
        alert('Failed to delete contract.');
      }
    }
  };

  const toggleUser = () => {
    setCurrentUser(prev => prev.role === 'admin' ? MOCK_USER_EMPLOYEE : MOCK_USER_ADMIN);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
                onDelete={handleDeleteContract}
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
            <Route 
              path="/logs" 
              element={
                currentUser.role === 'admin' ? (
                  <Logs />
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
