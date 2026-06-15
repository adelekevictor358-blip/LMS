import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { semesterFromCode, nextSession } from '@/lib/utils';

const ACADEMIC_STRUCTURE = {
  colleges: [
    { 
      name: 'COLLEGE OF BASIC AND APPLIED SCIENCES (CBAS)', 
      programs: [
        'B.Sc. Biochemistry', 'B.Sc. Biology', 'B.Sc. Biotechnology', 'B.Sc. Chemistry', 
        'B.Sc. Computer Science', 'B.Sc. Cyber Security', 'B.Sc. Food Science and Technology', 
        'B.Sc. Geology', 'B.Sc. Applied Geophysics', 'B.Sc. Industrial Chemistry', 
        'B.Sc. Mathematics', 'B.Sc. Microbiology', 'B.Sc. Physics', 
        'B.Sc. Physics with Electronics', 'B.Sc. Software Engineering'
      ]
    },
    { 
      name: 'COLLEGE OF HUMANITIES AND MANAGEMENT SCIENCES (CHMS)', 
      programs: [
        'B.Sc. Accounting', 'B.Sc. Business Administration', 'B.Sc. Economics', 
        'B.A. English Language', 'B.A. Fine and Applied Arts', 'B.Sc. Finance', 
        'B.Sc. Industrial Relations and Personnel Management', 'B.Sc. Mass Communication', 
        'B.A. Music', 'B.A. Philosophy', 'B.Sc. Public Administration', 
        'B.A. Religious Studies', 'B.Sc. Security and Investment'
      ]
    },
    { 
      name: 'COLLEGE OF HEALTH AND ALLIED SCIENCES (CHAS)', 
      programs: [
        'B.N.Sc. Nursing Science', 'B.MLS. Medical Laboratory Science', 
        'B.Sc. Public Health', 'B.Sc. Nutrition and Dietetics', 'B.Sc. Biomedical Technology'
      ]
    }
  ]
};

const MOCK_DB = {
  users: [
    { id: 'admin-1', email: 'admin@mtu.edu.ng', password: 'admin', role: 'admin', name: 'IT Administration', avatar: 'IA', status: 'active' },
    { id: 'LEC/2024/001', email: 'prof.anderson@mtu.edu.ng', password: 'anderson', role: 'lecturer', name: 'Prof. James Anderson', avatar: 'JA', college: 'COLLEGE OF BASIC AND APPLIED SCIENCE (CBAS)', department: 'Computer Science', staffId: 'LEC/2024/001', status: 'active' },
  ]
};

// Monotonic counter so ids minted within the same millisecond never collide
// (Date.now() alone can repeat across rapid successive calls).
let _idCounter = 0;
const nextId = () => `${Date.now()}-${(_idCounter = (_idCounter + 1) % 1000000)}`;

// Fisher–Yates shuffle that returns a NEW array (never mutates the input).
const shuffleArray = (arr = []) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

let bc;
if (typeof window !== 'undefined') {
  bc = new BroadcastChannel('lms_notifications');
  bc.onmessage = (event) => {
    const { type, payload } = event.data;
    if (type === 'NEW_ALERT') {
      const newNotif = { id: Date.now(), text: payload.text, time: 'Just now', read: false, isUrgent: payload.isUrgent };
      const store = useStore.getState();
      store.receiveBroadcast(newNotif);
    }
  };
}

