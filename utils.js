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
    if (med.status === 'Administered' || med.status === 'Given') return 'Green';
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

    // 2. Right Drug (Internal Verification)
    // In simplified workflow, if scannedMedCode is medication.barcode or empty, we consider it passed
    // unless there is a specific mismatch.
    if (!scannedMedCode || scannedMedCode === medication.barcode) {
        results.drug.pass = true;
    } else {
        results.drug.message = 'Wrong Drug: Identification mismatch.';
        results.criticalStop = true;
    }

    // 3. Right Dose (Simulation check)
    results.dose.pass = !!medication.dose; 

    // 4. Right Route (Simulation check)
    results.route.pass = !!medication.route;

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

    // Allergy Cross-Check (Clinical Decision Support) - ALWAYS ENFORCED
    if (patient.info.allergies && patient.info.allergies !== 'None (NKDA)') {
        if (medication.name.toLowerCase().includes(patient.info.allergies.toLowerCase())) {
            results.drug.message = `CONTRAINDICATION: Patient allergic to ${patient.info.allergies}.`;
            results.drug.pass = false;
            results.criticalStop = true;
        }
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
 * Medication Clinical Database for Health Education (HE)
 * Includes clinical purpose, instructions, side effects, and Shariah compliance
 */
const medicationInfo = {
    "Insulin": {
        purpose: "To control blood glucose (sugar) levels in diabetes mellitus. It helps move sugar from the blood into your cells for energy.",
        instructions: "Inject subcutaneously (under the skin) as prescribed. Rotate injection sites. **IMPORTANT: Do not skip meals after injection to prevent low blood sugar.**",
        sideEffects: ["Hypoglycemia (Low blood sugar)", "Dizziness or shakiness", "Sweating", "Hunger", "Irritability"],
        highAlert: true,
        containsPorcine: false
    },
    "Heparin": {
        purpose: "An anticoagulant (blood thinner) used to prevent the formation of harmful blood clots in the blood vessels.",
        instructions: "Administer as prescribed via injection. Monitor for any unusual bleeding or bruising. Use a soft toothbrush.",
        sideEffects: ["Unusual bleeding", "Easy bruising", "Pain at injection site"],
        highAlert: true,
        containsPorcine: true
    },
    "Paracetamol": {
        purpose: "Used to treat mild to moderate pain (from headaches, menstrual periods, toothaches, backaches, osteoarthritis, or cold/flu aches and pains) and to reduce fever.",
        instructions: "Take orally after food as prescribed. Do not exceed the maximum daily dose (4g).",
        sideEffects: ["Rare allergic reactions", "Liver toxicity only if maximum dose exceeded"],
        highAlert: false,
        containsPorcine: false
    },
    "Aspirin": {
        purpose: "Used to reduce fever and relieve mild to moderate pain. Also used as a blood thinner to prevent heart attacks and strokes.",
        instructions: "Take with food or a full glass of water to avoid stomach upset.",
        sideEffects: ["Stomach upset", "Heartburn", "Easy bruising/bleeding"],
        highAlert: false,
        containsPorcine: false
    },
    "Ceftriaxone": {
        purpose: "A broad-spectrum antibiotic used to treat various bacterial infections.",
        instructions: "Must be administered via injection (IV or IM). Complete the full course even if feeling better.",
        sideEffects: ["Diarrhea", "Nausea", "Rash at injection site"],
        highAlert: false,
        containsPorcine: false
    },
    "Metformin": {
        purpose: "An oral diabetes medicine that helps control blood sugar levels.",
        instructions: "Take with meals to reduce stomach or bowel side effects.",
        sideEffects: ["Nausea", "Stomach upset", "Metallic taste in mouth"],
        highAlert: false,
        containsPorcine: false
    },
    "Warfarin": {
        purpose: "A blood thinner used to treat or prevent blood clots in veins, arteries, lungs, or heart.",
        instructions: "Take at the same time every day. Regular blood tests (INR) are mandatory.",
        sideEffects: ["Bleeding", "Bruising", "Red or brown urine"],
        highAlert: true,
        containsPorcine: false
    }
};

/**
 * Helper: Generate High-Alert Warning Section
 */
function generateHighAlertWarning(info) {
    if (!info.highAlert) return "";

    return `
        <div style="background: #fef2f2; border: 2px solid #ef4444; padding: 20px; border-radius: 16px; margin: 20px 0; display: flex; gap: 15px; align-items: flex-start;">
            <div style="font-size: 24px;">⚠️</div>
            <div>
                <p style="color: #b91c1c; font-weight: 900; text-transform: uppercase; margin: 0; font-size: 14px; letter-spacing: 0.05em;">High-Alert Medication Warning</p>
                <p style="font-size: 12px; font-weight: 600; color: #7f1d1d; margin: 5px 0 0 0; line-height: 1.4;">
                    This medication requires extra caution. It has a high risk of causing significant harm if used incorrectly. 
                    Please follow all instructions from your nurse or doctor strictly.
                </p>
            </div>
        </div>
    `;
}

/**
 * Helper: Generate Shariah Consent Notice
 */
function generateShariahNotice(info) {
    if (!info.containsPorcine) return "";

    return `
        <div style="background: #fffbeb; border: 2px solid #f59e0b; padding: 20px; border-radius: 16px; margin: 20px 0; border-style: dashed;">
            <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px;">
                <div style="font-size: 24px;">🕌</div>
                <p style="font-weight: 900; color: #92400e; margin: 0; text-transform: uppercase; font-size: 14px; letter-spacing: 0.05em;">Shariah Clinical Notice</p>
            </div>
            <p style="font-size: 12px; font-weight: 600; color: #78350f; margin: 0; line-height: 1.5;">
                This medication may contain porcine (non-halal) derivatives in its manufacturing process. 
                In Shariah (Islamic Law), its use is permissible in life-saving situations or when no halal alternatives are available (Dharurah). 
                Please consult your healthcare provider or hospital chaplain if you have concerns.
            </p>
            
            <div style="margin-top: 20px; border-top: 1px solid #fde68a; pt: 15px;">
                <p style="font-size: 11px; font-weight: 800; color: #92400e; margin-bottom: 15px;">ACKNOWLEDGEMENT OF INFORMATION</p>
                <div style="display: flex; gap: 40px;">
                    <div style="flex: 1;">
                        <div style="border-bottom: 1px solid #d97706; height: 30px; margin-bottom: 5px;"></div>
                        <p style="font-size: 9px; color: #ca8a04; font-weight: 700;">Patient / Guardian Signature</p>
                    </div>
                    <div style="flex: 1;">
                        <div style="border-bottom: 1px solid #d97706; height: 30px; margin-bottom: 5px;"></div>
                        <p style="font-size: 9px; color: #ca8a04; font-weight: 700;">Date & Time</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Health Education (HE) Pamphlet Generator
 * Professional A4 Layout for Patients (Medication Specific & Shariah Compliant)
 */
function generateHEPamphlet(patient, med) {
    // Fuzzy match medication info
    const medNameKey = Object.keys(medicationInfo).find(key => 
        med.name.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(med.name.toLowerCase())
    );
    
    const info = medicationInfo[medNameKey] || {
        purpose: "This medication is given to treat your clinical condition as prescribed by your attending doctor.",
        instructions: "Take exactly as instructed by your healthcare provider. Do not stop without medical advice.",
        sideEffects: ["Nausea", "Dizziness", "Mild stomach upset"],
        highAlert: false,
        containsPorcine: false
    };

    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Patient Education: ${med.name}</title>
            <style>
                @page { size: A4; margin: 2cm; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 40px; }
                .pamphlet-container { max-width: 800px; margin: auto; }
                .header { text-align: center; border-bottom: 4px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
                .hospital-name { font-size: 26px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: -0.02em; }
                .subtitle { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 5px; }
                
                .patient-box { background: #f8fafc; border-radius: 20px; padding: 25px; border: 1px solid #e2e8f0; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em; }
                .value { font-size: 15px; font-weight: 800; color: #0f172a; }
                
                .section { margin-bottom: 30px; }
                .section-title { font-size: 15px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; border-left: 5px solid #1e3a8a; padding-left: 15px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
                .section-content { font-size: 14px; font-weight: 500; padding-left: 20px; color: #334155; }
                
                .highlight-blue { background: #eff6ff; padding: 20px; border-radius: 16px; border-left: 5px solid #3b82f6; }
                .highlight-red { background: #fef2f2; padding: 20px; border-radius: 16px; border-left: 5px solid #ef4444; }
                
                .nurse-section { margin-top: 60px; padding-top: 25px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; }
                .no-print { margin-top: 50px; text-align: center; }
                .print-btn { background: #1e3a8a; color: white; border: none; padding: 15px 40px; border-radius: 16px; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.3s; }
                .print-btn:hover { background: #1e40af; transform: translateY(-2px); }
                
                ul { margin: 0; padding-left: 20px; }
                li { margin-bottom: 5px; font-weight: 600; color: #475569; }
                @media print { .no-print { display: none; } body { padding: 0; } }
            </style>
        </head>
        <body>
            <div class="pamphlet-container">
                <div class="header">
                    <div class="hospital-name">Kulliyyah of Nursing • IIUM</div>
                    <div class="subtitle">Official Medication Education Guide</div>
                </div>

                <div class="patient-box">
                    <div>
                        <div class="label">Recipient Name</div>
                        <div class="value">${patient.info.name}</div>
                    </div>
                    <div>
                        <div class="label">Registration No (MRN)</div>
                        <div class="value">${patient.info.mrn}</div>
                    </div>
                    <div>
                        <div class="label">Medication Agent</div>
                        <div class="value">${med.name}</div>
                    </div>
                    <div>
                        <div class="label">Prescribed Dose & Route</div>
                        <div class="value">${med.dose} • ${med.route}</div>
                    </div>
                </div>

                ${generateHighAlertWarning(info)}

                <div class="section">
                    <div class="section-title">💊 Purpose of Medication</div>
                    <div class="section-content highlight-blue">
                        ${info.purpose}
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">📋 How to Use (Instructions)</div>
                    <div class="section-content">
                        ${info.instructions}
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">⚠️ What to Watch For (Side Effects)</div>
                    <div class="section-content highlight-red">
                        <ul>
                            ${info.sideEffects.map(se => `<li>${se}</li>`).join('')}
                        </ul>
                        <p style="margin-top: 15px; font-weight: 800; color: #b91c1c; font-size: 12px;">
                            *** ALERT YOUR NURSE IMMEDIATELY if you experience itching, rash, swelling, or difficulty breathing. ***
                        </p>
                    </div>
                </div>

                ${generateShariahNotice(info)}

                <div class="nurse-section">
                    <div>
                        <div class="label">Clinical Educator</div>
                        ${generateNurseStamp(currentUser.fullname, currentUser.role)}
                    </div>
                    <div style="text-align: right;">
                        <div class="label">Education Date & Time</div>
                        <div class="value">${new Date().toLocaleString()}</div>
                    </div>
                </div>

                <div class="no-print">
                    <button class="print-btn" onclick="window.print()">🖨️ Print Education Sheet</button>
                </div>
            </div>
        </body>
        </html>
    `;

    const w = window.open('', '', 'width=900,height=850');
    w.document.write(content);
    w.document.close();
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
