// Utility functions for POPMED

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function generateLog(action, nurseId, details) {
    const db = getDB();
    const log = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action,
        nurseId,
        details
    };
    db.logs.push(log);
    updateDB(db);
}

function getMedicationStatus(med) {
    if (med.status === 'Administered') return 'Green';
    if (med.status === 'Dispensed') return 'Yellow';
    if (med.status === 'Missed') return 'Red';
    
    // Check for missed dose based on due time
    const now = new Date();
    const due = new Date(med.timeDue);
    if (now > due && med.status === 'Pending') {
        return 'Red';
    }
    return 'Yellow';
}

function checkAlerts() {
    const db = getDB();
    const now = new Date();
    const alerts = [];

    // Missed medication alerts
    db.patients.forEach(patient => {
        patient.medications.forEach(med => {
            const due = new Date(med.timeDue);
            if (now > due && med.status === 'Pending') {
                alerts.push({
                    type: 'critical',
                    title: 'Missed Dose',
                    message: `Bed ${patient.bedNumber}: ${med.name} was due at ${formatDateTime(med.timeDue)}`,
                    bedNumber: patient.bedNumber
                });
            } else if (now < due && (due - now) < 30 * 60 * 1000 && med.status === 'Pending') {
                alerts.push({
                    type: 'warning',
                    title: 'Upcoming Dose',
                    message: `Bed ${patient.bedNumber}: ${med.name} due soon at ${formatDateTime(med.timeDue)}`,
                    bedNumber: patient.bedNumber
                });
            }
        });
    });

    // Low stock alerts
    db.inventory.forEach(item => {
        if (item.quantity < 5) {
            alerts.push({
                type: 'stock',
                title: 'Low Inventory',
                message: `${item.name} (${item.quantity} units remaining)`
            });
        }
        const expiry = new Date(item.expiry);
        const daysToExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
        if (daysToExpiry < 30 && daysToExpiry > 0) {
            alerts.push({
                type: 'expiry',
                title: 'Near Expiry',
                message: `${item.name} expires on ${item.expiry}`
            });
        }
    });

    return alerts;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 text-white transition-all transform translate-y-0 opacity-100 ${
        type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    notification.innerText = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Advanced Inventory Search Utility
function findInventoryItem(db, medName) {
    if (!medName) return null;
    
    // Normalize names by removing common suffixes and punctuation
    const normalize = (name) => name.toLowerCase()
        .replace(/tab|tablet|cap|capsule|inj|injection|iv|susp|suspension|mg|ml|units/g, '')
        .replace(/[\(\)%\/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const cleanSearch = normalize(medName);
    
    // Priority 1: Exact Match
    let found = db.inventory.find(item => item.name === medName && !item.unusable);
    if (found) return found;

    // Priority 2: Case-insensitive Match
    found = db.inventory.find(item => item.name.toLowerCase() === medName.toLowerCase() && !item.unusable);
    if (found) return found;

    // Priority 3: Normalized Fuzzy Match
    found = db.inventory.find(item => {
        if (item.unusable) return false;
        const cleanItemName = normalize(item.name);
        return cleanItemName === cleanSearch || 
               item.name.toLowerCase().includes(medName.toLowerCase()) || 
               medName.toLowerCase().includes(item.name.toLowerCase()) ||
               cleanItemName.includes(cleanSearch) ||
               cleanSearch.includes(cleanItemName);
    });

    return found;
}