export const useStore = create(
  persist(
    (set, get) => {
      return {
        user: null,
        dynamicUsers: [],
        excludedIds: [],
        notes: [], // personal notepad entries (per-user, see NOTEPAD ACTIONS)
        liveSessions: [],
        scheduledSessions: [], // Future engagements
        currentSession: '2025/2026',
        currentSemester: '1st',
        semesterOpen: true, // is the current semester open for registration?
        sessionHistory: [],
        auditingUser: null,
        _hasHydrated: false,
        setHasHydrated: (val) => set({ _hasHydrated: val }),

        // ─── FACULTY PORTAL GATE ───
        lecturerPortalActive: true,
        toggleLecturerPortal: () =>
          set((state) => ({ lecturerPortalActive: !state.lecturerPortalActive })),

        // ─── LECTURER COURSE REGISTRATION ───
        // Window set by admin; registrations keyed by lecturerId;
        // overrides allow individual re-opens after deadline.
        lecturerCourseRegWindow: {
          open: false,           // is the window currently open?
          startDate: null,       // ISO string
          endDate: null,         // ISO string (deadline)
          semester: null,        // '1st' | '2nd'
          session: null,         // e.g. '2025/2026'
        },
        // { [lecturerId]: { courseIds: number[], submittedAt: ISO|null } }
        lecturerCourseRegistrations: {},
        // Set of lecturerId strings that have been individually re-opened by admin
        lecturerRegOverrides: [],

        login: async (email, password) => {
          const allUsers = get().getAllUsers();
          const foundUser = allUsers.find(u => u.email === email && u.password === password);
          if (foundUser) {
            if (foundUser.status && foundUser.status !== 'active') {
              return { success: false, error: 'Your account is currently dormant/suspended. Please contact IT admin.' };
            }
            
            // --- SECURITY ALERT DISPATCH ---
            let deviceType = "Unknown Device";
            let browser = "Web Browser";
            let location = "Lagos, Nigeria (Approx.)";
            
            if (typeof window !== 'undefined') {
              const ua = navigator.userAgent;
              if (ua.includes("Windows")) deviceType = "Windows PC";
              else if (ua.includes("Mac OS")) deviceType = "MacBook / iMac";
              else if (ua.includes("Linux")) deviceType = "Linux Machine";
              else if (ua.includes("Android")) deviceType = "Android Device";
              else if (ua.includes("iPhone") || ua.includes("iPad")) deviceType = "Apple iOS Device";
              
              if (ua.includes("Chrome")) browser = "Google Chrome";
              else if (ua.includes("Firefox")) browser = "Mozilla Firefox";
              else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Apple Safari";
              else if (ua.includes("Edge")) browser = "Microsoft Edge";
            }

            // Dispatch to real email API
            if (typeof window !== 'undefined') {
              fetch('/api/login-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: foundUser.email,
                  name: foundUser.name,
                  deviceType,
                  browser,
                  location,
                  time: new Date().toLocaleString()
                })
              }).then(res => res.json()).then(data => {
                if(data.previewUrl) {
                  console.log("Email Sent! Preview it here:", data.previewUrl);
                }
              }).catch(err => console.error("Failed to send security email:", err));
            }

            set(state => ({ 
              user: { ...foundUser }
            }));
            // ----------------------------------

            return { success: true, role: foundUser.role };
          }
          return { success: false, error: 'Invalid email or password.' };
        },

        signup: (userData) => {
          const allUsers = get().getAllUsers();
          const targetId = (userData.role === 'student' ? userData.matNo : userData.staffId);
          
          // Role-scoped uniqueness check:
          // • Students only conflict with other students in the same program on the same matNo
          // • Lecturers/staff only conflict with other non-student users on the same staffId
          const isDuplicate = allUsers.some(u => {
            if (userData.role === 'student') {
              // Student: matNo must be unique within the same program only
              return u.role === 'student' && u.matNo === targetId && u.program === userData.program;
            } else {
              // Lecturer/staff: staffId must be unique among non-student users only
              const uStaffId = u.staffId || (u.role !== 'student' ? u.id : null);
              return u.role !== 'student' && uStaffId === targetId;
            }
          });

          if (isDuplicate) {
            return { 
              success: false, 
              error: userData.role === 'student'
                ? `Matric number ${targetId} is already registered in the ${userData.program} department.`
                : `Staff ID ${targetId} is already registered in the system.`
            };
          }

          const surname = userData.name.trim().split(' ').pop().toLowerCase();
          // Composite ID ensures no key clashes in the JS Map/Store even if matNo is identical across depts
          const storedId = userData.role === 'student'
            ? `${targetId}_${(userData.program || 'GEN').replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase()}`
            : targetId;

          const newUser = {
            ...userData,
            id: storedId || (userData.role + '-' + Date.now()),
            matNo: targetId,
            password: surname,
            avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            status: 'active'
          };

          set(state => ({
            dynamicUsers: [...state.dynamicUsers, newUser],
            user: newUser
          }));
          return { success: true, role: newUser.role };
        },

        changePassword: (userId, newPassword) => {
          set((state) => ({
            dynamicUsers: state.dynamicUsers.map(u => 
              u.id === userId ? { ...u, password: newPassword } : u
            ),
            user: state.user?.id === userId ? { ...state.user, password: newPassword } : state.user
          }));
          return { success: true };
        },

        logout: () => set({ user: null, auditingUser: null, adminViewAs: null }),

        setAuditingUser: (user) => {
          set({ auditingUser: user });
        },

        getAllUsers: () => {
          const { dynamicUsers, excludedIds } = get();
          const dynamic = dynamicUsers.filter(u => !excludedIds.includes(u.id));
          const mock = MOCK_DB.users.filter(mu => 
            !dynamic.some(du => du.id === mu.id) && 
            !excludedIds.includes(mu.id)
          );
          return [...mock, ...dynamic];
        },

        courses: [
          // 100L - FIRST SEMESTER (MATHEMATICS)
          { id: 101, title: 'Introduction to Computer Science', code: 'CSC 101', color: '#10b981', units: 3, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 102, title: 'Communication in English I', code: 'GST 111', color: '#3b82f6', units: 2, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 103, title: 'Elementary Mathematics II', code: 'MTH 101', color: '#2563eb', units: 2, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 104, title: 'Elementary Mathematics III', code: 'MTH 103', color: '#1d4ed8', units: 2, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 105, title: 'General Chemistry I', code: 'MTU-CHM 101', color: '#f59e0b', units: 2, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 106, title: 'Every Student A Musician I', code: 'MTU-ESM 101', color: '#ef4444', units: 1, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 107, title: 'Web Programming I', code: 'MTU-ICT 101', color: '#06b6d4', units: 0, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 108, title: 'History of Mathematics', code: 'MTU-MTH 105', color: '#8b5cf6', units: 1, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 109, title: 'General Physics I', code: 'MTU-PHY 101', color: '#6366f1', units: 2, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 110, title: 'General Physics III', code: 'MTU-PHY 103', color: '#4f46e5', units: 2, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 111, title: 'Practical Physics I', code: 'MTU-PHY 107', color: '#4338ca', units: 1, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 112, title: 'French I', code: 'MTU-PIF 101', color: '#ec4899', units: 1, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 113, title: 'Success Dynamics I', code: 'MTU-SDN 101', color: '#10b981', units: 1, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 114, title: 'Descriptive Statistics', code: 'MTU-STA 111', color: '#14b8a6', units: 2, level: '100L', semester: '1st', program: 'B.Sc. Mathematics' },

          // 100L - SECOND SEMESTER (MATHEMATICS)
          { id: 115, title: 'Nigerian Peoples and Cultures', code: 'GST 112', color: '#3b82f6', units: 2, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 116, title: 'Elementary Mathematics II', code: 'MTH 102', color: '#2563eb', units: 3, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 117, title: 'General Chemistry II', code: 'MTU-CHM 102', color: '#f59e0b', units: 2, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 118, title: 'Chemistry Practical II', code: 'MTU-CHM 108', color: '#d97706', units: 1, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 119, title: 'Problem Solving', code: 'MTU-COS 102', color: '#10b981', units: 2, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 120, title: 'Music II', code: 'MTU-ESM 102', color: '#ef4444', units: 1, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 121, title: 'Web Programming II', code: 'MTU-ICT 102', color: '#06b6d4', units: 0, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 122, title: 'Problem Solving in Mathematics', code: 'MTU-MTH 104', color: '#8b5cf6', units: 2, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 123, title: 'General Physics II', code: 'MTU-PHY 102', color: '#6366f1', units: 2, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 124, title: 'Physics IV', code: 'MTU-PHY 104', color: '#4f46e5', units: 2, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 125, title: 'Practical Physics II', code: 'MTU-PHY 108', color: '#4338ca', units: 1, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 126, title: 'French II', code: 'MTU-PIF 102', color: '#ec4899', units: 1, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 127, title: 'Success Dynamics II', code: 'MTU-SDN 102', color: '#10b981', units: 1, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 128, title: 'Probability I', code: 'STA 112', color: '#14b8a6', units: 3, level: '100L', semester: '2nd', program: 'B.Sc. Mathematics' },
          
          // 200L - FIRST SEMESTER (MATHEMATICS)
          { id: 201, title: 'Programming I', code: 'COS 201', color: '#10b981', units: 2, level: '200L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 202, title: 'Entrepreneurship I', code: 'ENT 211', color: '#f59e0b', units: 1, level: '200L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 203, title: 'Linear Algebra I', code: 'MTH 205', color: '#3b82f6', units: 2, level: '200L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 204, title: 'Real Analysis I', code: 'MTH 207', color: '#6366f1', units: 2, level: '200L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 205, title: 'Mathematical Methods I', code: 'MTH 201', color: '#8b5cf6', units: 2, level: '200L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 206, title: 'Logic & Algebra', code: 'MTH 203', color: '#d946ef', units: 2, level: '200L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 207, title: 'Numerical Analysis', code: 'MTH 209', color: '#ec4899', units: 2, level: '200L', semester: '1st', program: 'B.Sc. Mathematics' },

          // 200L - SECOND SEMESTER (MATHEMATICS)
          { id: 210, title: 'Philosophy & Logic', code: 'GST 212', color: '#3b82f6', units: 2, level: '200L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 211, title: 'Vector Analysis', code: 'MTH 210', color: '#2563eb', units: 2, level: '200L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 212, title: 'Ordinary Differential Equations', code: 'MTH 202', color: '#10b981', units: 2, level: '200L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 213, title: 'Linear Algebra II', code: 'MTH 204', color: '#8b5cf6', units: 2, level: '200L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 214, title: 'Mathematical Methods II', code: 'MTH 212', color: '#6366f1', units: 2, level: '200L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 215, title: 'Introduction to Programming II', code: 'COS 202', color: '#ec4899', units: 2, level: '200L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 216, title: 'Statistics for Physical Sciences', code: 'STA 212', color: '#14b8a6', units: 2, level: '200L', semester: '2nd', program: 'B.Sc. Mathematics' },

          // 300L - FIRST SEMESTER (MATHEMATICS)
          { id: 301, title: 'Metric Space Topology', code: 'MTH 301', color: '#3b82f6', units: 2, level: '300L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 302, title: 'Complex Analysis II', code: 'MTH 305', color: '#1d4ed8', units: 2, level: '300L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 303, title: 'Real Analysis II', code: 'MTH 307', color: '#1e3a8a', units: 2, level: '300L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 304, title: 'Artificial Intelligence', code: 'CSC 309', color: '#10b981', units: 2, level: '300L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 305, title: 'Venture Creation', code: 'ENT 311', color: '#f59e0b', units: 1, level: '300L', semester: '1st', program: 'B.Sc. Mathematics' },

          // 300L - SECOND SEMESTER (MATHEMATICS)
          { id: 306, title: 'Venture Creation II', code: 'ENT 312', color: '#f59e0b', units: 1, level: '300L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 307, title: 'Abstract Algebra I', code: 'MTH 304', color: '#10b981', units: 2, level: '300L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 308, title: 'Real Analysis III', code: 'MTH 306', color: '#3b82f6', units: 2, level: '300L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 309, title: 'Numerical Analysis II', code: 'MTH 310', color: '#8b5cf6', units: 2, level: '300L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 310, title: 'Music Advanced II', code: 'MTU-ESM 302', color: '#ef4444', units: 1, level: '300L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 311, title: 'French IV', code: 'MTU-PIF 302', color: '#ec4899', units: 1, level: '300L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 312, title: 'School of Prayer II', code: 'MTU-SDN 302', color: '#3b82f6', units: 1, level: '300L', semester: '2nd', program: 'B.Sc. Mathematics' },

          // 400L - FIRST SEMESTER (MATHEMATICS)
          { id: 401, title: 'Measure Theory & Integration', code: 'MTH 401', color: '#1e3a8a', units: 3, level: '400L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 402, title: 'Functional Analysis I', code: 'MTH 403', color: '#312e81', units: 3, level: '400L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 403, title: 'Partial Differential Equations I', code: 'MTH 405', color: '#3730a3', units: 3, level: '400L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 404, title: 'Abstract Algebra II', code: 'MTH 407', color: '#4338ca', units: 3, level: '400L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 405, title: 'Research Project I', code: 'MTH 499', color: '#10b981', units: 3, level: '400L', semester: '1st', program: 'B.Sc. Mathematics' },
          { id: 406, title: 'Entrepreneurship Dev. II', code: 'ENT 411', color: '#f59e0b', units: 1, level: '400L', semester: '1st', program: 'B.Sc. Mathematics' },

          // 400L - SECOND SEMESTER (MATHEMATICS)
          { id: 411, title: 'Functional Analysis II', code: 'MTH 402', color: '#312e81', units: 3, level: '400L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 412, title: 'Mathematical Modeling', code: 'MTH 406', color: '#1d4ed8', units: 3, level: '400L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 413, title: 'General Topology', code: 'MTH 408', color: '#2563eb', units: 3, level: '400L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 414, title: 'Fluid Dynamics', code: 'MTH 410', color: '#10b981', units: 3, level: '400L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 415, title: 'Research Project II', code: 'MTH 499', color: '#059669', units: 3, level: '400L', semester: '2nd', program: 'B.Sc. Mathematics' },
          { id: 416, title: 'Social Entrepreneurship', code: 'ENT 412', color: '#f59e0b', units: 1, level: '400L', semester: '2nd', program: 'B.Sc. Mathematics' },

          // Legacy / Mock Courses — pre-assigned to default lecturer
          { id: 1, title: 'Practical Physics II', code: 'PHY104', color: '#0f52ba', units: 3, level: '100L', program: 'B.Sc. Physics', lecturerId: 'LEC/2024/001', lecturerName: 'Prof. James Anderson', semester: '1st' },
          { id: 2, title: 'Computer Science', code: 'ICT102', color: '#2cb1bc', units: 3, level: '100L', program: 'B.Sc. Computer Science', lecturerId: 'LEC/2024/001', lecturerName: 'Prof. James Anderson', semester: '2nd' },
          { id: 3, title: 'General Studies in Communication', code: 'GST102', color: '#7c3aed', units: 2, level: '100L', program: 'B.Sc. Mathematics', lecturerId: 'LEC/2024/001', lecturerName: 'Prof. James Anderson', semester: '1st' },
        ],

        notifications: [
          { id: 1, text: 'Exam tomorrow: PHY104 at 10 AM', time: '1 hr ago', read: false, isUrgent: true },
          { id: 2, text: 'Assignment due for ICT102', time: '3 hrs ago', read: false },
          { id: 3, text: 'New grade posted for GST102', time: '1 day ago', read: true }
        ],

        exams: [
          { id: 1, title: 'PHY104 Final Exam', date: new Date(Date.now() + 86400000 * 2).toISOString() }
        ],

        // Materials uploaded by lecturers
        materials: [
          { id: 1, courseId: 1, title: 'Introduction to Mechanics', type: 'pdf', url: '#', size: '2.4 MB', uploadedBy: 'LEC/2024/001', date: '2026-04-10' },
          { id: 2, courseId: 1, title: 'Wave Theory Lecture Notes', type: 'pdf', url: '#', size: '1.8 MB', uploadedBy: 'LEC/2024/001', date: '2026-04-12' },
          { id: 3, courseId: 2, title: 'HTML5 Fundamentals', type: 'pdf', url: '#', size: '3.1 MB', uploadedBy: 'LEC/2024/001', date: '2026-04-08' },
          { id: 4, courseId: 2, title: 'CSS Grid & Flexbox Video', type: 'video', url: '#', size: '120 MB', uploadedBy: 'LEC/2024/001', date: '2026-04-14' },
          { id: 5, courseId: 3, title: 'Academic Writing Guide', type: 'pdf', url: '#', size: '1.2 MB', uploadedBy: 'LEC/2024/001', date: '2026-04-09' },
        ],

        // Library / textbooks per course
        library: [
          { id: 1, courseId: 1, title: 'University Physics Vol. 1', author: 'Young & Freedman', edition: '14th Ed', type: 'textbook', url: '#' },
          { id: 2, courseId: 1, title: 'Physics for Scientists & Engineers', author: 'Serway & Jewett', edition: '9th Ed', type: 'textbook', url: '#' },
          { id: 3, courseId: 2, title: 'HTML & CSS: Design and Build Websites', author: 'Jon Duckett', edition: '1st Ed', type: 'textbook', url: '#' },
          { id: 4, courseId: 2, title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', edition: '1st Ed', type: 'textbook', url: '#' },
          { id: 5, courseId: 3, title: 'The Elements of Style', author: 'Strunk & White', edition: '4th Ed', type: 'textbook', url: '#' },
          { id: 6, courseId: 5, title: 'Electric Circuits', author: 'Nilsson & Riedel', edition: '11th Ed', type: 'textbook', url: '#' },
        ],

        // Assignments
        assignments: [
          { id: 1, courseId: 1, title: 'Newton\'s Laws Problem Set', description: 'Solve the 10 problems on Newton\'s laws of motion provided in the course materials. Show all workings.', dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), maxScore: 50, createdBy: 'LEC/2024/001', status: 'active' },
          { id: 2, courseId: 2, title: 'Build a Responsive Webpage', description: 'Create a fully responsive personal portfolio webpage using HTML, CSS (Flexbox/Grid), and basic JavaScript interactivity.', dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), maxScore: 100, createdBy: 'LEC/2024/001', status: 'active' },
          { id: 3, courseId: 3, title: 'Essay: Academic Communication', description: 'Write a 500-word essay on the importance of academic integrity in university education.', dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), maxScore: 50, createdBy: 'LEC/2024/001', status: 'closed' },
          { id: 4, courseId: 1, title: 'Circuit Analysis Report', description: 'Analyze the given electric circuit and determine voltage drops, current flows, and power dissipation at each element.', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), maxScore: 75, createdBy: 'LEC/2024/001', status: 'active' },
        ],

        // Student submissions
        submissions: [
          { id: 1, assignmentId: 3, studentId: 'student-1', studentName: 'Victor Adeleke', content: 'Academic integrity is the foundation of learning...', submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(), score: null, feedback: '' },
        ],

        // Quizzes — rich model (see QUIZ shape). Seed quizzes are normalized to
        // the new shape: each question carries type/text/options/correct/marks,
        // `correct` for mcq is the option index, totalMarks = sum of question marks.
        // Legacy fields kept for backward-compatible UI: `description` (alias of
        // `instructions`), `createdBy` (alias of `lecturerId`), and each question
        // still exposes `question` alongside the canonical `text`.
        quizzes: [
          {
            id: 1, courseId: 1, lecturerId: 'LEC/2024/001', createdBy: 'LEC/2024/001',
            title: 'PHY104 Week 3 Quiz',
            instructions: 'Test your understanding of Newton\'s Laws', description: 'Test your understanding of Newton\'s Laws',
            startAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            endAt: new Date(Date.now() + 86400000 * 14).toISOString(),
            timeLimit: 15, totalMarks: 5, attemptsAllowed: 1,
            shuffleQuestions: false, shuffleOptions: false, displayMode: 'all',
            status: 'published', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            questions: [
              { id: 1, type: 'mcq', text: 'Which of Newton\'s laws states that every action has an equal and opposite reaction?', question: 'Which of Newton\'s laws states that every action has an equal and opposite reaction?', options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'], correct: 2, marks: 1 },
              { id: 2, type: 'mcq', text: 'What is the SI unit of force?', question: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correct: 1, marks: 1 },
              { id: 3, type: 'mcq', text: 'F = ma represents Newton\'s _____ Law', question: 'F = ma represents Newton\'s _____ Law', options: ['First', 'Second', 'Third', 'Fourth'], correct: 1, marks: 1 },
              { id: 4, type: 'mcq', text: 'A body at rest tends to stay at rest. This is known as?', question: 'A body at rest tends to stay at rest. This is known as?', options: ['Inertia', 'Momentum', 'Velocity', 'Acceleration'], correct: 0, marks: 1 },
              { id: 5, type: 'mcq', text: 'Which quantity is a vector?', question: 'Which quantity is a vector?', options: ['Mass', 'Speed', 'Time', 'Velocity'], correct: 3, marks: 1 },
            ]
          },
          {
            id: 2, courseId: 2, lecturerId: 'LEC/2024/001', createdBy: 'LEC/2024/001',
            title: 'ICT102 HTML/CSS Quiz',
            instructions: 'Basic web technologies assessment', description: 'Basic web technologies assessment',
            startAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            endAt: new Date(Date.now() + 86400000 * 14).toISOString(),
            timeLimit: 20, totalMarks: 5, attemptsAllowed: 1,
            shuffleQuestions: false, shuffleOptions: false, displayMode: 'all',
            status: 'published', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            questions: [
              { id: 1, type: 'mcq', text: 'What does HTML stand for?', question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Text Machine Language', 'HyperText Machine Language', 'HyperTool Mark Language'], correct: 0, marks: 1 },
              { id: 2, type: 'mcq', text: 'Which CSS property is used for text color?', question: 'Which CSS property is used for text color?', options: ['font-color', 'text-color', 'color', 'foreground'], correct: 2, marks: 1 },
              { id: 3, type: 'mcq', text: 'Which HTML tag is used for the largest heading?', question: 'Which HTML tag is used for the largest heading?', options: ['<h6>', '<heading>', '<h1>', '<head>'], correct: 2, marks: 1 },
              { id: 4, type: 'mcq', text: 'Which property makes a flexbox container?', question: 'Which property makes a flexbox container?', options: ['display: flex', 'flex: row', 'position: flex', 'layout: flex'], correct: 0, marks: 1 },
              { id: 5, type: 'mcq', text: 'CSS stands for?', question: 'CSS stands for?', options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], correct: 1, marks: 1 },
            ]
          },
        ],

        // Quiz results per student (legacy simple model — kept for old UI)
        quizResults: [],

        // Rich quiz attempts (see ATTEMPT shape)
        quizAttempts: [],

        // Past questions
        pastQuestions: [
          { id: 1, courseId: 1, year: '2024/2025', semester: 'First', type: 'Theory', questions: ['Define Newton\'s first law of motion and give two examples.', 'A car of mass 1200kg accelerates at 3m/s². Calculate the force applied.', 'Distinguish between scalar and vector quantities with examples.', 'State and explain the principle of conservation of momentum.', 'A ball is thrown vertically upward with velocity 20m/s. Find the maximum height reached. (g = 10m/s²)'] },
          { id: 2, courseId: 1, year: '2023/2024', semester: 'Second', type: 'Theory', questions: ['What is the difference between mass and weight?', 'Explain uniform circular motion with a real-life example.', 'State Hooke\'s Law. What is the spring constant?', 'Describe simple harmonic motion. Give two examples.', 'Calculate the work done when a force of 50N moves an object 10m.'] },
          { id: 3, courseId: 2, year: '2024/2025', semester: 'First', type: 'Practical', questions: ['Build a complete HTML form with validation using JavaScript.', 'Demonstrate the difference between inline and block elements.', 'Create a responsive 3-column layout using CSS Grid.', 'Write JavaScript to fetch data from an API and display it.', 'Style a navigation bar using Flexbox.'] },
          { id: 4, courseId: 3, year: '2024/2025', semester: 'First', type: 'Theory', questions: ['What is academic writing? List its key features.', 'Explain the difference between denotation and connotation.', 'Write a formal letter to your HOD requesting an extension.', 'What is plagiarism? How can it be avoided?', 'Define register. Give examples of formal and informal register.'] },
        ],

        // Direct messages between users
        messages: [
          { id: 1, from: 'lecturer-1', to: 'student-1', fromName: 'Dr. Sarah Jenkins', content: 'Hello Victor, please remember to submit your Newton\'s Laws assignment before the deadline.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), read: false },
          { id: 2, from: 'student-1', to: 'lecturer-1', fromName: 'Victor Adeleke', content: 'Good day Dr. Jenkins, I\'ll submit it before the deadline. I have a question about question 7 though.', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), read: true },
        ],

        // Lecturer ratings from students
        lecturerRatings: [
          { id: 1, lecturerId: 'LEC/2024/001', studentId: 'student-1', courseId: 1, rating: 4, comment: 'Very clear explanations. Would appreciate more practical examples.', date: '2026-04-10' },
        ],

        // Broadcast announcements
        broadcasts: [
          { id: 1, from: 'lecturer-1', fromName: 'Dr. Sarah Jenkins', title: 'Assignment Reminder', message: 'Reminder: PHY104 assignment is due in 3 days. Please ensure all workings are shown.', courseId: 1, timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), isUrgent: false },
        ],

        // ─── NOTIFICATION ACTIONS ───
        activeToast: null,
        markNotificationRead: (id) => set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        })),
        clearActiveToast: () => set({ activeToast: null }),
        receiveBroadcast: (newNotif) => set((state) => ({
          notifications: [newNotif, ...state.notifications],
          activeToast: newNotif
        })),
        clearNotifications: () => set({ notifications: [] }),
        broadcastAlert: (text, isUrgent = true) => {
          if (bc) bc.postMessage({ type: 'NEW_ALERT', payload: { text, isUrgent } });
          const newNotif = { id: Date.now(), text, time: 'Just now', read: false, isUrgent };
          set((state) => ({
            notifications: [newNotif, ...state.notifications],
            activeToast: newNotif
          }));
        },

        // ─── RICH NOTIFICATION INFRASTRUCTURE ───
        // The single helper every future feature should call to notify users.
        // Prepends a per-recipient notification onto the shared `notifications`
        // array. Backward compatible: existing notifications (no recipientId /
        // no target) remain visible to everyone via getMyNotifications().
        // Returns the created notification.
        pushNotification: ({ recipientId, target, type, text, link, isUrgent } = {}) => {
          const newNotif = {
            id: nextId(),
            recipientId: recipientId ?? null,
            target: target ?? null, // 'all' | 'student' | 'lecturer' | 'admin'
            type: type ?? 'system',
            text: text ?? '',
            link: link ?? null,
            time: new Date().toISOString(),
            read: false,
            isUrgent: !!isUrgent,
          };
          set((state) => ({
            notifications: [newNotif, ...state.notifications],
            activeToast: newNotif,
          }));
          return newNotif;
        },

        // Internal predicate: is a notification relevant to the given user?
        // Honors both the new `recipientId` and the legacy `targetUserId` field
        // used by existing producers (private call invites, etc.).
        _isNotifForUser: (n, user) => {
          if (!user) return false;
          const recip = n.recipientId ?? n.targetUserId ?? null;
          if (recip && recip !== user.id) return false;
          const tgt = n.target ?? null;
          if (tgt && tgt !== 'all' && tgt !== user.role) return false;
          const muted = user.mutedNotificationTypes || [];
          if (n.type && muted.includes(n.type)) return false;
          return true;
        },

        // Notifications relevant to the CURRENT user, newest first. Legacy
        // notifications with no recipientId/target stay visible to everyone.
        getMyNotifications: () => {
          const state = get();
          const user = state.user;
          if (!user) return [];
          const relevant = state.notifications.filter((n) => state._isNotifForUser(n, user));
          // Newest first. New notifs carry ISO `time`; legacy ones may carry a
          // human string ("1 hr ago") or a numeric id — fall back to id order.
          return [...relevant].sort((a, b) => {
            const ta = Date.parse(a.time);
            const tb = Date.parse(b.time);
            if (!Number.isNaN(ta) && !Number.isNaN(tb)) return tb - ta;
            return 0; // preserve existing (already newest-first) order otherwise
          });
        },

        // Mark ALL of the current user's relevant notifications read.
        markAllNotificationsRead: () => {
          const state = get();
          const user = state.user;
          if (!user) return;
          set((s) => ({
            notifications: s.notifications.map((n) =>
              s._isNotifForUser(n, user) ? { ...n, read: true } : n
            ),
          }));
        },

        // Remove a single notification by id (only if relevant to current user).
        clearNotification: (id) => {
          const state = get();
          const user = state.user;
          set((s) => ({
            notifications: s.notifications.filter((n) => {
              if (n.id !== id) return true;
              // only the owner (or, for unscoped legacy notifs, anyone) may clear
              return user ? !s._isNotifForUser(n, user) : false;
            }),
          }));
        },

        // Remove ALL of the current user's relevant notifications.
        clearAllNotifications: () => {
          const state = get();
          const user = state.user;
          if (!user) return;
          set((s) => ({
            notifications: s.notifications.filter((n) => !s._isNotifForUser(n, user)),
          }));
        },

        // ─── PER-USER NOTIFICATION MUTE PREFERENCES ───
        // Toggle a notification `type` in the current user's muted list. Stored
        // on the user record (dynamicUsers + active user) so it persists and
        // getMyNotifications can exclude muted types.
        toggleNotificationType: (type) => {
          const state = get();
          const user = state.user;
          if (!user || !type) return;
          const apply = (u) => {
            if (!u || u.id !== user.id) return u;
            const muted = u.mutedNotificationTypes || [];
            const next = muted.includes(type)
              ? muted.filter((t) => t !== type)
              : [...muted, type];
            return { ...u, mutedNotificationTypes: next };
          };
          set((s) => ({
            dynamicUsers: s.dynamicUsers.map(apply),
            user: apply(s.user),
          }));
        },

        // ─── NOTEPAD ACTIONS (scoped to current logged-in user) ───
        // Each note: { id, ownerId, title, body, courseTag?, pinned, createdAt, updatedAt }
        addNote: (partial = {}) => {
          const user = get().user;
          if (!user) return null;
          const now = new Date().toISOString();
          const newNote = {
            id: nextId(),
            ownerId: user.id,
            title: partial.title ?? '',
            body: partial.body ?? '',
            courseTag: partial.courseTag ?? null,
            pinned: partial.pinned ?? false,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({ notes: [newNote, ...state.notes] }));
          return newNote;
        },
        updateNote: (id, patch = {}) => {
          const user = get().user;
          if (!user) return;
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === id && n.ownerId === user.id
                ? { ...n, ...patch, id: n.id, ownerId: n.ownerId, createdAt: n.createdAt, updatedAt: new Date().toISOString() }
                : n
            ),
          }));
        },
        deleteNote: (id) => {
          const user = get().user;
          if (!user) return;
          set((state) => ({
            notes: state.notes.filter((n) => !(n.id === id && n.ownerId === user.id)),
          }));
        },
        togglePinNote: (id) => {
          const user = get().user;
          if (!user) return;
          set((state) => ({
            notes: state.notes.map((n) =>
              n.id === id && n.ownerId === user.id
                ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() }
                : n
            ),
          }));
        },
        // Current user's notes: pinned first, then most-recently-updated.
        getMyNotes: () => {
          const state = get();
          const user = state.user;
          if (!user) return [];
          return state.notes
            .filter((n) => n.ownerId === user.id)
            .sort((a, b) => {
              if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
              return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
        },

        // ─── COURSE ACTIONS ───
        saveCourseNote: (courseId, text) => set((state) => ({
          courses: state.courses.map(c => c.id === courseId ? { ...c, note: text } : c)
        })),
        addCourse: (course) => set((state) => ({
          courses: [...state.courses, { ...course, id: Date.now(), note: '', enrolled: 0 }]
        })),
        appointLecturerToCourse: (courseId, lecturerId) => set((state) => ({
          courses: state.courses.map(c => c.id === courseId ? { ...c, lecturerId } : c)
        })),

        // ─── MATERIAL ACTIONS ───
        addMaterial: (material) => {
          const { user, courses, broadcastAlert } = get();
          const newMaterial = { 
            ...material, 
            id: Date.now(), 
            date: new Date().toISOString().split('T')[0] 
          };
          
          set((state) => ({
            materials: [...state.materials, newMaterial]
          }));

          // Notify students of the new material
          const course = courses.find(c => c.id === material.courseId);
          broadcastAlert(`New material uploaded for ${course?.code || 'your course'}: ${material.title}`, false);
        },
        deleteMaterial: (id) => set((state) => ({
          materials: state.materials.filter(m => m.id !== id)
        })),

        // ─── LIVE CLASSROOM ACTIONS ───
        liveSessions: [],
        sessionMessages: [],
        callHistory: [],
        startLiveSession: (courseId, settings = {}) => {
          const targetCourse = get().courses.find(c => c.id === courseId);
          if (!targetCourse) return null;
          
          const lecturer = get().getCourseAssignedLecturer(courseId);
          const sessionId = targetCourse.code + '-' + Date.now();
          
          const newSession = {
            id: sessionId,
            courseId: courseId,
            title: targetCourse.title,
            lecturerName: lecturer?.name || 'Academic Lead',
            lecturerId: lecturer?.id,
            startTime: new Date().toISOString(),
            settings: {
              muteOnEntry: settings.muteOnEntry ?? true,
              waitingRoom: settings.waitingRoom ?? false,
              recordLocally: settings.recordLocally ?? false,
              screenShareEnabled: settings.screenShareEnabled ?? true,
              chatEnabled: settings.chatEnabled ?? true
            },
            participants: [],
            waitingParticipants: []
          };

          set(state => ({
            liveSessions: [...state.liveSessions, newSession],
            notifications: [
              { 
                id: Date.now(), 
                text: `[LIVE] ${targetCourse.code} is now in session. Connect to virtual auditorium.`, 
                time: 'Just Now', 
                read: false, 
                isUrgent: true,
                target: 'student',
                courseId: courseId
              },
              ...state.notifications
            ]
          }));
          return sessionId;
        },
        startPrivateCall: (courseId, studentId, studentName) => {
          const { courses, getCourseAssignedLecturer } = get();
          const targetCourse = courses.find(c => c.id === courseId);
          const lecturer = getCourseAssignedLecturer(courseId);
          const sessionId = `PRIVATE-${studentId}-${Date.now()}`;
          
          const newSession = {
            id: sessionId,
            courseId,
            title: `Private Consultation: ${studentName}`,
            lecturerName: lecturer?.name,
            lecturerId: lecturer?.id,
            startTime: new Date().toISOString(),
            isPrivate: true,
            targetStudentId: studentId,
            settings: { muteOnEntry: false, waitingRoom: false, chatEnabled: true }
          };

          set(state => ({
            liveSessions: [...state.liveSessions, newSession],
            notifications: [
               {
                 id: Date.now(),
                 text: `❗ [URGENT] ${lecturer.name} is calling you for a private consultation.`,
                 time: 'Just Now',
                 read: false,
                 isUrgent: true,
                 target: 'student',
                 targetUserId: studentId,
                 sessionId: sessionId
               },
               ...state.notifications
            ]
          }));
          return sessionId;
        },
        joinLiveSession: (sessionId, userId, userName) => {
          set(state => ({
            liveSessions: state.liveSessions.map(s =>
              s.id === sessionId
                ? (s.participants || []).some(p => p.id === userId)
                  ? s
                  : { ...s, participants: [...(s.participants || []), { id: userId, name: userName, role: 'Student', joinTime: new Date().toISOString() }] }
                : s
            )
          }));
        },
        joinWaitingRoom: (sessionId, userId, userName) => {
          set(state => ({
            liveSessions: state.liveSessions.map(s => 
              s.id === sessionId 
                ? { ...s, waitingParticipants: [...(s.waitingParticipants || []), { userId, name: userName, requestTime: new Date().toISOString() }] }
                : s
            )
          }));
        },
        admitParticipant: (sessionId, userId) => {
          const session = get().liveSessions.find(s => s.id === sessionId);
          if (!session) return;
          const participant = session.waitingParticipants.find(p => p.userId === userId);
          if (!participant) return;

          set(state => ({
            liveSessions: state.liveSessions.map(s => 
              s.id === sessionId 
                ? {
                    ...s,
                    waitingParticipants: (s.waitingParticipants || []).filter(p => p.userId !== userId),
                    participants: (s.participants || []).some(p => p.id === userId)
                      ? (s.participants || [])
                      : [...(s.participants || []), { name: participant.name, id: userId, joinTime: new Date().toISOString() }]
                  }
                : s
            )
          }));
        },
        rejectParticipant: (sessionId, userId) => {
          set(state => ({
            liveSessions: state.liveSessions.map(s => 
              s.id === sessionId 
                ? { ...s, waitingParticipants: (s.waitingParticipants || []).filter(p => p.userId !== userId) }
                : s
            )
          }));
        },
        endLiveSession: (sessionId) => {
          const session = get().liveSessions.find(s => s.id === sessionId);
          if (session) {
            const logEntry = {
              ...session,
              endTime: new Date().toISOString(),
              duration: Math.round((Date.now() - new Date(session.startTime).getTime()) / 60000) + 'm'
            };
            set(state => ({ callHistory: [logEntry, ...state.callHistory] }));
          }
          set(state => ({
            liveSessions: state.liveSessions.filter(s => s.id !== sessionId),
            sessionMessages: state.sessionMessages.filter(m => m.sessionId !== sessionId)
          }));
        },
        sendSessionMessage: (sessionId, content) => {
          const { user } = get();
          const newMessage = {
            id: Date.now(),
            sessionId,
            fromId: user.id,
            fromName: user.name,
            role: user.role,
            content,
            timestamp: new Date().toISOString()
          };
          set(state => ({
            sessionMessages: [...state.sessionMessages, newMessage]
          }));
        },

        // ─── ASSIGNMENT ACTIONS ───
        addAssignment: (assignment) => set((state) => ({
          assignments: [...state.assignments, { ...assignment, id: Date.now(), status: 'active' }]
        })),
        submitAssignment: (assignmentId, content, attachment = null) => {
          const { user } = get();
          set((state) => ({
            submissions: [...state.submissions, {
              id: Date.now(),
              assignmentId,
              studentId: user.id,
              studentName: user.name,
              content,
              attachment,
              submittedAt: new Date().toISOString(),
              score: null,
              feedback: ''
            }]
          }));
        },
        gradeSubmission: (submissionId, score, feedback) => set((state) => ({
          submissions: state.submissions.map(s =>
            s.id === submissionId ? { ...s, score, feedback } : s
          )
        })),

        // ─── QUIZ ACTIONS (rich model) ───
        // Recompute totalMarks as the sum of question marks (ints, default 1).
        _recalcTotalMarks: (questions = []) =>
          questions.reduce((sum, q) => sum + (Number.isFinite(q?.marks) ? q.marks : (parseInt(q?.marks, 10) || 0)), 0),

        // Normalize a question to the canonical rich shape.
        _normalizeQuestion: (q = {}, fallbackId) => {
          const type = q.type === 'tf' || q.type === 'short' ? q.type : 'mcq';
          const text = q.text ?? q.question ?? '';
          const marks = Number.isFinite(q.marks) ? q.marks : (parseInt(q.marks, 10) || 1);
          let correct = q.correct ?? null;
          if (type === 'mcq') correct = Number.isFinite(correct) ? correct : (parseInt(correct, 10) || 0);
          else if (type === 'tf') correct = correct === true || correct === 'true';
          else correct = q.correct ?? null; // short: model answer or null
          return {
            id: q.id ?? fallbackId,
            type,
            text,
            question: text, // legacy alias for existing UI
            options: type === 'mcq' ? (Array.isArray(q.options) ? q.options : ['', '', '', '']) : [],
            correct,
            marks,
          };
        },

        // Create a DRAFT quiz owned by the current user. Returns the quiz.
        addQuiz: (data = {}) => {
          const { user } = get();
          const id = Date.now();
          const questions = (data.questions || []).map((q, i) =>
            get()._normalizeQuestion(q, id + i + 1)
          );
          const totalMarks = get()._recalcTotalMarks(questions);
          const nowISO = new Date().toISOString();
          const quiz = {
            id,
            courseId: data.courseId ?? null,
            lecturerId: user?.id ?? null,
            createdBy: user?.id ?? null, // legacy alias
            title: data.title ?? '',
            instructions: data.instructions ?? data.description ?? '',
            description: data.instructions ?? data.description ?? '', // legacy alias
            startAt: data.startAt ?? nowISO,
            endAt: data.endAt ?? new Date(Date.now() + 86400000 * 7).toISOString(),
            timeLimit: parseInt(data.timeLimit, 10) || 15,
            totalMarks,
            attemptsAllowed: parseInt(data.attemptsAllowed, 10) || 1,
            shuffleQuestions: !!data.shuffleQuestions,
            shuffleOptions: !!data.shuffleOptions,
            displayMode: data.displayMode === 'one' ? 'one' : 'all',
            status: 'draft',
            questions,
            createdAt: nowISO,
          };
          set((state) => ({ quizzes: [...state.quizzes, quiz] }));
          return quiz;
        },

        // Update a quiz. If it has ANY attempt, restrict the patch to { endAt }
        // (deadline extension) only. Otherwise allow a full edit. Always recompute
        // totalMarks from questions. Owner-scoped.
        updateQuiz: (id, patch = {}) => {
          const state = get();
          const quiz = state.quizzes.find(q => q.id === id);
          if (!quiz) return null;
          if (quiz.lecturerId && state.user && quiz.lecturerId !== state.user.id) return null;

          const hasAttempts = state.quizAttempts.some(a => a.quizId === id);
          let nextPatch;
          if (hasAttempts) {
            nextPatch = patch.endAt ? { endAt: patch.endAt } : {};
          } else {
            nextPatch = { ...patch };
            if (nextPatch.questions) {
              nextPatch.questions = nextPatch.questions.map((q, i) =>
                state._normalizeQuestion(q, (Date.now() + i + 1))
              );
            }
            // keep legacy aliases coherent
            if (nextPatch.instructions !== undefined) nextPatch.description = nextPatch.instructions;
            if (nextPatch.displayMode !== undefined) nextPatch.displayMode = nextPatch.displayMode === 'one' ? 'one' : 'all';
          }

          let updated = null;
          set((s) => ({
            quizzes: s.quizzes.map(q => {
              if (q.id !== id) return q;
              const merged = { ...q, ...nextPatch };
              merged.totalMarks = s._recalcTotalMarks(merged.questions);
              updated = merged;
              return merged;
            }),
          }));
          return updated;
        },

        // Delete a quiz (owner only) and its attempts.
        deleteQuiz: (id) => {
          const state = get();
          const quiz = state.quizzes.find(q => q.id === id);
          if (!quiz) return;
          if (quiz.lecturerId && state.user && quiz.lecturerId !== state.user.id) return;
          set((s) => ({
            quizzes: s.quizzes.filter(q => q.id !== id),
            quizAttempts: s.quizAttempts.filter(a => a.quizId !== id),
          }));
        },

        // Publish a draft quiz and notify students.
        publishQuiz: (id) => {
          const state = get();
          const quiz = state.quizzes.find(q => q.id === id);
          if (!quiz) return null;
          if (quiz.lecturerId && state.user && quiz.lecturerId !== state.user.id) return null;
          set((s) => ({
            quizzes: s.quizzes.map(q => q.id === id ? { ...q, status: 'published' } : q),
          }));
          const course = state.courses.find(c => c.id === quiz.courseId);
          const courseCode = course?.code || 'Course';
          state.pushNotification({
            target: 'student',
            type: 'quiz',
            text: `New quiz published: "${quiz.title}" (${courseCode})`,
            link: '/dashboard/quizzes',
          });
          return get().quizzes.find(q => q.id === id);
        },

        // Extend a quiz deadline (owner-scoped via updateQuiz's endAt path).
        extendQuizDeadline: (id, newEndAtISO) => get().updateQuiz(id, { endAt: newEndAtISO }),

        // Lifecycle status of a quiz relative to now.
        getQuizStatus: (quiz) => {
          if (!quiz || quiz.status !== 'published') return 'draft';
          const now = Date.now();
          const start = Date.parse(quiz.startAt);
          const end = Date.parse(quiz.endAt);
          if (!Number.isNaN(start) && now < start) return 'upcoming';
          if (!Number.isNaN(end) && now > end) return 'closed';
          return 'active';
        },

        // Begin (or resume) the current student's attempt at a quiz.
        // Returns the attempt, or { error } when blocked.
        startQuizAttempt: (quizId) => {
          const state = get();
          const { user } = state;
          if (!user) return { error: 'Not signed in.' };
          const quiz = state.quizzes.find(q => q.id === quizId);
          if (!quiz) return { error: 'Quiz not found.' };
          if (state.getQuizStatus(quiz) !== 'active') return { error: 'This quiz is not currently open.' };

          const mine = state.quizAttempts.filter(a => a.quizId === quizId && a.studentId === user.id);
          const inProgress = mine.find(a => a.status === 'in-progress');
          if (inProgress) return inProgress; // resume

          const used = mine.length;
          if (used >= (quiz.attemptsAllowed || 1)) return { error: 'No attempts remaining.' };

          // Question order (optionally shuffled)
          let questionOrder = quiz.questions.map(q => q.id);
          if (quiz.shuffleQuestions) questionOrder = shuffleArray(questionOrder);

          // Per-mcq option orders (optionally shuffled)
          const optionOrders = {};
          quiz.questions.forEach(q => {
            if (q.type === 'mcq') {
              const idxs = q.options.map((_, i) => i);
              optionOrders[q.id] = quiz.shuffleOptions ? shuffleArray(idxs) : idxs;
            }
          });

          const maxScore = state._recalcTotalMarks(quiz.questions);
          const attempt = {
            id: nextId(),
            quizId,
            studentId: user.id,
            studentName: user.name,
            answers: {},
            questionOrder,
            optionOrders,
            autoScore: 0,
            manualScore: null,
            totalScore: 0,
            maxScore,
            status: 'in-progress',
            startedAt: new Date().toISOString(),
            submittedAt: null,
            timeTakenSec: null,
            flags: { tabSwitches: 0 },
          };
          set((s) => ({ quizAttempts: [...s.quizAttempts, attempt] }));
          return attempt;
        },

        // Autosave merged answers; no grading.
        saveAttemptProgress: (attemptId, answers = {}) => set((state) => ({
          quizAttempts: state.quizAttempts.map(a =>
            a.id === attemptId && a.status === 'in-progress'
              ? { ...a, answers: { ...a.answers, ...answers } }
              : a
          ),
        })),

        // Record a tab switch; auto-submit on the 3rd and alert the lecturer.
        recordTabSwitch: (attemptId) => {
          const state = get();
          const attempt = state.quizAttempts.find(a => a.id === attemptId);
          if (!attempt || attempt.status !== 'in-progress') return;
          const switches = (attempt.flags?.tabSwitches || 0) + 1;
          set((s) => ({
            quizAttempts: s.quizAttempts.map(a =>
              a.id === attemptId ? { ...a, flags: { ...a.flags, tabSwitches: switches } } : a
            ),
          }));
          if (switches >= 3) {
            const quiz = state.quizzes.find(q => q.id === attempt.quizId);
            const fresh = get().quizAttempts.find(a => a.id === attemptId);
            get().submitQuizAttempt(attemptId, fresh?.answers || {});
            if (quiz?.lecturerId) {
              get().pushNotification({
                recipientId: quiz.lecturerId,
                type: 'system',
                text: `Suspicious activity: ${attempt.studentName} switched tabs 3x during "${quiz.title}"`,
                isUrgent: true,
              });
            }
          }
        },

        // Finalize an attempt: auto-grade mcq/tf, leave short answers ungraded.
        submitQuizAttempt: (attemptId, answers = {}) => {
          const state = get();
          const attempt = state.quizAttempts.find(a => a.id === attemptId);
          if (!attempt || attempt.status !== 'in-progress') {
            return state.quizAttempts.find(a => a.id === attemptId) || null;
          }
          const quiz = state.quizzes.find(q => q.id === attempt.quizId);
          const finalAnswers = { ...attempt.answers, ...answers };

          let autoScore = 0;
          let maxScore = 0;
          let hasShort = false;
          (quiz?.questions || []).forEach(q => {
            maxScore += q.marks || 0;
            const ans = finalAnswers[q.id];
            if (q.type === 'mcq') {
              if (ans === q.correct) autoScore += q.marks || 0;
            } else if (q.type === 'tf') {
              if (ans === q.correct) autoScore += q.marks || 0;
            } else if (q.type === 'short') {
              hasShort = true;
            }
          });

          const submittedAt = new Date().toISOString();
          const timeTakenSec = Math.max(
            0,
            Math.round((Date.parse(submittedAt) - Date.parse(attempt.startedAt)) / 1000)
          );
          const status = hasShort ? 'submitted' : 'graded';
          const manualScore = null;
          const totalScore = autoScore; // manual added at grading time

          let result = null;
          set((s) => ({
            quizAttempts: s.quizAttempts.map(a => {
              if (a.id !== attemptId) return a;
              result = {
                ...a,
                answers: finalAnswers,
                autoScore,
                manualScore,
                totalScore,
                maxScore,
                status,
                submittedAt,
                timeTakenSec,
              };
              return result;
            }),
          }));

          if (quiz) {
            get().pushNotification({
              recipientId: attempt.studentId,
              type: 'result',
              text: `Your result for "${quiz.title}" is available`,
              link: '/dashboard/quizzes',
            });
          }
          return result;
        },

        // Award per-short-question marks; finalize grading.
        gradeShortAnswers: (attemptId, marksByQuestionId = {}) => {
          const state = get();
          const attempt = state.quizAttempts.find(a => a.id === attemptId);
          if (!attempt) return null;
          const quiz = state.quizzes.find(q => q.id === attempt.quizId);

          // Sum manual marks, clamped to each short question's max.
          let manualScore = 0;
          (quiz?.questions || []).forEach(q => {
            if (q.type !== 'short') return;
            const raw = marksByQuestionId[q.id];
            const m = Number.isFinite(raw) ? raw : (parseInt(raw, 10) || 0);
            manualScore += Math.max(0, Math.min(m, q.marks || 0));
          });

          const totalScore = (attempt.autoScore || 0) + manualScore;
          let result = null;
          set((s) => ({
            quizAttempts: s.quizAttempts.map(a => {
              if (a.id !== attemptId) return a;
              result = {
                ...a,
                manualScore,
                totalScore,
                status: 'graded',
                shortMarks: { ...(a.shortMarks || {}), ...marksByQuestionId },
              };
              return result;
            }),
          }));

          if (quiz) {
            get().pushNotification({
              recipientId: attempt.studentId,
              type: 'result',
              text: `Your "${quiz.title}" has been fully graded`,
              link: '/dashboard/quizzes',
            });
          }
          return result;
        },

        // Current student's latest attempt for a quiz, or null.
        getMyQuizAttempt: (quizId) => {
          const state = get();
          const { user } = state;
          if (!user) return null;
          const mine = state.quizAttempts.filter(a => a.quizId === quizId && a.studentId === user.id);
          if (!mine.length) return null;
          return mine.reduce((latest, a) =>
            Date.parse(a.startedAt) >= Date.parse(latest.startedAt) ? a : latest
          );
        },

        // All attempts for a quiz (lecturer view).
        getQuizSubmissions: (quizId) =>
          get().quizAttempts.filter(a => a.quizId === quizId),

        // Aggregate quiz analytics across all quizzes (admin).
        getQuizAnalytics: () => {
          const state = get();
          const quizzes = state.quizzes;
          const attempts = state.quizAttempts;
          const totalQuizzes = quizzes.length;
          const publishedQuizzes = quizzes.filter(q => q.status === 'published').length;
          const totalAttempts = attempts.length;

          const scored = attempts.filter(a => a.maxScore > 0);
          const avgScorePct = scored.length
            ? Math.round(
                scored.reduce((sum, a) => sum + (a.totalScore / a.maxScore) * 100, 0) / scored.length
              )
            : 0;

          const finished = attempts.filter(a => a.status === 'submitted' || a.status === 'graded').length;
          const completionRatePct = totalAttempts
            ? Math.round((finished / totalAttempts) * 100)
            : 0;

          return { totalQuizzes, publishedQuizzes, totalAttempts, avgScorePct, completionRatePct };
        },

        // ─── LEGACY QUIZ RESULT (simple model — retained so old UI keeps working) ───
        submitQuizResult: (quizId, answers, score) => {
          const { user } = get();
          set((state) => ({
            quizResults: [...state.quizResults.filter(r => !(r.quizId === quizId && r.studentId === user.id)), {
              id: Date.now(),
              quizId,
              studentId: user.id,
              studentName: user.name,
              answers,
              score,
              submittedAt: new Date().toISOString()
            }]
          }));
        },

        // ─── LIBRARY ACTIONS ───
        getLibrary: () => get().library,
        getAcademicStructure: () => ACADEMIC_STRUCTURE,
        addLibraryItem: (item) => set((state) => ({
          library: [...state.library, { ...item, id: Date.now() }]
        })),

        // ─── PAST QUESTION ACTIONS ───
        addPastQuestion: (pq) => set((state) => ({
          pastQuestions: [...state.pastQuestions, { ...pq, id: Date.now() }]
        })),

        // ─── MESSAGE ACTIONS ───
        sendMessage: (toId, toName, content) => {
          const { user } = get();
          const newMsg = {
            id: Date.now(),
            from: user.id,
            to: toId,
            fromName: user.name,
            content,
            timestamp: new Date().toISOString(),
            read: false
          };
          set((state) => ({ messages: [...state.messages, newMsg] }));
        },
        markMessagesRead: (fromId) => {
          const { user } = get();
          set((state) => ({
            messages: state.messages.map(m =>
              m.from === fromId && m.to === user?.id ? { ...m, read: true } : m
            )
          }));
        },

        // ─── BROADCAST ACTIONS ───
        sendLecturerBroadcast: (data) => {
          const { user } = get();
          const newBroadcast = {
            id: Date.now(),
            from: user.id,
            fromName: user.name,
            ...data,
            timestamp: new Date().toISOString(),
          };
          set((state) => ({ broadcasts: [newBroadcast, ...state.broadcasts] }));
          // Also push to global notifications
          const notif = { id: Date.now() + 1, text: `${user.name}: ${data.title}`, time: 'Just now', read: false, isUrgent: data.isUrgent || false };
          set((state) => ({ notifications: [notif, ...state.notifications], activeToast: notif }));
        },

        // ─── RATING ACTIONS ───
        submitRating: (lecturerId, courseId, rating, comment) => {
          const { user } = get();
          set((state) => ({
            lecturerRatings: [...state.lecturerRatings.filter(r => !(r.lecturerId === lecturerId && r.studentId === user.id && r.courseId === courseId)), {
              id: Date.now(),
              lecturerId,
              studentId: user.id,
              courseId,
              rating,
              comment,
              date: new Date().toISOString().split('T')[0]
            }]
          }));
        },

        // ─── ADMIN ACTIONS ───
        adminViewAs: null,
        setAdminViewAs: (role) => set({ adminViewAs: role }),

        // ─── ACADEMIC CALENDAR ───
        // The institution moves through (session, semester) terms with exactly one
        // registration window open at a time. These four guided transitions are the
        // ONLY way the calendar changes. Promotion is a SEPARATE concern
        // (setStudentLevel / promoteStudents) and never happens here.
        openRegistration: () => {
          set((state) => ({
            semesterOpen: true,
            notifications: [
              { id: Date.now(), text: `Course registration for the ${state.currentSemester} semester (${state.currentSession}) is now open.`, time: 'Just now', read: false, isUrgent: true, target: 'student' },
              ...state.notifications,
            ],
          }));
        },
        closeRegistration: () => {
          set((state) => {
            if (!state.semesterOpen) return {};
            return {
              semesterOpen: false,
              notifications: [
                { id: Date.now(), text: `Registration for the ${state.currentSemester} semester (${state.currentSession}) is now closed.`, time: 'Just now', read: false, isUrgent: true, target: 'student' },
                ...state.notifications,
              ],
            };
          });
        },
        // 1st -> 2nd semester within the same session (registration starts closed).
        // Registration carries over within a session, so enrolments are NOT reset.
        advanceSemester: () => {
          const state = get();
          if (state.currentSemester !== '1st') {
            return { success: false, error: 'Already in the second semester — begin a new session instead.' };
          }
          set((s) => ({
            currentSemester: '2nd',
            semesterOpen: false,
            notifications: [
              { id: Date.now(), text: `The second semester (${s.currentSession}) has begun. Registration will open when the registrar opens it.`, time: 'Just now', read: false, isUrgent: true, target: 'student' },
              ...s.notifications,
            ],
          }));
          return { success: true };
        },
        // Begin a new academic session: back to 1st semester, locked, and every
        // student's registration is reset for the new year. Does NOT change levels.
        beginNewSession: (sessionLabel) => {
          const state = get();
          const s = String(sessionLabel || nextSession(state.currentSession) || '').trim();
          if (!s) return { success: false, error: 'A session value is required.' };
          const reset = (u) => (u && u.role === 'student') ? { ...u, enrolledCourseIds: [] } : u;
          set((st) => ({
            currentSession: s,
            currentSemester: '1st',
            semesterOpen: false,
            sessionHistory: [...(st.sessionHistory || []), { session: st.currentSession, closedAt: new Date().toISOString() }],
            dynamicUsers: st.dynamicUsers.map(reset),
            user: reset(st.user),
            notifications: [
              { id: Date.now(), text: `The ${s} academic session has begun. Registration reopens once the registrar opens the first semester.`, time: 'Just now', read: false, isUrgent: true, target: 'student' },
              ...st.notifications,
            ],
          }));
          return { success: true, session: s };
        },

        addUser: (userData) => {
          const allUsers = get().getAllUsers();
          const targetId = (userData.role === 'student' ? userData.matNo : userData.staffId);

          // Role-scoped uniqueness check (mirrors signup logic)
          const isDuplicate = allUsers.some(u => {
            if (userData.role === 'student') {
              return u.role === 'student' && u.matNo === targetId && u.program === userData.program;
            } else {
              const uStaffId = u.staffId || (u.role !== 'student' ? u.id : null);
              return u.role !== 'student' && uStaffId === targetId;
            }
          });

          if (isDuplicate) {
            return { 
              success: false, 
              error: userData.role === 'student'
                ? `Matric number ${targetId} is already registered in the ${userData.program} department.`
                : `Staff ID ${targetId} is already registered in the system.`
            };
          }

          const surname = userData.name.split(' ').pop().toLowerCase();
          const storedId = userData.role === 'student'
            ? `${targetId}_${(userData.program || 'GEN').replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase()}`
            : targetId;

          const newUser = {
            ...userData,
            level: userData.role === 'student' ? (userData.level || '100L') : userData.level,
            id: storedId || (userData.role + '-' + Date.now()),
            matNo: targetId,
            password: surname,
            avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            status: 'active'
          };
          set(state => ({ dynamicUsers: [...state.dynamicUsers, newUser] }));
          return { success: true };
        },

        addBroadcast: (text, target = 'all') => {
          const { user } = get();
          const newNotif = { 
            id: Date.now(), 
            text: `[ANN] ${text}`, 
            time: 'Just now', 
            read: false, 
            isUrgent: true,
            target 
          };
          set((state) => ({
            notifications: [newNotif, ...state.notifications],
            activeToast: newNotif,
            broadcasts: [{ 
              id: Date.now(), 
              from: user?.id || 'admin', 
              fromName: user?.name || 'Administrator', 
              title: 'System Directive',
              message: text,
              target,
              timestamp: new Date().toISOString(),
              isUrgent: true 
            }, ...state.broadcasts]
          }));
        },

        deleteUser: (userId) => {
          set((state) => ({
            dynamicUsers: state.dynamicUsers.filter(u => u.id !== userId),
            excludedIds: [...state.excludedIds, userId]
          }));
        },

        resetPassword: (userId, newPassword) => {
          set((state) => {
            const isDynamic = state.dynamicUsers.some(u => u.id === userId);
            if (isDynamic) {
              return {
                dynamicUsers: state.dynamicUsers.map(u => 
                  u.id === userId ? { ...u, password: newPassword } : u
                )
              };
            } else {
              const mockUser = MOCK_DB.users.find(u => u.id === userId);
              const updatedUser = { ...mockUser, password: newPassword };
              const freshDynamic = state.dynamicUsers.filter(u => u.id !== userId);
              return { dynamicUsers: [...freshDynamic, updatedUser] };
            }
          });
          return { success: true };
        },

        resetToDefaultPassword: (userId) => {
          const users = get().getAllUsers();
          const target = users.find(u => u.id === userId);
          if (!target) return { success: false, error: 'User not found' };
          
          const surname = target.name.split(' ').pop().toLowerCase();
          const isDynamic = get().dynamicUsers.some(u => u.id === userId);

          set((state) => {
            if (isDynamic) {
              return {
                dynamicUsers: state.dynamicUsers.map(u => 
                  u.id === userId ? { ...u, password: surname } : u
                )
              };
            } else {
              const mockUser = MOCK_DB.users.find(u => u.id === userId);
              const updatedUser = { ...mockUser, password: surname };
              const freshDynamic = state.dynamicUsers.filter(u => u.id !== userId);
              return { dynamicUsers: [...freshDynamic, updatedUser] };
            }
          });
          return { success: true };
        },

        toggleUserStatus: (userId) => {
          set((state) => {
            const isDynamic = state.dynamicUsers.some(u => u.id === userId);
            if (isDynamic) {
              return {
                dynamicUsers: state.dynamicUsers.map(u => 
                  u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
                )
              };
            } else {
              const mockUser = MOCK_DB.users.find(u => u.id === userId);
              const updatedUser = { ...mockUser, status: mockUser.status === 'active' ? 'inactive' : 'active' };
              const freshDynamic = state.dynamicUsers.filter(u => u.id !== userId);
              return { dynamicUsers: [...freshDynamic, updatedUser] };
            }
          });
        },

        enrollInCourse: (courseId) => {
          const state = get();
          const { user } = state;
          if (!user || user.role !== 'student') return;

          // One rule, shared with the registration page (registrationEligibility).
          const course = state.courses.find(c => c.id === courseId);
          if (!state.registrationEligibility(course, user).ok) return;

          // Materialize the implicit program+level registration the first time the
          // student curates it, so add/drop stays coherent with what they see.
          const baseIds = state.getStudentCourseIds(user);
          if (baseIds.includes(courseId)) return;

          const newUser = { ...user, enrolledCourseIds: [...baseIds, courseId] };
          set((s) => ({
            user: newUser,
            dynamicUsers: s.dynamicUsers.map(u => u.id === user.id ? newUser : u)
          }));
        },

        unenrollFromCourse: (courseId) => {
          const state = get();
          const { user } = state;
          if (!user || user.role !== 'student') return;

          const baseIds = state.getStudentCourseIds(user);
          const newUser = { ...user, enrolledCourseIds: baseIds.filter(id => id !== courseId) };
          set((s) => ({
            user: newUser,
            dynamicUsers: s.dynamicUsers.map(u => u.id === user.id ? newUser : u)
          }));
        },

        scheduleSession: (courseId, dateTime) => {
          const { courses } = get();
          const targetCourse = courses.find(c => c.id === courseId);
          if (!targetCourse) return;

          const newScheduled = {
            id: Date.now(),
            courseId,
            courseCode: targetCourse.code,
            title: targetCourse.title,
            dateTime: dateTime,
            lecturerName: get().user.name
          };

          set(state => ({
            scheduledSessions: [...state.scheduledSessions, newScheduled]
          }));
        },

        deleteScheduledSession: (id) => {
           set(state => ({
             scheduledSessions: state.scheduledSessions.filter(s => s.id !== id)
           }));
        },

        // ─── STUDENT COURSE SELECTORS (single source of truth) ───
        // A student's courses = their explicit registration (enrolledCourseIds),
        // or, until they register, the catalogue for their program + level.
        // Every page MUST derive a student's courses from these, not ad-hoc filters.
        getStudentCourseIds: (targetUser) => {
          const state = get();
          const u = targetUser || state.user;
          if (!u || u.role !== 'student') return [];
          if (u.enrolledCourseIds?.length) return u.enrolledCourseIds;
          return state.courses
            .filter(c => c.program === u.program && c.level === u.level)
            .map(c => c.id);
        },
        getStudentCourses: (targetUser) => {
          const state = get();
          const ids = state.getStudentCourseIds(targetUser);
          return state.courses.filter(c => ids.includes(c.id));
        },

        // Single source of truth for "can this student register for this course".
        // Used by enrollInCourse (the store guard) AND the registration page (UI),
        // so the rule can never drift between them. Returns { ok, reason, detail }.
        // reason: 'closed' | 'level' | 'semester' | 'not-student' | 'unknown' | null
        registrationEligibility: (course, targetUser) => {
          const state = get();
          const u = targetUser || state.user;
          if (!u || u.role !== 'student') return { ok: false, reason: 'not-student' };
          if (!state.semesterOpen) return { ok: false, reason: 'closed' };
          if (!course) return { ok: false, reason: 'unknown' };
          if (course.level && u.level && course.level !== u.level) {
            return { ok: false, reason: 'level', detail: course.level };
          }
          const courseSem = course.semester || semesterFromCode(course.code);
          if (courseSem && state.currentSemester && courseSem !== state.currentSemester) {
            return { ok: false, reason: 'semester', detail: courseSem };
          }
          return { ok: true, reason: null };
        },

        // ─── ANALYTICS HELPERS ───
        getLecturerModules: (lecturerId) => {
          return get().getLecturerRegisteredCourses(lecturerId);
        },
        getModuleEnrolmentCount: (courseId) => {
          const state = get();
          return state.getAllUsers().filter(u => u.role === 'student' && state.getStudentCourseIds(u).includes(courseId)).length;
        },
        getLecturerTotalStudents: (lecturerId) => {
          const state = get();
          const myCourseIds = state.getLecturerModules(lecturerId).map(c => c.id);
          return state.getAllUsers().filter(u => u.role === 'student' && state.getStudentCourseIds(u).some(id => myCourseIds.includes(id))).length;
        },
        getRecentSubmissions: (lecturerId, limit = 5) => {
          const { assignments, submissions } = get();
          const myCourseIds = get().getLecturerRegisteredCourses(lecturerId).map(c => c.id);
          const myAssignmentIds = assignments.filter(a => myCourseIds.includes(a.courseId)).map(a => a.id);
          
          return submissions
            .filter(s => myAssignmentIds.includes(s.assignmentId))
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, limit);
        },

        // ─── LECTURER COURSE REG ACTIONS ───
        setLecturerCourseRegWindow: (config) => set((state) => ({
          lecturerCourseRegWindow: { ...state.lecturerCourseRegWindow, ...config },
          lecturerRegOverrides: [], // clear individual overrides when window changes
        })),
        openLecturerCourseReg: (startDate, endDate, semester, session) => {
          set((state) => ({
            lecturerCourseRegWindow: { open: true, startDate, endDate, semester, session },
            lecturerRegOverrides: [],
            notifications: [
              { id: Date.now(), text: `Lecturer course registration for ${semester} semester (${session}) is now open. Deadline: ${new Date(endDate).toLocaleDateString()}.`, time: 'Just now', read: false, isUrgent: true, target: 'lecturer' },
              ...state.notifications,
            ],
          }));
        },
        closeLecturerCourseReg: () => {
          set((state) => ({
            lecturerCourseRegWindow: { ...state.lecturerCourseRegWindow, open: false },
            lecturerRegOverrides: [],
            notifications: [
              { id: Date.now(), text: 'Lecturer course registration has been closed by the admin.', time: 'Just now', read: false, isUrgent: true, target: 'lecturer' },
              ...state.notifications,
            ],
          }));
        },
        overrideLecturerReg: (lecturerId) => {
          set((state) => ({
            lecturerRegOverrides: state.lecturerRegOverrides.includes(lecturerId)
              ? state.lecturerRegOverrides
              : [...state.lecturerRegOverrides, lecturerId],
          }));
        },
        revokeOverrideLecturerReg: (lecturerId) => {
          set((state) => ({
            lecturerRegOverrides: state.lecturerRegOverrides.filter(id => id !== lecturerId),
          }));
        },
        // Returns whether registration is currently editable for a given lecturer
        isLecturerRegEditable: (lecturerId) => {
          const state = get();
          const win = state.lecturerCourseRegWindow;
          if (state.lecturerRegOverrides.includes(lecturerId)) return true;
          if (!win.open) return false;
          const now = Date.now();
          if (win.startDate && now < new Date(win.startDate).getTime()) return false;
          if (win.endDate && now > new Date(win.endDate).getTime()) return false;
          return true;
        },
        saveLecturerCourseSelection: (lecturerId, courseIds) => {
          set((state) => ({
            lecturerCourseRegistrations: {
              ...state.lecturerCourseRegistrations,
              [lecturerId]: { courseIds, submittedAt: null },
            },
          }));
        },
        submitLecturerCourseRegistration: (lecturerId, courseIds) => {
          set((state) => {
            const allUsers = [...MOCK_DB.users, ...state.dynamicUsers.filter(u => !state.excludedIds.includes(u.id))];
            const lecturer = allUsers.find(u => u.id === lecturerId);
            
            const oldReg = state.lecturerCourseRegistrations[lecturerId]?.courseIds || [];
            const removedIds = oldReg.filter(id => !courseIds.includes(id));
            
            const updatedCourses = state.courses.map(c => {
              if (courseIds.includes(c.id)) {
                return { ...c, lecturerId, lecturerName: lecturer?.name };
              } else if (removedIds.includes(c.id) && c.lecturerId === lecturerId) {
                return { ...c, lecturerId: null, lecturerName: null };
              }
              return c;
            });

            return {
              courses: updatedCourses,
              lecturerCourseRegistrations: {
                ...state.lecturerCourseRegistrations,
                [lecturerId]: { courseIds, submittedAt: new Date().toISOString() },
              },
              lecturerRegOverrides: state.lecturerRegOverrides.filter(id => id !== lecturerId),
            };
          });
        },
        getLecturerRegisteredCourses: (lecturerId) => {
          const state = get();
          const reg = state.lecturerCourseRegistrations[lecturerId];
          // If no active registration object exists for this lecturer, fallback to checking static course properties
          if (!reg) return state.courses.filter(c => c.lecturerId === lecturerId);
          return state.courses.filter(c => reg.courseIds.some(id => String(id) === String(c.id)));
        },

        // Returns the lecturer user object for a given courseId.
        // Reads from lecturerCourseRegistrations (persisted) rather than
        // course.lecturerId, which is wiped on reload by the seed-course merge.
        getCourseAssignedLecturer: (courseId) => {
          const state = get();
          const regs = state.lecturerCourseRegistrations;
          const allUsers = state.getAllUsers();
          // Find the first submitted registration that includes this courseId
          const lecturerId = Object.keys(regs).find(lid => {
            const reg = regs[lid];
            return reg.submittedAt && reg.courseIds.some(id => String(id) === String(courseId));
          });
          if (!lecturerId) {
            // Fall back to the static lecturerId baked into the course (legacy seed data)
            const course = state.courses.find(c => String(c.id) === String(courseId));
            if (!course?.lecturerId) return null;
            return allUsers.find(u => u.id === course.lecturerId) || null;
          }
          return allUsers.find(u => u.id === lecturerId) || null;
        },

        // ─── COURSE ACTIONS ───
        addCourse: (courseData) => set((state) => ({
          courses: [...state.courses, { ...courseData, id: courseData.id || Date.now() }]
        })),
        updateCourse: (courseId, courseData) => set((state) => ({
          courses: state.courses.map(c => c.id === courseId ? { ...c, ...courseData } : c)
        })),
        deleteCourse: (courseId) => set((state) => ({
          courses: state.courses.filter(c => c.id !== courseId)
        })),

        adminToggleEnrollment: (studentId, courseId) => {
          set((state) => {
            const dynamicUsers = state.dynamicUsers.map(u => {
              if (u.id === studentId) {
                const enrolled = u.enrolledCourseIds || [];
                const alreadyEnrolled = enrolled.includes(courseId);
                return {
                  ...u,
                  enrolledCourseIds: alreadyEnrolled 
                    ? enrolled.filter(id => id !== courseId)
                    : [...enrolled, courseId]
                };
              }
              return u;
            });

            // Update active user if they are the one being edited
            const activeUser = state.user?.id === studentId 
              ? dynamicUsers.find(u => u.id === studentId) 
              : state.user;

            return { dynamicUsers, user: activeUser };
          });
        },

        // Set a single student's level (admin Directory editor). Deliberate, never
        // automatic. Changing a level resets that student's registration.
        setStudentLevel: (userId, level) => {
          const valid = ['100L', '200L', '300L', '400L', 'Graduated'];
          if (!valid.includes(level)) return;
          const apply = (u) => (u && u.id === userId && u.role === 'student')
            ? { ...u, level, enrolledCourseIds: [], graduated: level === 'Graduated' }
            : u;
          set((state) => ({
            dynamicUsers: state.dynamicUsers.map(apply),
            user: apply(state.user),
          }));
        },

        // Bulk, deliberate promotion (registrar tool). Advances active students one
        // level; 400L students graduate. Optionally limited to opts.scope (an array
        // of student ids). Never automatic — only run from the admin Promote tool.
        promoteStudents: (opts = {}) => {
          const order = ['100L', '200L', '300L', '400L'];
          const ids = Array.isArray(opts.scope) ? new Set(opts.scope) : null;
          const nextLvl = (lvl) => {
            const i = order.indexOf(lvl);
            if (i === -1) return lvl;
            return i < order.length - 1 ? order[i + 1] : 'Graduated';
          };
          let promoted = 0;
          const apply = (u) => {
            if (!u || u.role !== 'student' || u.level === 'Graduated') return u;
            if (ids && !ids.has(u.id)) return u;
            const nl = nextLvl(u.level);
            if (nl === u.level) return u;
            promoted += 1;
            return { ...u, level: nl, enrolledCourseIds: [], graduated: nl === 'Graduated' };
          };
          set((state) => ({
            dynamicUsers: state.dynamicUsers.map(apply),
            user: apply(state.user),
          }));
          return { promoted };
        },
      };
    },
    {
      name: 'lms-database-storage-v13',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
      // Persist dynamic/user-specific data. Seed courses stay in code (source of
      // truth), but we persist `courses` so admin/lecturer-created courses — and
      // any student enrolment in them — survive a reload instead of dangling.
      // The custom merge below keeps seed courses authoritative and re-applies
      // only the runtime-created (non-seed) ones.
      partialize: (state) => ({
        user: state.user,
        dynamicUsers: state.dynamicUsers,
        excludedIds: state.excludedIds,
        notes: state.notes,
        courses: state.courses,
        currentSession: state.currentSession,
        currentSemester: state.currentSemester,
        semesterOpen: state.semesterOpen,
        sessionHistory: state.sessionHistory,
        liveSessions: state.liveSessions,
        scheduledSessions: state.scheduledSessions,
        auditingUser: state.auditingUser,
        lecturerPortalActive: state.lecturerPortalActive,
        notifications: state.notifications,
        submissions: state.submissions,
        quizResults: state.quizResults,
        quizAttempts: state.quizAttempts,
        messages: state.messages,
        lecturerRatings: state.lecturerRatings,
        broadcasts: state.broadcasts,
        sessionMessages: state.sessionMessages,
        callHistory: state.callHistory,
        materials: state.materials,
        lecturerCourseRegWindow: state.lecturerCourseRegWindow,
        lecturerCourseRegistrations: state.lecturerCourseRegistrations,
        lecturerRegOverrides: state.lecturerRegOverrides,
      }),
      merge: (persisted, current) => {
        const p = persisted || {};
        // Seed courses always come from code; preserve only runtime-created
        // (non-seed) courses from storage so enrolments in them don't dangle.
        const seedIds = new Set(current.courses.map(c => c.id));
        const dynamicCourses = (p.courses || []).filter(c => !seedIds.has(c.id));
        return {
          ...current,
          ...p,
          courses: [...current.courses, ...dynamicCourses],
        };
      },
    }
  )
);
