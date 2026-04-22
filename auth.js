// Authentication and Session management

let currentUser = null;
let sessionTimeout = null;

function normalizeUserIdentifier(userId) {
    return (userId || '').trim().toLowerCase().replace(/\s+/g, '_');
}

function normalizeLooseUserIdentifier(userId) {
    return (userId || '')
        .trim()
        .toLowerCase()
        .replace(/^(mr|mrs|ms|miss|sir|dr)\.?\s+/i, '')
        .replace(/[^a-z0-9]/g, '');
}

function findUserInDB(userId, db = getDB()) {
    const normalizedInput = normalizeUserIdentifier(userId);
    const looseInput = normalizeLooseUserIdentifier(userId);

    return db.users.find(u => {
        const candidates = [
            u.id,
            u.fullname,
            u.id?.replace(/_/g, ' '),
            u.fullname?.replace(/\./g, '')
        ].filter(Boolean);

        return candidates.some(candidate =>
            normalizeUserIdentifier(candidate) === normalizedInput ||
            normalizeLooseUserIdentifier(candidate) === looseInput
        );
    }) || null;
}

function persistCurrentUserSession(user) {
    sessionStorage.setItem('popmed_user_id', user.id);
    sessionStorage.setItem('popmed_user', JSON.stringify(user));
}

function syncCurrentUserFromDB() {
    const db = getDB();
    const savedUserId = sessionStorage.getItem('popmed_user_id');
    const savedLegacyUser = sessionStorage.getItem('popmed_user');
    const candidateId = savedUserId || (savedLegacyUser ? JSON.parse(savedLegacyUser).id : '');
    const latestUser = candidateId ? findUserInDB(candidateId, db) : null;

    if (!latestUser) {
        currentUser = null;
        sessionStorage.removeItem('popmed_user_id');
        sessionStorage.removeItem('popmed_user');
        return null;
    }

    currentUser = latestUser;
    if (!currentUser.role) currentUser.role = 'Clinical Staff';
    persistCurrentUserSession(currentUser);
    return currentUser;
}

function login(userId, password) {
    const db = getDB();
    if (!userId || !password) return { success: false, message: 'Please enter both Clinical ID and Security Key.' };

    const user = findUserInDB(userId, db);
    
    if (user && String(user.password) === String(password).trim()) {
        currentUser = user;
        if (!currentUser.role) currentUser.role = 'Clinical Staff';
        
        persistCurrentUserSession(currentUser);
        resetSessionTimeout();
        generateLog('LOGIN', currentUser.id, 'User logged in');
        return { success: true, user: currentUser };
    }
    return { success: false, message: 'Access Denied: Invalid Clinical ID or Security Key.' };
}

function logout() {
    if (currentUser) {
        generateLog('LOGOUT', currentUser.id, 'User logged out');
        
        // Show personalized logout greeting
        const greetingModal = document.createElement('div');
        greetingModal.className = 'fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6 animate-fade-in';
        greetingModal.innerHTML = `
            <div class="bg-white rounded-[3rem] p-12 shadow-2xl max-w-sm w-full text-center transform animate-pop-in border border-white/20">
                <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 class="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Goodbye,</h2>
                <p class="text-xl font-extrabold text-blue-600 mb-6">${currentUser.fullname || currentUser.id.replace('_', ' ')}</p>
                <div class="space-y-4">
                    <p class="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Thank you for your clinical service today. Have a safe rest!</p>
                    <div class="pt-6">
                        <div class="w-12 h-1 bg-blue-100 mx-auto rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(greetingModal);

        // Delay reload to show greeting
        setTimeout(() => {
            currentUser = null;
            sessionStorage.removeItem('popmed_user_id');
            sessionStorage.removeItem('popmed_user');
            clearTimeout(sessionTimeout);
            window.location.reload();
        }, 3000);
    } else {
        window.location.reload();
    }
}

function resetSessionTimeout() {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    // Auto logout after 5 minutes of inactivity
    sessionTimeout = setTimeout(() => {
        alert('Session expired due to inactivity.');
        logout();
    }, 5 * 60 * 1000);
}

function checkAuth() {
    if (syncCurrentUserFromDB()) {
        resetSessionTimeout();
        return true;
    }
    return false;
}

window.isStaffNurse = function() {
    if (!currentUser) return false;
    // Strict Role-Based Access Control (SRBAC)
    // Only high-level nursing roles are authorized for clinical configuration and timing adjustments
    const authorizedNursingRoles = [
        'Director of Nursing', 
        'Assistant Director of Nursing', 
        'Advanced Nursing Practitioner',
        'Nurse Manager'
    ];
    return authorizedNursingRoles.includes(currentUser.role);
};

window.isMedicalDoctor = function() {
    if (!currentUser) return false;
    // Security Fix: Strict match for "Medical Doctor" only. 
    // Generic "Doctor" role is restricted to read-only or basic clinical viewing.
    return currentUser.role === 'Medical Doctor';
};

/**
 * Enhanced Security: Action Authorization Engine
 * Verifies if the current user is permitted to perform specific high-stakes actions
 */
window.isAuthorizedForAction = function(actionType) {
    if (!currentUser) return false;
    
    const role = currentUser.role;
    
    switch(actionType) {
        case 'MED_ADMINISTRATION':
            // Only Registered Nurses and Advanced Practitioners can administer medications
            return ['Nurse', 'Advanced Nursing Practitioner', 'Nurse Manager', 'Director of Nursing'].includes(role);
            
        case 'MED_DISPENSING':
            // Security Update: Doctors, Nurses, and Pharmacists are all authorized to dispense from ADC
            return ['Medical Doctor', 'Nurse', 'Pharmacist', 'Advanced Nursing Practitioner', 'Nurse Manager', 'Director of Nursing'].includes(role);
            
        case 'TIMING_ADJUSTMENT':
            // Only Senior Nursing staff can adjust clinical schedules
            return window.isStaffNurse();
            
        case 'PRESCRIPTION_ORDER':
            // ONLY Medical Doctors can issue new prescriptions. Generic "Doctor" role is blocked.
            return role === 'Medical Doctor';
            
        case 'IV_PREPARATION':
            // Authorized for Doctors, Nurses, and Advanced Practitioners
            return ['Medical Doctor', 'Nurse', 'Advanced Nursing Practitioner', 'Nurse Manager', 'Director of Nursing'].includes(role);
            
        case 'CONTROLLED_DRUG_ACCESS':
            // Requires double-verification or senior nursing role
            return ['Advanced Nursing Practitioner', 'Nurse Manager', 'Director of Nursing'].includes(role);
            
        default:
            return false;
    }
};

// Activity listeners for session timeout
window.addEventListener('mousedown', resetSessionTimeout);
window.addEventListener('keypress', resetSessionTimeout);
window.addEventListener('touchstart', resetSessionTimeout);
