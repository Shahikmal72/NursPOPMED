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

    // Missed medication alerts (eMAR Overdue)
    db.patients.forEach(patient => {
        patient.medications.forEach(med => {
            const due = new Date(med.timeDue);
            const diffInMinutes = (now - due) / (1000 * 60);
            
            if (med.status === 'Pending') {
                if (diffInMinutes > 60) { // Overdue by more than 1 hour
                    alerts.push({
                        type: 'critical',
                        title: 'eMAR Overdue',
                        message: `Bed ${patient.bedNumber}: ${med.name} was due at ${formatDateTime(med.timeDue)}`,
                        bedNumber: patient.bedNumber
                    });
                } else if (diffInMinutes < 0 && Math.abs(diffInMinutes) < 30) { // Due within 30 mins
                    alerts.push({
                        type: 'warning',
                        title: 'Upcoming Administration',
                        message: `Bed ${patient.bedNumber}: ${med.name} due soon at ${formatDateTime(med.timeDue)}`,
                        bedNumber: patient.bedNumber
                    });
                }
            }
        });
    });

    // Pharmacy Inventory Management (PAR Level Alerts)
    db.inventory.forEach(item => {
        if (item.quantity < item.parLevel) {
            alerts.push({
                type: 'stock',
                title: 'Low PAR Level Alert',
                message: `${item.name} (${item.quantity} remaining. PAR: ${item.parLevel})`
            });
        }
        
        const expiry = new Date(item.expiry);
        const daysToExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
        
        if (daysToExpiry < 30 && daysToExpiry > 0) {
            alerts.push({
                type: 'expiry',
                title: 'Near Expiry Alert',
                message: `${item.name} expires on ${item.expiry} (Lot: ${item.batch})`
            });
        } else if (daysToExpiry <= 0) {
            alerts.push({
                type: 'critical',
                title: 'EXPIRED PRODUCT - DO NOT DISPENSE',
                message: `${item.name} expired on ${item.expiry}. Quarantining required.`
            });
        }

        if (item.isControlled && item.quantity % 1 !== 0) { // Security Check for Controlled Drugs
             alerts.push({
                type: 'security',
                title: 'Controlled Drug Discrepancy',
                message: `Audit required for ${item.name} (Batch: ${item.batch})`
            });
        }
    });

    return alerts;
}

/**
 * Core Clinical Verification Engine (BCMA + 5 Rights)
 */
