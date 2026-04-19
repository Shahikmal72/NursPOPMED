// Authentication and Session management

let currentUser = null;
let sessionTimeout = null;

function login(userId, password) {
    const db = getDB();
    // Allow matching with either space or underscore for better usability
    const normalizedInput = userId.trim().replace(/\s+/g, '_');
    
    const user = db.users.find(u => 
        (u.id === userId || u.id === normalizedInput) && 
        u.password === password
    );
    
    if (user) {
        currentUser = user;
        sessionStorage.setItem('popmed_user', JSON.stringify(user));
        resetSessionTimeout();
        generateLog('LOGIN', user.id, 'User logged in');
        return true;
    }
    return false;
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
                <p class="text-xl font-extrabold text-blue-600 mb-6">${currentUser.id.replace('_', ' ')}</p>
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
    const savedUser = sessionStorage.getItem('popmed_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        resetSessionTimeout();
        return true;
    }
    return false;
}

window.isStaffNurse = function() {
    if (!currentUser) return false;
    const staffRoles = ['Clinical Medication Nurse', 'Nurse Officer', 'Nursing Informatics Specialist'];
    return staffRoles.includes(currentUser.role);
};

// Activity listeners for session timeout
window.addEventListener('mousedown', resetSessionTimeout);
window.addEventListener('keypress', resetSessionTimeout);
window.addEventListener('touchstart', resetSessionTimeout);
