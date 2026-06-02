"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useState, useMemo } from 'react';
import { GraduationCap, Mail, User, Building2, MapPin, Briefcase, ShieldCheck, Fingerprint } from 'lucide-react';

export default function LecturerSignup() {
  const router = useRouter();
  const signup = useStore(state => state.signup);
  const structure = useStore(state => state.getAcademicStructure());
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [accessPIN, setAccessPIN] = useState('');
  const [pinError, setPinError] = useState('');

  const [form, setForm] = useState({
    name: '', 
    email: '', 
    staffId: '',
    college: '', 
    department: '', 
    title: 'Dr.', 
    office: '', 
    phone: ''
  });

  const checkPIN = (e) => {
    e.preventDefault();
    if (accessPIN === 'STAFF2026') {
      setIsVerified(true);
      setPinError('');
    } else {
      setPinError('Invalid Institutional Access PIN. Please contact IT Administration.');
    }
  };

  const selectedCollege = useMemo(() => 
    structure.colleges.find(c => c.name === form.college), 
    [form.college, structure]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.college || !form.department) {
      alert("Please select your college and department.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = signup({ ...form, role: 'lecturer' });
      if (result.success) {
        router.push('/lecturer');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="lecturer-signup-wrapper animate-fade-in">
      <div className="signup-card glass-panel">
        <div className="card-header">
          <div className="header-icon"><GraduationCap size={32} /></div>
          <h2>Faculty Onboarding</h2>
          <p>Initialize your academic portal status.</p>
        </div>

        {!isVerified ? (
          <div className="pin-verification">
            <div className="lock-icon"><ShieldCheck size={40} /></div>
            <h3>Faculty Access Verification</h3>
            <p>To prevent unauthorized access, please enter the **Institutional Security PIN** provided to you by the HR or IT Department.</p>
            
            <form onSubmit={checkPIN} className="pin-form">
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Enter 9-digit Staff PIN" 
                  value={accessPIN} 
                  onChange={e => setAccessPIN(e.target.value)}
                  className={pinError ? 'error-ring' : ''}
                />
                {pinError && <span className="err-msg">{pinError}</span>}
              </div>
              <button type="submit" className="btn btn-primary full-width">Verify Staff Identity</button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="onboarding-form">
            <div className="form-section-title">Personal Credentials</div>
            <div className="form-row">
              <div className="form-group title-select">
                <label>Title</label>
                <select value={form.title} onChange={e => setForm({...form, title: e.target.value})}>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                </select>
              </div>
              <div className="form-group flex-1">
                <label><User size={14} /> Full Name (Surname Last)</label>
                <input type="text" placeholder="Sarah Jenkins" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label><Fingerprint size={14} /> Lecturer ID / Staff ID</label>
                <input type="text" placeholder="LEC/2024/102" value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})} required />
              </div>
              <div className="form-group flex-1">
                <label><Mail size={14} /> Official Email</label>
                <input type="email" placeholder="lecturer@uni.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
            </div>

            <div className="form-section-title">Institutional Placement</div>
            <div className="form-group">
              <label><Building2 size={14} /> College / Faculty</label>
              <select value={form.college} onChange={e => setForm({...form, college: e.target.value, department: ''})} required>
                <option value="">Select College</option>
                {structure.colleges.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label><Building2 size={14} /> Department</label>
                <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} disabled={!form.college} required>
                  <option value="">Select Dept</option>
                  {selectedCollege?.departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group flex-1">
                <label><MapPin size={14} /> Office</label>
                <input type="text" placeholder="Block B, 402" value={form.office} onChange={e => setForm({...form, office: e.target.value})} />
              </div>
            </div>

            <div className="password-hint">
               * Note: The default password for this portal will be set to the <strong>SURNAME</strong> (lowercase).
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? "Verifying..." : "Initialize Faculty Access"}
            </button>
          </form>
        )}

        <div className="card-footer">
          <p>Registering as a student? <Link href="/signup">Click here</Link></p>
          <Link href="/login" className="login-link">Already have an account? Sign In</Link>
        </div>
      </div>

      <style jsx>{`
        .lecturer-signup-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 3rem 1rem; background: #f8fafc; }
        :global([data-theme='dark']) .lecturer-signup-wrapper { background: #0f172a; }
        .signup-card { width: 100%; max-width: 600px; padding: 3rem; }
        .card-header { text-align: center; margin-bottom: 2.5rem; }
        .header-icon { width: 64px; height: 64px; background: var(--primary); color: white; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .card-header h2 { font-size: 2rem; margin-bottom: 0.5rem; }
        .card-header p { color: var(--text-muted); font-size: 0.95rem; }

        .onboarding-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .form-section-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; color: var(--primary); margin-top: 0.5rem; }
        .form-row { display: flex; gap: 1rem; }
        .flex-1 { flex: 1; }
        .title-select { width: 120px; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label { font-size: 0.82rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.4rem; }
        .form-group input, .form-group select { padding: 0.85rem 1rem; border-radius: 12px; border: 1px solid var(--card-border); background: rgba(255, 255, 255, 0.7); font-family: inherit; font-size: 0.95rem; }
        [data-theme='dark'] .form-group input, [data-theme='dark'] .form-group select { background: rgba(17, 24, 39, 0.5); }
        .password-hint { font-size: 0.75rem; color: var(--text-muted); padding: 0.75rem; background: rgba(0,0,0,0.03); border-radius: 8px; border-left: 3px solid var(--primary); }
        .submit-btn { margin-top: 1rem; padding: 1rem; font-size: 1.05rem; }

        .pin-verification { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding: 1rem 0; }
        .lock-icon { color: var(--primary); opacity: 0.8; }
        .pin-verification h3 { font-size: 1.4rem; color: var(--text-main); }
        .pin-verification p { font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; }
        .pin-form { width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 1rem; }
        .pin-form input { text-align: center; letter-spacing: 4px; font-weight: 800; font-size: 1.25rem; }
        .error-ring { border-color: var(--danger) !important; }
        .err-msg { font-size: 0.75rem; color: var(--danger); font-weight: 600; margin-top: 0.3rem; }
        .card-footer { margin-top: 2.5rem; text-align: center; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem; }
        .card-footer a { color: var(--primary); font-weight: 600; }
        @media (max-width: 600px) { .form-row { flex-direction: column; } .title-select { width: 100%; } }
      `}</style>
    </div>
  );
}
