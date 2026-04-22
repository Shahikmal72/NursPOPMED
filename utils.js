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

function resolveMedicationProtocol(db, medName) {
    let protocol = db.medicationProtocols[medName];
    let resolvedName = medName;

    const normalize = (name) => name.toLowerCase()
        .replace(/tab|tablet|cap|capsule|inj|injection|iv|susp|suspension|mg|ml|units/g, '')
        .replace(/[\(\)%\/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!protocol) {
        const keys = Object.keys(db.medicationProtocols);
        const cleanMedName = normalize(medName);

        const fuzzyKey = keys.find(key => {
            const cleanKey = normalize(key);
            return cleanKey === cleanMedName ||
                cleanKey.includes(cleanMedName) ||
                cleanMedName.includes(cleanKey) ||
                key.toLowerCase().includes(medName.toLowerCase()) ||
                medName.toLowerCase().includes(key.toLowerCase());
        });

        if (fuzzyKey) {
            protocol = db.medicationProtocols[fuzzyKey];
            resolvedName = fuzzyKey;
        }
    }

    return { protocol, resolvedName };
}

function getMedicationEducationBundle(medName, med = null, db = getDB()) {
    const { protocol, resolvedName } = resolveMedicationProtocol(db, medName);
    if (!protocol) return null;

    const he = protocol.he || {};
    const notes = he.educationNotes || {};

    return {
        protocol,
        resolvedName,
        references: he.references || [he.citation].filter(Boolean),
        sections: [
            { key: 'purpose', title: 'Therapeutic Purpose', accent: 'green', notes: notes.purpose || [] },
            { key: 'use', title: 'How To Use / Administration Notes', accent: 'blue', notes: notes.use || [] },
            { key: 'monitoring', title: 'Monitoring & Follow-Up', accent: 'indigo', notes: notes.monitoring || [] },
            { key: 'sideEffects', title: 'Side Effects To Watch', accent: 'red', notes: notes.sideEffects || [] },
            { key: 'redFlags', title: 'When To Get Help Urgently', accent: 'amber', notes: notes.redFlags || [] },
            { key: 'counselling', title: 'Counselling Advice', accent: 'slate', notes: notes.counselling || [] }
        ].filter(section => section.notes.length > 0),
        displayDose: med?.dose || '',
        displayRoute: med?.route || '',
        displayFrequency: med?.frequency || '',
        rawEducation: he
    };
}

function renderCitationBadge(citation, extraClasses = '') {
    return `<p class="text-[10px] font-semibold leading-relaxed text-slate-500 mt-2 ${extraClasses}">APA 7: ${citation}</p>`;
}

function renderEducationNotesList(notes, listClass = 'space-y-3') {
    return `
        <div class="${listClass}">
            ${notes.map(note => `
                <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                    <p class="text-sm font-semibold leading-relaxed text-slate-800">${note.text}</p>
                    ${renderCitationBadge(note.citation)}
                </div>
            `).join('')}
        </div>
    `;
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
    if (med.status === 'Missed') return 'Red';
    
    const now = new Date();
    const due = new Date(med.timeDue);
    
    // Check for missed dose based on due time
    if (now > due && (med.status === 'Pending' || med.status === 'Dispensed')) {
        return 'Red';
    }
    
    if (med.status === 'Dispensed') return 'Yellow';
    return 'Yellow'; // Default for Pending
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
 * Nurse Digital Stamp Generator
 * Creates a professional clinical signature for eMAR documentation
 */
function generateNurseStamp(nurseName, nurseRole) {
    const date = new Date().toLocaleDateString();
    return `
        <div style="border: 2px solid #1e3a8a; padding: 10px; border-radius: 12px; display: inline-block; background: white; min-width: 180px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <div style="width: 24px; height: 24px; background: #1e3a8a; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">🩺</div>
                <p style="margin: 0; font-size: 9px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.1em;">Digitally Verified</p>
            </div>
            <p style="margin: 0; font-family: 'Georgia', serif; font-style: italic; font-weight: 900; color: #0f172a; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">${nurseName}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <p style="margin: 0; font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase;">${nurseRole}</p>
                <p style="margin: 0; font-size: 8px; font-weight: 800; color: #94a3b8;">${date}</p>
            </div>
        </div>
    `;
}

/**
 * Mobile-Friendly Health Education (HE) Modal
 * Directly pops up in the UI for phone users without opening new windows
 */
function showHEModal(patient, med) {
    const db = getDB();
    
    // Fuzzy match medication info from the main clinical database in data.js
    const medNameKey = Object.keys(db.medicationProtocols).find(key => 
        med.name.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(med.name.toLowerCase())
    );
    
    const protocol = db.medicationProtocols[medNameKey];
    
    // Fallback if not found in protocols
    const info = (protocol && protocol.he) ? protocol.he : {
        reason: "This medication is given to treat your clinical condition as prescribed by your attending doctor.",
        sideEffects: "Nausea, Dizziness, Mild stomach upset",
        citation: "Standard Clinical Guidelines"
    };

    const clinicalInstructions = protocol ? protocol.instructions : "Take exactly as instructed by your healthcare provider.";
    
    const modal = document.createElement('div');
    modal.id = 'he-mobile-modal';
    modal.className = 'fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[500] flex flex-col animate-fade-in';
    
    modal.innerHTML = `
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-700 to-indigo-900 p-6 text-white shrink-0 sticky top-0 z-10 shadow-lg">
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                    <div class="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>
                    <div>
                        <h2 class="text-xl font-black tracking-tight leading-none">Health Education</h2>
                        <p class="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-1">Medication Protocol</p>
                    </div>
                </div>
                <button onclick="document.getElementById('he-mobile-modal').remove()" class="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <div class="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                <p class="text-[9px] font-black text-blue-100 uppercase tracking-widest mb-1 opacity-60">Medication Identified</p>
                <h3 class="text-lg font-black text-white">${med.name}</h3>
                <p class="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1">${med.dose} • ${med.route}</p>
            </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-grow overflow-y-auto p-6 space-y-6 pb-24">
            
            ${protocol && protocol.highAlert ? `
                <div class="bg-red-50 border-2 border-red-200 p-5 rounded-3xl flex items-start gap-4">
                    <div class="text-2xl">⚠️</div>
                    <div>
                        <h4 class="text-xs font-black text-red-700 uppercase tracking-widest mb-1">High-Alert Protocol</h4>
                        <p class="text-[11px] font-bold text-red-900/70 leading-relaxed">This medication requires extra caution. Follow all safety checks strictly.</p>
                    </div>
                </div>
            ` : ''}

            <section class="space-y-3">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                    <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Clinical Purpose</h4>
                </div>
                <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                    <p class="text-sm font-bold text-slate-800 leading-relaxed italic">"${info.reason}"</p>
                </div>
            </section>

            ${info.interventions ? `
            <section class="space-y-3">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-4 bg-green-600 rounded-full"></div>
                    <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Health Education Interventions</h4>
                </div>
                <div class="bg-green-50/50 p-5 rounded-3xl border border-green-100">
                    <ul class="space-y-2">
                        ${info.interventions.map(point => `
                            <li class="flex items-start gap-3">
                                <div class="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
                                <p class="text-xs font-bold text-green-900/80 leading-relaxed">${point}</p>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </section>
            ` : ''}

            <section class="space-y-3">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                    <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nursing Instructions</h4>
                </div>
                <div class="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100">
                    <p class="text-sm font-black text-indigo-900 leading-relaxed">${clinicalInstructions}</p>
                    
                    <div class="grid grid-cols-2 gap-3 mt-4">
                        <div class="bg-white/60 p-3 rounded-2xl border border-indigo-100">
                            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Diluent</p>
                            <p class="text-[10px] font-bold text-slate-800">${protocol ? protocol.diluent : 'N/A'}</p>
                        </div>
                        <div class="bg-white/60 p-3 rounded-2xl border border-indigo-100">
                            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume</p>
                            <p class="text-[10px] font-bold text-slate-800">${protocol ? protocol.volume : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="space-y-3">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-4 bg-red-600 rounded-full"></div>
                    <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Side Effects & Safety</h4>
                </div>
                <div class="bg-red-50/50 p-5 rounded-3xl border border-red-100">
                    <ul class="space-y-2">
                        ${(Array.isArray(info.sideEffects) ? info.sideEffects : [info.sideEffects]).map(se => `
                            <li class="flex items-center gap-3 text-sm font-bold text-red-900/80">
                                <span class="w-1 h-1 bg-red-400 rounded-full shrink-0"></span>
                                ${se}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </section>

            ${protocol && protocol.containsPorcine ? `
                <div class="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex items-start gap-4 border-dashed">
                    <div class="text-2xl">🕌</div>
                    <div>
                        <h4 class="text-xs font-black text-amber-700 uppercase tracking-widest mb-1">Shariah Clinical Notice</h4>
                        <p class="text-[11px] font-bold text-amber-900/70 leading-relaxed">Porcine-derived medication. Permissible in clinical necessity (Dharurah).</p>
                    </div>
                </div>
            ` : ''}

            <!-- Footer Stamp -->
            <div class="pt-6 border-t border-slate-100 flex flex-col items-center gap-4 text-center">
                <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Clinical Digital Stamp</p>
                    ${generateNurseStamp(currentUser.fullname, currentUser.role)}
                </div>
                <p class="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-4">
                    Evidence-Based Reference (APA 7th Ed.):<br>
                    ${info.citation || 'Standard Nursing Guidelines'}
                </p>
            </div>
        </div>

        <!-- Sticky Bottom Actions -->
        <div class="fixed bottom-0 left-0 w-full p-6 bg-slate-900/80 backdrop-blur-md border-t border-white/10 flex gap-3">
            <button onclick="document.getElementById('he-mobile-modal').remove()" class="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-white/5">Close</button>
            <button onclick="generateHEPamphlet(${JSON.stringify(patient).replace(/"/g, '&quot;')}, ${JSON.stringify(med).replace(/"/g, '&quot;')}); document.getElementById('he-mobile-modal').remove()" class="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Print PDF
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Professional Clinical Prescription History Generator
 * Purpose: Reference to new clinic, discharge purpose, or pharmacy history
 */
function generatePrescriptionPrint(patient) {
    const db = getDB();
    const now = new Date();
    
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Prescription History: ${patient.info.name}</title>
            <style>
                @page { size: A4; margin: 1.5cm; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.4; color: #0f172a; margin: 0; padding: 20px; background: #fff; }
                .print-container { max-width: 900px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px; }
                
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
                .hospital-info h1 { font-size: 24px; font-weight: 900; color: #1e3a8a; margin: 0; text-transform: uppercase; }
                .hospital-info p { font-size: 10px; font-weight: 800; color: #64748b; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.2em; }
                .report-title { text-align: right; }
                .report-title h2 { font-size: 18px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; }
                .report-title p { font-size: 10px; font-weight: 700; color: #94a3b8; margin: 5px 0 0 0; }

                .patient-summary { background: #f8fafc; border-radius: 12px; padding: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
                .summary-item .label { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
                .summary-item .value { font-size: 13px; font-weight: 700; color: #1e293b; }

                .med-table { w-full; border-collapse: collapse; margin-bottom: 30px; }
                .med-table th { background: #f1f5f9; text-align: left; padding: 12px 15px; font-size: 10px; font-weight: 900; color: #475569; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
                .med-table td { padding: 12px 15px; font-size: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
                .med-name { font-weight: 800; color: #0f172a; }
                .med-details { font-size: 10px; color: #64748b; font-weight: 600; margin-top: 2px; }
                .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; }
                .status-given { background: #dcfce7; color: #166534; }
                .status-pending { background: #fef9c3; color: #854d0e; }
                .status-missed { background: #fee2e2; color: #991b1b; }

                .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; }
                .signature-box { border-top: 1px solid #0f172a; width: 200px; text-align: center; padding-top: 8px; }
                .signature-box p { font-size: 10px; font-weight: 700; color: #64748b; margin: 0; }
                
                .no-print { text-align: center; margin-top: 30px; }
                .print-btn { background: #1e3a8a; color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 800; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
                .print-btn:hover { background: #1e40af; }

                @media print { .no-print { display: none; } .print-container { border: none; padding: 0; } }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="header">
                    <div class="hospital-info">
                        <h1>Kulliyyah of Nursing • IIUM</h1>
                        <p>Advanced Clinical Informatics System</p>
                    </div>
                    <div class="report-title">
                        <h2>Prescription History</h2>
                        <p>Generated: ${formatDateTime(now)}</p>
                    </div>
                </div>

                <div class="patient-summary">
                    <div class="summary-item">
                        <div class="label">Patient Name</div>
                        <div class="value">${patient.info.name}</div>
                    </div>
                    <div class="summary-item">
                        <div class="label">Registration No (MRN)</div>
                        <div class="value">${patient.info.mrn}</div>
                    </div>
                    <div class="summary-item">
                        <div class="label">Primary Diagnosis</div>
                        <div class="value">${patient.info.diagnosis}</div>
                    </div>
                    <div class="summary-item">
                        <div class="label">Attending Doctor</div>
                        <div class="value">${patient.info.doctor}</div>
                    </div>
                    <div class="summary-item">
                        <div class="label">Allergies</div>
                        <div class="value" style="color: ${patient.info.allergies !== 'None (NKDA)' ? '#dc2626' : 'inherit'}">${patient.info.allergies}</div>
                    </div>
                    <div class="summary-item">
                        <div class="label">Clinical Status</div>
                        <div class="value">Discharged / Referral Reference</div>
                    </div>
                </div>

                <table class="med-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Medication Agent</th>
                            <th>Dose / Route</th>
                            <th>Frequency</th>
                            <th>Last Administered</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${patient.medications.map(med => `
                            <tr>
                                <td>
                                    <div class="med-name">${med.name}</div>
                                    <div class="med-details">ID: ${med.id.split('-').pop()}</div>
                                </td>
                                <td>${med.dose}<br><span style="font-size: 10px; color: #94a3b8;">${med.route}</span></td>
                                <td>${med.frequency}</td>
                                <td>${med.timeAdministered ? formatDateTime(med.timeAdministered) : '---'}</td>
                                <td>
                                    <span class="status-badge ${
                                        med.status === 'Given' || med.status === 'Administered' ? 'status-given' : 
                                        med.status === 'Missed' ? 'status-missed' : 'status-pending'
                                    }">${med.status}</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="section" style="margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    <p style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">Clinical Remarks / Discharge Instructions</p>
                    <div style="font-size: 12px; color: #334155; line-height: 1.6; background: #fff; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 8px;">
                        Patient instructed on medication adherence and follow-up clinical appointments. In case of allergic reaction or worsening symptoms, please seek immediate medical attention at the nearest healthcare facility.
                    </div>
                </div>

                <div class="footer">
                    <div class="signature-box">
                        <p style="margin-bottom: 40px; border: none;">Digital Stamp Attached</p>
                        ${generateNurseStamp(currentUser.fullname, currentUser.role)}
                        <p style="margin-top: 10px;">Authorized Signature</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">POPMED-CLINICAL-RECORD-026</p>
                        <p style="font-size: 8px; color: #cbd5e1;">This is a computer-generated clinical record and does not require a physical signature if the digital stamp is present.</p>
                    </div>
                </div>

                <div class="no-print">
                    <button class="print-btn" onclick="window.print()">🖨️ Print Clinical Prescription History</button>
                </div>
            </div>
        </body>
        </html>
    `;

    const w = window.open('', '', 'width=950,height=900');
    w.document.write(content);
    w.document.close();
}

/**
 * Health Education (HE) Pamphlet Generator
 * Professional A4 Layout for Patients (Medication Specific & Shariah Compliant)
 */
function generateHEPamphlet(patient, med) {
    const db = getDB();
    
    // Fuzzy match medication info from the main clinical database in data.js
    const medNameKey = Object.keys(db.medicationProtocols).find(key => 
        med.name.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(med.name.toLowerCase())
    );
    
    const protocol = db.medicationProtocols[medNameKey];
    
    // Fallback if not found in protocols
    const info = (protocol && protocol.he) ? protocol.he : {
        reason: "This medication is given to treat your clinical condition as prescribed by your attending doctor.",
        sideEffects: "Nausea, Dizziness, Mild stomach upset",
        citation: "Standard Clinical Guidelines"
    };

    // Medication-specific instructions from protocol
    const clinicalInstructions = protocol ? protocol.instructions : "Take exactly as instructed by your healthcare provider. Do not stop without medical advice.";
    const diluentInfo = protocol ? protocol.diluent : "Not applicable";
    const volumeInfo = protocol ? protocol.volume : "Not applicable";
    const stabilityInfo = protocol ? protocol.stability : "Stable at room temperature";

    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Patient Education: ${med.name}</title>
            <style>
                @page { size: A4; margin: 1.5cm; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; color: #1e293b; margin: 0; padding: 30px; background: #f8fafc; }
                .pamphlet-container { max-width: 850px; margin: auto; background: white; padding: 50px; border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
                .header { text-align: center; border-bottom: 5px solid #1e3a8a; padding-bottom: 25px; margin-bottom: 35px; }
                .hospital-name { font-size: 32px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: -0.03em; }
                .subtitle { font-size: 14px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.3em; margin-top: 8px; }
                
                .patient-box { background: #f1f5f9; border-radius: 24px; padding: 30px; border: 1px solid #e2e8f0; margin-bottom: 35px; display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
                .label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.1em; }
                .value { font-size: 16px; font-weight: 800; color: #0f172a; }
                
                .section { margin-bottom: 35px; }
                .section-title { font-size: 16px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; border-left: 6px solid #1e3a8a; padding-left: 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
                .section-content { font-size: 15px; font-weight: 500; padding-left: 24px; color: #334155; }
                
                .highlight-blue { background: #f0f9ff; padding: 25px; border-radius: 20px; border-left: 6px solid #0ea5e9; }
                .highlight-indigo { background: #eef2ff; padding: 25px; border-radius: 20px; border-left: 6px solid #6366f1; }
                .highlight-red { background: #fff1f2; padding: 25px; border-radius: 20px; border-left: 6px solid #f43f5e; }
                
                .protocol-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
                .protocol-item { background: white; padding: 12px 18px; border-radius: 12px; border: 1px solid #e2e8f0; }
                
                .nurse-section { margin-top: 60px; padding-top: 30px; border-top: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-end; }
                .no-print { margin-top: 50px; text-align: center; }
                .print-btn { background: #1e3a8a; color: white; border: none; padding: 18px 45px; border-radius: 20px; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 0.15em; transition: all 0.4s; box-shadow: 0 10px 25px -5px rgba(30, 58, 138, 0.4); }
                .print-btn:hover { background: #1e40af; transform: translateY(-3px); box-shadow: 0 15px 30px -5px rgba(30, 58, 138, 0.5); }
                
                ul { margin: 0; padding-left: 20px; }
                li { margin-bottom: 8px; font-weight: 600; color: #475569; }
                @media print { .no-print { display: none; } body { padding: 0; background: white; } .pamphlet-container { box-shadow: none; padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="pamphlet-container">
                <div class="header">
                    <div class="hospital-name">Kulliyyah of Nursing • IIUM</div>
                    <div class="subtitle">Clinical Education & Safety Guide</div>
                </div>

                <div class="patient-box">
                    <div>
                        <div class="label">Patient Recipient</div>
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
                        <div class="label">Prescribed Dosing</div>
                        <div class="value">${med.dose} • ${med.route}</div>
                    </div>
                </div>

                ${generateHighAlertWarning(protocol || { highAlert: false })}

                <div class="section">
                    <div class="section-title">🩺 Clinical Purpose</div>
                    <div class="section-content highlight-blue">
                        <p style="margin:0; font-weight:700;">${info.reason}</p>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">🏥 Administration Guidelines & Protocol</div>
                    <div class="section-content highlight-indigo">
                        <p style="margin:0 0 15px 0; font-weight:800; color:#4338ca;">NURSING PROTOCOL:</p>
                        <p style="margin:0; font-weight:600; line-height:1.6;">${clinicalInstructions}</p>
                        
                        <div class="protocol-grid">
                            <div class="protocol-item">
                                <p class="label">Diluent Required</p>
                                <p style="margin:0; font-size:12px; font-weight:800; color:#1e293b;">${diluentInfo}</p>
                            </div>
                            <div class="protocol-item">
                                <p class="label">Volume / Rate</p>
                                <p style="margin:0; font-size:12px; font-weight:800; color:#1e293b;">${volumeInfo}</p>
                            </div>
                            <div class="protocol-item">
                                <p class="label">Physical Stability</p>
                                <p style="margin:0; font-size:12px; font-weight:800; color:#1e293b;">${stabilityInfo}</p>
                            </div>
                            <div class="protocol-item">
                                <p class="label">Clinical Frequency</p>
                                <p style="margin:0; font-size:12px; font-weight:800; color:#1e293b;">${med.frequency}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">⚠️ Safety Monitoring (Side Effects)</div>
                    <div class="section-content highlight-red">
                        <p style="margin:0 0 10px 0; font-weight:700;">Please notify your nurse if you experience any of the following:</p>
                        <ul>
                            ${(Array.isArray(info.sideEffects) ? info.sideEffects : [info.sideEffects]).map(se => `<li>${se}</li>`).join('')}
                        </ul>
                        <div style="margin-top: 20px; background: #fff1f2; border: 1px solid #fda4af; padding: 15px; border-radius: 12px;">
                            <p style="margin:0; font-weight: 900; color: #be123c; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
                                *** EMERGENCY ALERT ***
                            </p>
                            <p style="margin:5px 0 0 0; font-weight: 700; color: #9f1239; font-size: 13px;">
                                Call for help immediately if you have difficulty breathing, chest pain, or sudden swelling.
                            </p>
                        </div>
                    </div>
                </div>

                ${generateShariahNotice(protocol || { containsPorcine: false })}

                <div class="nurse-section">
                    <div>
                        <div class="label">Clinical Educator (Digital Stamp)</div>
                        ${generateNurseStamp(currentUser.fullname, currentUser.role)}
                    </div>
                    <div style="text-align: right;">
                        <div class="label">Verification Timestamp</div>
                        <div class="value">${new Date().toLocaleString()}</div>
                        <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Reference: ${med.id.split('-').pop()}</p>
                    </div>
                </div>

                <div class="no-print">
                    <button class="print-btn" onclick="window.print()">🖨️ Print Clinical Education Guide</button>
                </div>
                
                <div style="margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; pt: 20px;">
                    <p style="font-size: 9px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.2em;">
                        Source: ${info.citation || 'International Nursing Care Standards'} • Kulliyyah of Nursing • IIUM
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    const w = window.open('', '', 'width=950,height=900');
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

/**
 * Professional Patient Education (HE) Summary Generator
 */
function generateAllHEPrint(patient) {
    const db = getDB();
    const now = new Date();
    
    const medEducationContent = patient.medications.map(med => {
        const medNameKey = Object.keys(db.medicationProtocols).find(key => 
            med.name.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(med.name.toLowerCase())
        );
        
        const protocol = db.medicationProtocols[medNameKey];
        const info = (protocol && protocol.he) ? protocol.he : {
            reason: "This medication is prescribed for your current clinical condition.",
            sideEffects: "Varies; please consult your nurse.",
            citation: "Clinical Guidelines"
        };

        return `
            <div class="med-he-block" style="break-inside: avoid; margin-bottom: 40px; border-bottom: 2px dashed #e2e8f0; padding-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="font-size: 20px; font-weight: 900; color: #1e3a8a; margin: 0;">${med.name}</h3>
                    <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">${med.dose} • ${med.route}</span>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <p style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; margin: 0 0 5px 0;">Why am I taking this?</p>
                    <p style="font-size: 14px; font-weight: 600; color: #334155; margin: 0; line-height: 1.5;">${info.reason}</p>
                </div>

                <div style="margin-bottom: 15px;">
                    <p style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; margin: 0 0 5px 0;">What should I watch for?</p>
                    <p style="font-size: 13px; font-weight: 500; color: #475569; margin: 0; line-height: 1.5;">${Array.isArray(info.sideEffects) ? info.sideEffects.join(', ') : info.sideEffects}</p>
                </div>

                ${protocol && protocol.highAlert ? `
                    <div style="background: #fff1f2; border: 1px solid #fda4af; padding: 10px 15px; border-radius: 8px; font-size: 11px; font-weight: 700; color: #be123c;">
                        ⚠️ HIGH-ALERT MEDICATION: Use with caution. Do not skip or double doses.
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Patient Education Summary: ${patient.info.name}</title>
            <style>
                @page { size: A4; margin: 1.5cm; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.4; color: #0f172a; margin: 0; padding: 20px; background: #fff; }
                .print-container { max-width: 900px; margin: auto; }
                
                .header { border-bottom: 4px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 40px; text-align: center; }
                .hospital-name { font-size: 28px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin: 0; }
                .subtitle { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.3em; margin-top: 5px; }

                .patient-info { background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 40px; display: flex; justify-content: space-between; }
                .info-item .label { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; }
                .info-item .value { font-size: 14px; font-weight: 700; color: #1e293b; }

                .no-print { text-align: center; margin-top: 40px; }
                .print-btn { background: #1e3a8a; color: white; border: none; padding: 15px 40px; border-radius: 10px; font-weight: 900; cursor: pointer; text-transform: uppercase; }

                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="header">
                    <p class="hospital-name">Kulliyyah of Nursing • IIUM</p>
                    <p class="subtitle">Patient Health Education Guide</p>
                </div>

                <div class="patient-info">
                    <div class="info-item">
                        <div class="label">Patient Name</div>
                        <div class="value">${patient.info.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">MRN / RN</div>
                        <div class="value">${patient.info.mrn}</div>
                    </div>
                    <div class="info-item">
                        <div class="label">Date Generated</div>
                        <div class="value">${new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                <div class="education-content">
                    ${medEducationContent}
                </div>

                <div style="margin-top: 50px; text-align: center;">
                    <p style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Innovation in Nursing • POPMED Clinical Informatics</p>
                    <p style="font-size: 9px; color: #cbd5e1; margin-top: 5px;">This document is for educational purposes only. Always follow your healthcare provider's instructions.</p>
                </div>

                <div class="no-print">
                    <button class="print-btn" onclick="window.print()">🖨️ Print Education Guide</button>
                </div>
            </div>
        </body>
        </html>
    `;

    const w = window.open('', '', 'width=950,height=900');
    w.document.write(content);
    w.document.close();
}

function buildEducationPrintSection(section) {
    return `
        <div style="margin-bottom: 28px;">
            <div style="font-size: 15px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; border-left: 6px solid #1e3a8a; padding-left: 14px; margin-bottom: 14px;">
                ${section.title}
            </div>
            <div style="display: grid; gap: 12px;">
                ${section.notes.map(note => `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px;">
                        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #1e293b; line-height: 1.6;">${note.text}</p>
                        <p style="margin: 10px 0 0 0; font-size: 10px; font-weight: 700; color: #64748b; line-height: 1.5;">APA 7: ${note.citation}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function showHEModal(patient, med) {
    const db = getDB();
    const education = getMedicationEducationBundle(med.name, med, db);
    if (!education) {
        showNotification(`Clinical Protocol is not available for ${med.name}. Please check a verified drug reference.`, 'info');
        return;
    }

    const { protocol, sections, references } = education;
    const modal = document.createElement('div');
    modal.id = 'he-mobile-modal';
    modal.className = 'fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[500] flex flex-col animate-fade-in';

    modal.innerHTML = `
        <div class="bg-gradient-to-r from-blue-700 to-indigo-900 p-5 text-white shrink-0 sticky top-0 z-10 shadow-lg">
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                    <div class="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>
                    <div>
                        <h2 class="text-xl font-black tracking-tight leading-none">Health Education</h2>
                        <p class="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-1">Medication Protocol</p>
                    </div>
                </div>
                <button onclick="document.getElementById('he-mobile-modal').remove()" class="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                <p class="text-[9px] font-black text-blue-100 uppercase tracking-widest mb-1 opacity-70">Medication Identified</p>
                <h3 class="text-lg font-black text-white">${med.name}</h3>
                <p class="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1">${med.dose} • ${med.route}${med.frequency ? ` • ${med.frequency}` : ''}</p>
            </div>
        </div>

        <div class="flex-grow overflow-y-auto p-5 space-y-5 pb-28">
            ${protocol && protocol.isHighAlert ? `
                <div class="bg-red-50 border-2 border-red-200 p-5 rounded-3xl flex items-start gap-4">
                    <div class="text-2xl font-black text-red-600">!</div>
                    <div>
                        <h4 class="text-xs font-black text-red-700 uppercase tracking-widest mb-1">High-Alert Protocol</h4>
                        <p class="text-[11px] font-bold text-red-900/70 leading-relaxed">This medication requires extra caution. Follow all safety checks strictly.</p>
                    </div>
                </div>
            ` : ''}

            ${sections.map(section => `
                <section class="space-y-3">
                    <div class="flex items-center gap-2">
                        <div class="w-1.5 h-4 bg-${section.accent}-600 rounded-full"></div>
                        <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">${section.title}</h4>
                    </div>
                    ${renderEducationNotesList(section.notes)}
                </section>
            `).join('')}

            <section class="space-y-3">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                    <h4 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Preparation & Administration Reference</h4>
                </div>
                <div class="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div class="bg-white/70 p-3 rounded-2xl border border-indigo-100">
                            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Diluent</p>
                            <p class="text-[10px] font-bold text-slate-800">${protocol.diluent || 'N/A'}</p>
                        </div>
                        <div class="bg-white/70 p-3 rounded-2xl border border-indigo-100">
                            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume</p>
                            <p class="text-[10px] font-bold text-slate-800">${protocol.volume || 'N/A'}</p>
                        </div>
                        <div class="bg-white/70 p-3 rounded-2xl border border-indigo-100">
                            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Stability</p>
                            <p class="text-[10px] font-bold text-slate-800">${protocol.stability || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div class="pt-6 border-t border-slate-100 flex flex-col items-center gap-4 text-center">
                <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Clinical Digital Stamp</p>
                    ${generateNurseStamp(currentUser.fullname, currentUser.role)}
                </div>
                <div class="w-full rounded-3xl bg-white/5 p-4 text-left border border-white/5">
                    <p class="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-3">Evidence-Based References (APA 7th Ed.)</p>
                    <div class="space-y-2">
                        ${references.map(citation => `<p class="text-[11px] font-semibold text-slate-200 leading-relaxed">${citation}</p>`).join('')}
                    </div>
                </div>
            </div>
        </div>

        <div class="fixed bottom-0 left-0 w-full p-4 bg-slate-900/80 backdrop-blur-md border-t border-white/10 flex gap-3">
            <button onclick="document.getElementById('he-mobile-modal').remove()" class="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-white/5">Close</button>
            <button onclick="generateHEPamphlet(${JSON.stringify(patient).replace(/"/g, '&quot;')}, ${JSON.stringify(med).replace(/"/g, '&quot;')}); document.getElementById('he-mobile-modal').remove()" class="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Print PDF
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

function generateHEPamphlet(patient, med) {
    const db = getDB();
    const education = getMedicationEducationBundle(med.name, med, db);
    if (!education) {
        showNotification(`Clinical Protocol is not available for ${med.name}. Please check a verified drug reference.`, 'info');
        return;
    }

    const { protocol, sections, references } = education;
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Patient Education: ${med.name}</title>
            <style>
                @page { size: A4; margin: 1.2cm; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; color: #1e293b; margin: 0; padding: 24px; background: #f8fafc; }
                .pamphlet-container { max-width: 900px; margin: auto; background: white; padding: 36px; border-radius: 24px; box-shadow: 0 16px 40px rgba(0,0,0,0.06); }
                .header { text-align: center; border-bottom: 4px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 28px; }
                .hospital-name { font-size: 28px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: -0.03em; }
                .subtitle { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.25em; margin-top: 8px; }
                .patient-box { background: #f1f5f9; border-radius: 20px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
                .label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.08em; }
                .value { font-size: 15px; font-weight: 800; color: #0f172a; }
                .protocol-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
                .protocol-item { background: #eef2ff; padding: 14px; border-radius: 14px; border: 1px solid #c7d2fe; }
                .refs { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                .stamp-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-top: 28px; }
                .no-print { text-align: center; margin-top: 36px; }
                .print-btn { background: #1e3a8a; color: white; border: none; padding: 16px 36px; border-radius: 16px; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 0.12em; }
                @media print { .no-print { display: none; } body { padding: 0; background: white; } .pamphlet-container { box-shadow: none; border-radius: 0; padding: 12px; } }
            </style>
        </head>
        <body>
            <div class="pamphlet-container">
                <div class="header">
                    <div class="hospital-name">Kulliyyah of Nursing • IIUM</div>
                    <div class="subtitle">Comprehensive Patient Medication Education Guide</div>
                </div>
                <div class="patient-box">
                    <div><div class="label">Patient</div><div class="value">${patient.info.name}</div></div>
                    <div><div class="label">MRN</div><div class="value">${patient.info.mrn}</div></div>
                    <div><div class="label">Medication</div><div class="value">${med.name}</div></div>
                    <div><div class="label">Dose / Route / Frequency</div><div class="value">${med.dose} • ${med.route}${med.frequency ? ` • ${med.frequency}` : ''}</div></div>
                </div>
                <div class="protocol-grid">
                    <div class="protocol-item"><div class="label">Diluent</div><div class="value" style="font-size: 12px;">${protocol.diluent || 'N/A'}</div></div>
                    <div class="protocol-item"><div class="label">Volume</div><div class="value" style="font-size: 12px;">${protocol.volume || 'N/A'}</div></div>
                    <div class="protocol-item"><div class="label">Stability</div><div class="value" style="font-size: 12px;">${protocol.stability || 'N/A'}</div></div>
                </div>
                ${sections.map(buildEducationPrintSection).join('')}
                <div class="stamp-row">
                    <div>
                        <div class="label">Clinical Educator (Digital Stamp)</div>
                        ${generateNurseStamp(currentUser.fullname, currentUser.role)}
                    </div>
                    <div style="text-align:right;">
                        <div class="label">Printed</div>
                        <div class="value" style="font-size: 13px;">${new Date().toLocaleString()}</div>
                    </div>
                </div>
                <div class="refs">
                    <div class="label">Evidence-Based References (APA 7th Ed.)</div>
                    ${references.map(citation => `<p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #475569; line-height: 1.6;">${citation}</p>`).join('')}
                </div>
                <div class="no-print">
                    <button class="print-btn" onclick="window.print()">Print Education Guide</button>
                </div>
            </div>
        </body>
        </html>
    `;

    const w = window.open('', '', 'width=980,height=920');
    w.document.write(content);
    w.document.close();
}

function generateAllHEPrint(patient) {
    const db = getDB();
    const medEducationContent = patient.medications.map(med => {
        const education = getMedicationEducationBundle(med.name, med, db);
        if (!education) return '';

        return `
            <div class="med-he-block" style="break-inside: avoid; margin-bottom: 36px; border-bottom: 2px dashed #e2e8f0; padding-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px;">
                    <h3 style="font-size: 20px; font-weight: 900; color: #1e3a8a; margin: 0;">${med.name}</h3>
                    <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">${med.dose} • ${med.route}${med.frequency ? ` • ${med.frequency}` : ''}</span>
                </div>
                ${education.sections.slice(0, 4).map(buildEducationPrintSection).join('')}
            </div>
        `;
    }).join('');

    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Patient Education Summary: ${patient.info.name}</title>
            <style>
                @page { size: A4; margin: 1.2cm; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.4; color: #0f172a; margin: 0; padding: 20px; background: #fff; }
                .print-container { max-width: 920px; margin: auto; }
                .header { border-bottom: 4px solid #1e3a8a; padding-bottom: 18px; margin-bottom: 30px; text-align: center; }
                .hospital-name { font-size: 28px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin: 0; }
                .subtitle { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.25em; margin-top: 5px; }
                .patient-info { background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 30px; display: flex; justify-content: space-between; gap: 12px; }
                .info-item .label { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; }
                .info-item .value { font-size: 14px; font-weight: 700; color: #1e293b; }
                .no-print { text-align: center; margin-top: 30px; }
                .print-btn { background: #1e3a8a; color: white; border: none; padding: 15px 40px; border-radius: 10px; font-weight: 900; cursor: pointer; text-transform: uppercase; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="print-container">
                <div class="header">
                    <h1 class="hospital-name">Kulliyyah of Nursing • IIUM</h1>
                    <p class="subtitle">Comprehensive Medication Education Summary</p>
                </div>
                <div class="patient-info">
                    <div class="info-item"><div class="label">Patient Name</div><div class="value">${patient.info.name}</div></div>
                    <div class="info-item"><div class="label">MRN / RN</div><div class="value">${patient.info.mrn}</div></div>
                    <div class="info-item"><div class="label">Date Generated</div><div class="value">${new Date().toLocaleDateString()}</div></div>
                </div>
                <div class="education-content">${medEducationContent}</div>
                <div class="no-print">
                    <button class="print-btn" onclick="window.print()">Print Education Guide</button>
                </div>
            </div>
        </body>
        </html>
    `;

    const w = window.open('', '', 'width=950,height=900');
    w.document.write(content);
    w.document.close();
}

/**
 * Advanced Inventory Search Utility (FIFO - First Expire First Out)
 */
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