function validate5Rights(patient, medication, scannedMRN, scannedMedCode) {
    const results = {
        patient: { pass: false, message: 'Right Patient' },
        drug: { pass: false, message: 'Right Drug' },
        dose: { pass: false, message: 'Right Dose' },
        route: { pass: false, message: 'Right Route' },
        time: { pass: false, message: 'Right Time' },
        isAllValid: false,
        criticalStop: false
    };

    // 1. Right Patient (BCMA)
    if (scannedMRN === patient.info.mrn) {
        results.patient.pass = true;
    } else {
        results.patient.message = 'Wrong Patient: MRN mismatch.';
        results.criticalStop = true;
    }

    // 2. Right Drug (BCMA)
    if (scannedMedCode === medication.barcode) {
        results.drug.pass = true;
    } else {
        results.drug.message = 'Wrong Drug: Barcode mismatch.';
        results.criticalStop = true;
    }

    // 3. Right Dose (Simulation check)
    results.dose.pass = true; 

    // 4. Right Route (Simulation check)
    results.route.pass = true;

    // 5. Right Time (Clinical decision window: ±60 mins)
    const now = new Date();
    const due = new Date(medication.timeDue);
    const timeDiff = (now - due) / (1000 * 60); // minutes

    if (Math.abs(timeDiff) <= 60) {
        results.time.pass = true;
    } else if (timeDiff < -60) {
        results.time.message = 'Early Administration Warning.';
    } else {
        results.time.message = 'Late Administration Warning.';
    }

    // Allergy Cross-Check (Clinical Decision Support)
    if (patient.info.allergies !== 'None (NKDA)' && medication.name.toLowerCase().includes(patient.info.allergies.toLowerCase())) {
        results.drug.message = `CONTRAINDICATION: Patient allergic to ${patient.info.allergies}.`;
        results.drug.pass = false;
        results.criticalStop = true;
    }

    results.isAllValid = results.patient.pass && results.drug.pass && results.dose.pass && results.route.pass && results.time.pass;
    
    return results;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-2xl shadow-2xl z-[600] text-white transition-all transform translate-y-0 opacity-100 flex items-center gap-3 border ${
        type === 'error' ? 'bg-red-600 border-red-500' : type === 'success' ? 'bg-green-600 border-green-500' : 'bg-blue-600 border-blue-500'
    }`;
    
    const icon = type === 'success' ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>' :
                 type === 'error' ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>' :
                 '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

    notification.innerHTML = `${icon} <p class="text-[10px] font-black uppercase tracking-widest">${message}</p>`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

/**
 * Clinical Safety Alert Modal (High Alert / LASA)
 * Enhanced with Second Verification Tick as requested
 */
window.showClinicalSafetyAlert = function(medName, type, details, onConfirm) {
    const modal = document.createElement('div');
    modal.id = 'safety-alert-modal';
    modal.className = 'fixed inset-0 bg-red-950/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-6 animate-fade-in';
    
    const isHighAlert = type === 'HIGH_ALERT';
    const isLASA = type === 'LASA';
    
    modal.innerHTML = `
        <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden transform animate-shake border-4 border-red-500">
            <div class="bg-red-600 p-8 text-white text-center">
                <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 class="text-2xl font-black uppercase tracking-tighter mb-1">${isHighAlert ? 'High Alert Medication' : 'LASA Warning'}</h2>
                <p class="text-red-100 font-bold text-xs uppercase tracking-widest">Clinical Safety Protocol Required</p>
            </div>

            <div class="p-10 space-y-6">
                <div class="text-center">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medication Identified</p>
                    <h3 class="text-2xl font-black text-slate-900">${medName}</h3>
                </div>

                <div class="p-6 bg-red-50 rounded-2xl border border-red-100">
                    <p class="text-red-800 font-bold text-sm leading-relaxed text-center italic">"${details}"</p>
                </div>

                <div class="space-y-4">
                    ${isHighAlert ? `
                        <div class="flex items-start gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <input type="checkbox" id="second-verification-tick" class="w-6 h-6 rounded-lg border-slate-300 text-red-600 focus:ring-red-500 mt-0.5 cursor-pointer">
                            <label for="second-verification-tick" class="text-[11px] font-black text-slate-700 cursor-pointer leading-tight uppercase">
                                I have performed a **Second Independent Verification** of this dosage, patient identity, and drug integrity.
                            </label>
                        </div>
                    ` : ''}
                    
                    <div class="flex gap-3">
                        <button onclick="document.getElementById('safety-alert-modal').remove()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Cancel Action</button>
                        <button id="confirm-safety-btn" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all transform active:scale-95">Acknowledge & Proceed</button>
                    </div>
                </div>
            </div>
            
            <div class="bg-slate-50 p-4 border-t border-slate-100 text-center">
                <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Safety Protocol ID: POPMED-SEC-99</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    document.getElementById('confirm-safety-btn').onclick = () => {
        if (isHighAlert) {
            const tick = document.getElementById('second-verification-tick');
            if (!tick || !tick.checked) {
                showNotification('Safety Check: Second verification tick required.', 'error');
                return;
            }
        }
        modal.remove();
        if (onConfirm) onConfirm();
    };
}

// Advanced Inventory Search Utility (FIFO - First Expire First Out)
function findInventoryItem(db, medName) {
    if (!medName) return null;
    
    // Normalize names by removing common suffixes and punctuation
    const normalize = (name) => name.toLowerCase()
        .replace(/tab|tablet|cap|capsule|inj|injection|iv|susp|suspension|mg|ml|units/g, '')
        .replace(/[\(\)%\/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const cleanSearch = normalize(medName);
    
    // Filter active inventory
    const activeInventory = db.inventory.filter(item => !item.unusable && item.quantity > 0);
    
    // Sort by expiry date (FIFO logic)
    activeInventory.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    // Priority 1: Exact Match
    let found = activeInventory.find(item => item.name === medName);
    if (found) return found;

    // Priority 2: Case-insensitive Match
    found = activeInventory.find(item => item.name.toLowerCase() === medName.toLowerCase());
    if (found) return found;

    // Priority 3: Normalized Fuzzy Match
    found = activeInventory.find(item => {
        const cleanItemName = normalize(item.name);
        return cleanItemName === cleanSearch || 
               item.name.toLowerCase().includes(medName.toLowerCase()) || 
               medName.toLowerCase().includes(item.name.toLowerCase()) ||
               cleanItemName.includes(cleanSearch) ||
               cleanSearch.includes(cleanItemName);
    });

    return found;
}
