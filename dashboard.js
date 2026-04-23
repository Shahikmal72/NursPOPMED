// Dashboard and Main UI Logic
let currentBCMAPatient = null;
let bcmaBedListScrollTop = 0;
let bcmaBedListScrollLeft = 0;

function formatPrescriberName(name) {
    if (!name) return 'Not documented';
    return name.startsWith('Dr.') ? name : `Dr. ${name}`;
}

function getLotDaysRemaining(expiry) {
    const expiryDate = new Date(expiry);
    const today = new Date();
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
}

function getLotLifecycle(expiry) {
    const daysRemaining = getLotDaysRemaining(expiry);

    if (daysRemaining < 0) {
        return {
            label: 'Expired',
            chipClass: 'bg-red-100 text-red-700 border-red-200',
            textClass: 'text-red-700',
            subtitle: `${Math.abs(daysRemaining)} day(s) overdue`
        };
    }

    if (daysRemaining <= 30) {
        return {
            label: 'Near Expiry',
            chipClass: 'bg-amber-100 text-amber-700 border-amber-200',
            textClass: 'text-amber-700',
            subtitle: `${daysRemaining} day(s) remaining`
        };
    }

    return {
        label: 'Active',
        chipClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        textClass: 'text-emerald-700',
        subtitle: `${daysRemaining} day(s) remaining`
    };
}

function renderSevenRightsBoard(patient, med) {
    const verification = validate5Rights(patient, med, patient.info.mrn, med.barcode || '');
    const documentationDone = med.status === 'Administered' || med.status === 'Given';
    const rights = [
        { label: 'Right Patient', value: `${patient.info.name} (${patient.info.mrn})`, ok: verification.patient.pass },
        { label: 'Right Drug', value: med.name, ok: verification.drug.pass },
        { label: 'Right Dose', value: med.dose || 'Not set', ok: verification.dose.pass },
        { label: 'Right Route', value: med.route || 'Not set', ok: verification.route.pass },
        { label: 'Right Time', value: formatDateTime(med.timeDue), ok: verification.time.pass },
        { label: 'Right Reason', value: patient.info.diagnosis || 'Clinical indication pending', ok: !!patient.info.diagnosis },
        { label: 'Right Documentation', value: documentationDone ? 'Recorded in eMAR' : 'Pending administration record', ok: documentationDone }
    ];

    return `
        <div class="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">7 Rights Verification</p>
                    <p class="text-xs font-bold text-slate-600 mt-1">${med.name} scheduled for ${formatDateTime(med.timeDue)}.</p>
                </div>
                <div class="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                    <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest">Prescribed By</p>
                    <p class="text-sm font-black text-blue-900 mt-1">${formatPrescriberName(med.prescribingDoctor || patient.info.doctor)}</p>
                    <p class="text-[9px] font-bold text-blue-700 mt-1">Prescription documented: ${formatDateTime(med.prescribedAt || med.timeDue)}</p>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                ${rights.map(right => `
                    <div class="rounded-2xl border ${right.ok ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-amber-50'} p-3">
                        <p class="text-[8px] font-black uppercase tracking-widest ${right.ok ? 'text-emerald-600' : 'text-amber-600'}">${right.label}</p>
                        <p class="text-[11px] font-bold text-slate-700 mt-1.5 leading-snug">${right.value}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderSevenRightsSummary(patient, med) {
    const dueTime = new Date(med.timeDue);
    const now = new Date();
    const timeOk = Math.abs(now - dueTime) <= 60 * 60 * 1000 || med.status === 'Given' || med.status === 'Administered';
    const rights = [
        { label: 'Patient', value: `Bed ${patient.bedNumber} / ${patient.info.mrn}`, ok: true },
        { label: 'Drug', value: med.name, ok: !!med.name },
        { label: 'Dose', value: med.dose || 'Not set', ok: !!med.dose },
        { label: 'Route', value: med.route || 'Not set', ok: !!med.route },
        { label: 'Time', value: formatDateTime(med.timeDue), ok: timeOk },
        { label: 'Reason', value: med.reasonForPrescription || patient.info.diagnosis || 'Clinical indication', ok: true },
        { label: 'Documentation', value: med.status === 'Administered' || med.status === 'Given' ? 'Recorded' : 'Pending record', ok: med.status === 'Administered' || med.status === 'Given' }
    ];

    return `
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
            ${rights.map(right => `
                <div class="rounded-xl border ${right.ok ? 'border-green-100 bg-green-50' : 'border-amber-100 bg-amber-50'} p-3">
                    <p class="text-[8px] font-black uppercase tracking-widest ${right.ok ? 'text-green-600' : 'text-amber-600'}">${right.label}</p>
                    <p class="text-[10px] font-bold text-slate-700 mt-1 leading-tight">${right.value}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function updateDashboard() {
    const db = getDB();
    
    // Data Migration: Ensure all doctors have "Dr." title
    let dbChanged = false;
    db.patients.forEach(p => {
        if (p.occupied && p.info.doctor && !p.info.doctor.startsWith('Dr.')) {
            p.info.doctor = 'Dr. ' + p.info.doctor;
            dbChanged = true;
        }
        if (p.occupied && p.medications) {
            p.medications.forEach(m => {
                if (m.prescribingDoctor && !m.prescribingDoctor.startsWith('Dr.')) {
                    m.prescribingDoctor = 'Dr. ' + m.prescribingDoctor;
                    dbChanged = true;
                }
            });
        }
    });
    
    if (dbChanged) {
        updateDB(db);
    }

    if (document.getElementById('cabinet2-section') && !document.getElementById('cabinet2-section').classList.contains('hidden')) {
        renderCabinet2();
    }
    renderAlerts();
    updateDashboardStats();
    
    // Refresh Cabinet 1 if a patient is selected
    const cab1Select = document.getElementById('cabinet1-patient-list');
    if (cab1Select && cab1Select.value) {
        if (typeof selectPatientForCabinet1 === 'function') {
            selectPatientForCabinet1(cab1Select.value);
        }
    }
    
    // Refresh Global List in Cabinet 1
    if (typeof populateCabinet1Patients === 'function') {
        populateCabinet1Patients();
    }
}

function updateDashboardStats() {
    const db = getDB();
    const now = new Date();
    const patients = db.patients.filter(p => p.occupied);
    
    let totalPending = 0;
    let totalMissed = 0;
    
    patients.forEach(p => {
        p.medications.forEach(m => {
            if (m.status === 'Pending' || m.status === 'Dispensed') {
                const dueTime = new Date(m.timeDue);
                if (now > dueTime) totalPending++;
                else totalPending++;
            }
            if (m.status === 'Missed') totalMissed++;
        });
    });

    const patientsEl = document.getElementById('stat-total-patients');
    if (patientsEl) patientsEl.innerText = patients.length;

    const pendingEl = document.getElementById('stat-pending-meds');
    if (pendingEl) pendingEl.innerText = totalPending;

    const missedEl = document.getElementById('stat-missed-doses');
    if (missedEl) missedEl.innerText = totalMissed;
}

// Auto-refresh dashboard every 30 seconds to update missed doses and alerts
setInterval(() => {
    if (document.getElementById('dashboard-section') && !document.getElementById('dashboard-section').classList.contains('hidden')) {
        updateDashboard();
    }
}, 30000);

/**
 * BCMA Unit 2: Point-of-Care Medication Administration
 * Simplified Workflow: Scan Patient -> View Due -> Scan Drug -> Administer
 */

window.initiateBCMA = function(bedNumber) {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    if (!patient) return;

    // Simulation: Scan Patient Wristband
    const scannedMRN = prompt(`[BCMA SCANNER] Please scan Patient Wristband (MRN) for Bed ${bedNumber}:`);
    
    if (!scannedMRN) return;

    if (scannedMRN.toUpperCase() !== patient.info.mrn) {
        showNotification('CRITICAL STOP: MRN Mismatch! Wrong Patient identified.', 'error');
        generateLog('BCMA_FAILURE', currentUser.id, `WRONG PATIENT: Scanned ${scannedMRN} for Bed ${bedNumber} (Expected: ${patient.info.mrn})`);
        return;
    }

    // Patient Identity Verified
    showNotification('BCMA: Patient Identity Verified.', 'success');
    openPatientBCMAModal(bedNumber);
};

function openPatientBCMAModal(bedNumber) {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    
    // Create a specialized BCMA workflow modal
    const modal = document.createElement('div');
    modal.id = 'bcma-workflow-modal';
    modal.className = 'fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[400] flex items-center justify-center p-4';
    
    const medicationsDue = patient.medications.filter(m => 
        m.status === 'Pending' || 
        m.status === 'Dispensed' || 
        m.status === 'Given' || 
        m.status === 'Administered' || 
        m.status === 'Missed'
    );
    
    modal.innerHTML = `
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-pop-in border border-white/20 max-h-[95vh] flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-4 md:p-8 text-white relative shrink-0">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div class="flex-grow">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="px-2 md:px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-300 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Patient Identity Verified
                            </span>
                        </div>
                        <h2 class="text-xl md:text-3xl font-black tracking-tighter">${patient.info.name}</h2>
                        <p class="text-blue-200 font-bold uppercase tracking-widest text-[10px] md:text-xs mt-1">Bed ${bedNumber} • ${patient.info.mrn} • Allergy: <span class="text-red-300">${patient.info.allergies}</span></p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="generatePrescriptionPrint(${JSON.stringify(patient).replace(/"/g, '&quot;')})" class="bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Print History
                        </button>
                        <button onclick="generateAllHEPrint(${JSON.stringify(patient).replace(/"/g, '&quot;')})" class="bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            Print HE Notes
                        </button>
                        <button onclick="this.closest('#bcma-workflow-modal').remove()" class="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-grow">
                <h3 class="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Medications Due for Administration</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${medicationsDue.length === 0 ? `
                        <div class="col-span-2 py-20 text-center opacity-30">
                            <p class="text-lg font-bold uppercase tracking-widest">No medications due at this time.</p>
                        </div>
                    ` : medicationsDue.map(med => {
                        const isGiven = med.status === 'Given' || med.status === 'Administered';
                        const isMissed = med.status === 'Missed';
                        const now = new Date();
                        const dueTime = new Date(med.timeDue);
                        const isOverdue = !isGiven && !isMissed && now > dueTime;
                        const statusColor = getMedicationStatus(med);
                        
                        return `
                            <div class="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all group">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <p class="text-xl font-black text-slate-900">${med.name}</p>
                                            <button onclick="handleOpenHE('${patient.info.mrn}', '${med.id}')" class="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors text-blue-600" title="Health Education Info">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            </button>
                                        </div>
                                        <p class="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1">${med.dose} • ${med.route} • ${med.frequency}</p>
                                        <div class="mt-2 flex items-center gap-2">
                                            <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ordered By:</p>
                                            <p class="text-[10px] font-black text-blue-800">${formatPrescriberName(med.prescribingDoctor || patient.info.doctor)}</p>
                                        </div>
                                    </div>
                                    <div class="flex flex-col items-end gap-2">
                                        <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                            isGiven ? 'bg-green-100 text-green-700' : 
                                            isMissed || isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        }">${isGiven ? 'GIVEN' : isMissed ? 'MISSED' : isOverdue ? 'OVERDUE' : med.status}</span>
                                        ${isMissed ? `<span class="text-[8px] font-black text-red-600 uppercase tracking-tighter">${med.justification || ''}</span>` : ''}
                                    </div>
                                </div>
                                
                                <div class="pt-4 border-t border-slate-100">
                                    ${renderSevenRightsSummary(patient, med)}
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="text-[10px] font-bold text-slate-400">
                                            <p class="uppercase tracking-tighter">Scheduled Time</p>
                                            <p class="text-slate-600">${formatDateTime(med.timeDue)}</p>
                                        </div>
                                        <div class="flex gap-2">
                                            ${isGiven 
                                                ? `<div class="flex flex-col items-end">
                                                     <button onclick="handleOpenHE('${patient.info.mrn}', '${med.id}')" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 mb-2">
                                                         📘 HE Pamphlet
                                                     </button>
                                                     ${generateNurseStamp(med.nurseName || currentUser.fullname, med.nurseRole || currentUser.role)}
                                                   </div>`
                                                : isMissed 
                                                ? `<div class="flex flex-col items-end">
                                                     <p class="text-[8px] font-black text-slate-400 uppercase mb-1">Missed Dose Documented</p>
                                                     ${generateNurseStamp(med.nurseName || currentUser.fullname, med.nurseRole || currentUser.role)}
                                                   </div>`
                                                : `
                                                    ${isOverdue ? `
                                                        <button onclick="handleShowMissedJustification(${patient.bedNumber}, '${med.id}')" class="bg-red-500 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all">Omit Dose</button>
                                                    ` : ''}
                                                    <button onclick="handleOneClickAdminister(${patient.bedNumber}, '${med.id}')" class="btn-premium px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Administered</button>
                                                  `
                                            }
                                        </div>
                                    </div>
                                    ${isGiven ? `
                                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[9px] font-bold text-slate-500">
                                            <div class="flex flex-col gap-1">
                                                <div><span class="uppercase tracking-widest text-[8px] opacity-60">Legal Record:</span> Administered at ${formatDateTime(med.timeAdministered)}</div>
                                                ${med.remarks ? `<div><span class="uppercase tracking-widest text-[8px] opacity-60">Remarks:</span> ${med.remarks}</div>` : ''}
                                            </div>
                                        </div>
                                    ` : isMissed ? `
                                        <div class="bg-red-50 p-3 rounded-xl border border-red-100 text-[9px] font-bold text-red-500">
                                            <div class="flex flex-col gap-1">
                                                <div><span class="uppercase tracking-widest text-[8px] opacity-60">Justification:</span> ${med.justification}</div>
                                                ${med.remarks ? `<div><span class="uppercase tracking-widest text-[8px] opacity-60">Remarks:</span> ${med.remarks}</div>` : ''}
                                                <div class="text-[8px] opacity-40 mt-1 italic">Recorded at ${formatDateTime(med.timeAdministered)}</div>
                                            </div>
                                        </div>
                                    ` : med.status === 'Dispensed' ? `
                                        <div class="bg-blue-50 p-3 rounded-xl border border-blue-100 text-[9px] font-bold text-blue-500">
                                            <div class="flex flex-col gap-1">
                                                <div><span class="uppercase tracking-widest text-[8px] opacity-60">Dispensed:</span> ${formatDateTime(med.timeDispensed)}</div>
                                                ${med.dispensingRemarks ? `<div><span class="uppercase tracking-widest text-[8px] opacity-60">Remarks:</span> ${med.dispensingRemarks}</div>` : ''}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div class="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">eMAR - Electronic Medication Administration Record</p>
                <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest">Authorized by: ${currentUser.fullname}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

window.handleOneClickAdminister = function(bedNumber, medId) {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    const medication = patient.medications.find(m => m.id === medId);

    if (medication.status === 'Given' || medication.status === 'Administered') {
        showNotification('Medication already administered', 'info');
        return;
    }

    // Security Verification
    if (!isAuthorizedForAction('MED_ADMINISTRATION')) {
        showNotification('SECURITY DENIED: Your role is not authorized for medication administration.', 'error');
        generateLog('SECURITY_VIOLATION', currentUser.id, `Unauthorized admin attempt for ${medication.name} (Bed ${bedNumber})`);
        return;
    }

    // Show Administration Modal with Remarks
    const modal = document.createElement('div');
    modal.id = 'admin-remarks-modal';
    modal.className = 'fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[600] flex items-center justify-center p-4 overflow-y-auto';
    
    modal.innerHTML = `
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-pop-in border-4 border-blue-500/20 my-auto">
            <div class="bg-blue-600 p-4 md:p-8 text-white text-center">
                <div class="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <svg class="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h2 class="text-xl md:text-2xl font-black uppercase tracking-tighter">Medication Administration</h2>
                <p class="text-blue-100 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Final Verification & Remarks</p>
            </div>
            
            <div class="p-4 md:p-8 space-y-4 md:space-y-6 overflow-y-auto max-h-[60vh]">
                <div class="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Medication</p>
                    <p class="text-base md:text-lg font-black text-slate-900">${medication.name}</p>
                    <p class="text-[10px] md:text-xs font-bold text-blue-600 uppercase">${medication.dose} • ${medication.route}</p>
                </div>

                <div class="space-y-2">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Remarks (Optional):</p>
                    <textarea id="admin-remarks-input" placeholder="Enter administration notes..." class="w-full p-3 md:p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:bg-white outline-none text-sm font-bold text-slate-700 h-24 md:h-28 resize-none bg-slate-50 transition-all"></textarea>
                </div>

                <div class="flex flex-col gap-3">
                    <button onclick="finalizeAdministration(${bedNumber}, '${medId}')" class="w-full py-3 md:py-4 bg-blue-600 text-white rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition-all">Confirm Administration</button>
                    <button onclick="document.getElementById('admin-remarks-modal').remove()" class="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.finalizeAdministration = function(bedNumber, medId) {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    const medication = patient.medications.find(m => m.id === medId);
    const remarks = document.getElementById('admin-remarks-input').value;

    // SIMPLIFIED WORKFLOW: Internal 5 Rights Verification (No manual scan)
    const verification = validate5Rights(patient, medication, patient.info.mrn, medication.barcode || '');

    if (verification.criticalStop) {
        showNotification(`SAFETY ALERT: ${verification.drug.message || verification.patient.message}`, 'error');
        generateLog('CLINICAL_STOP', currentUser.id, `SAFETY ALERT: ${verification.drug.message || verification.patient.message} (Bed: ${bedNumber}, Drug: ${medication.name})`);
        document.getElementById('admin-remarks-modal').remove();
        return;
    }

    // Safety Alert: High Alert or LASA
    const protocol = db.medicationProtocols[medication.name];
    if (protocol && (protocol.isHighAlert || protocol.isLASA)) {
        const type = protocol.isHighAlert ? 'HIGH_ALERT' : 'LASA';
        const details = protocol.isLASA ? protocol.lasaNote : 'HIGH ALERT: Second independent verification of dosage and pump settings mandatory.';
        
        showClinicalSafetyAlert(medication.name, type, details, () => {
            medication.remarks = remarks; // Store remarks
            processAdministration(db, medication, bedNumber);
            document.getElementById('admin-remarks-modal').remove();
        });
        return;
    }

    medication.remarks = remarks; // Store remarks
    processAdministration(db, medication, bedNumber);
    document.getElementById('admin-remarks-modal').remove();
};

window.handleShowMissedJustification = function(bedNumber, medId) {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    const medication = patient.medications.find(m => m.id === medId);

    const modal = document.createElement('div');
    modal.id = 'missed-justification-modal';
    modal.className = 'fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[600] flex items-center justify-center p-4';
    
    modal.innerHTML = `
        <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-pop-in border-4 border-red-500/20 flex flex-col max-h-[95vh]">
            <!-- Header -->
            <div class="bg-red-600 p-8 text-white text-center shrink-0">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 class="text-2xl font-black uppercase tracking-tighter">Missed Dose Documentation</h2>
                <p class="text-red-100 text-[10px] font-bold uppercase tracking-widest mt-1">Legal MAR Justification Required</p>
            </div>
            
            <div class="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-grow">
                <!-- Med Info -->
                <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medication to Omit</p>
                    <p class="text-xl font-black text-slate-900">${medication.name}</p>
                    <p class="text-[11px] font-bold text-blue-600 mt-1 uppercase">${medication.dose} • Scheduled: ${formatDateTime(medication.timeDue)}</p>
                </div>
                
                <!-- Reason Selection -->
                <div class="space-y-4">
                    <p class="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <span class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-[10px]">1</span>
                        Select Clinical Reason
                    </p>
                    <div class="grid grid-cols-1 gap-3">
                        ${['Patient refused medication', 'Patient in Operating Theatre (OT)', 'Doctor ordered to omit', 'Given But Late'].map(reason => `
                            <button onclick="selectMissedReason(this, '${reason}')" class="missed-reason-btn w-full p-5 rounded-2xl border-2 border-slate-100 hover:border-red-200 hover:bg-red-50 text-left transition-all group flex items-center justify-between">
                                <span class="text-sm font-black text-slate-700 group-hover:text-red-700">${reason}</span>
                                <div class="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-red-400"></div>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Remarks Box (The "Box" requested) -->
                <div class="space-y-4 pt-4 border-t border-slate-100">
                    <p class="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <span class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px]">2</span>
                        Additional Clinical Remarks
                    </p>
                    <div class="relative group">
                        <textarea id="missed-remarks-input" 
                            placeholder="Enter detailed clinical notes here (e.g., patient condition, vital signs, or specific instructions)..." 
                            class="w-full p-6 rounded-[2rem] border-4 border-slate-100 focus:border-blue-500 focus:bg-white outline-none text-sm font-bold text-slate-700 h-40 resize-none bg-slate-50 transition-all shadow-inner"
                        ></textarea>
                        <div class="absolute bottom-4 right-6 text-[10px] font-black text-slate-300 uppercase tracking-widest group-focus-within:text-blue-400">Clinical Record Entry</div>
                    </div>
                </div>
            </div>

            <!-- Footer Action -->
            <div class="p-8 bg-slate-50 border-t border-slate-100 shrink-0 space-y-4">
                <button id="submit-missed-btn" disabled onclick="handleMissedSubmission(${bedNumber}, '${medId}')" 
                    class="w-full py-5 bg-slate-200 text-slate-400 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all cursor-not-allowed shadow-xl">
                    Finalize Documentation
                </button>
                <button onclick="document.getElementById('missed-justification-modal').remove()" 
                    class="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-600 transition-colors">
                    Cancel & Return to eMAR
                </button>
            </div>
        </div>

        <style>
            .missed-reason-btn.selected {
                border-color: #ef4444 !important;
                background-color: #fef2f2 !important;
            }
            .missed-reason-btn.selected div {
                background-color: #ef4444 !important;
                border-color: #ef4444 !important;
                box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
            }
            .missed-reason-btn.selected span {
                color: #b91c1c !important;
            }
        </style>
    `;
    
    document.body.appendChild(modal);
    
    // Internal Helper for Selection
    let selectedReason = null;
    window.selectMissedReason = function(btn, reason) {
        document.querySelectorAll('.missed-reason-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedReason = reason;
        
        const submitBtn = document.getElementById('submit-missed-btn');
        submitBtn.disabled = false;
        submitBtn.classList.remove('bg-slate-200', 'text-slate-400', 'cursor-not-allowed');
        submitBtn.classList.add('bg-red-600', 'text-white', 'hover:bg-red-700', 'shadow-red-900/20');
    };

    window.handleMissedSubmission = function(bedNumber, medId) {
        if (!selectedReason) return;
        const remarks = document.getElementById('missed-remarks-input').value;
        submitMissedJustification(bedNumber, medId, selectedReason, remarks);
    };
};

window.handleMissedSubmission = function(bedNumber, medId, reason) {
    const remarks = document.getElementById('missed-remarks-input').value;
    submitMissedJustification(bedNumber, medId, reason, remarks);
};

window.submitMissedJustification = function(bedNumber, medId, reason, remarks = '') {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    const medication = patient.medications.find(m => m.id === medId);
    const now = new Date().toISOString();

    // Update Medication Record
    medication.status = 'Missed';
    medication.justification = reason;
    medication.remarks = remarks; // Store remarks
    medication.timeAdministered = now; // Store recording time
    medication.nurseId = currentUser.id;
    medication.nurseName = currentUser.fullname;
    medication.nurseRole = currentUser.role;

    updateDB(db);

    // Legal Audit Log
    const legalRecord = {
        patientName: patient.info.name,
        mrn: patient.info.mrn,
        medication: medication.name,
        scheduledTime: medication.timeDue,
        recordedTime: now,
        recordedBy: currentUser.fullname,
        status: "Missed",
        justification: reason,
        remarks: remarks
    };
    generateLog('LEGAL_MISSED_DOSE', currentUser.id, JSON.stringify(legalRecord));

    showNotification(`Missed dose documented: ${reason}${remarks ? ' - ' + remarks : ''}`, 'success');
    
    // UI Cleanup
    const modal = document.getElementById('missed-justification-modal');
    if (modal) modal.remove();
    openPatientBCMAModal(bedNumber);
    updateDashboard();
};

function processAdministration(db, medication, bedNumber) {
    // 4. One-Click Administration
    triggerDrawerSimulation(() => {
        const now = new Date().toISOString();
        
        // Legal Record Structure
        const legalRecord = {
            patientName: db.patients.find(p => p.bedNumber === bedNumber).info.name,
            mrn: db.patients.find(p => p.bedNumber === bedNumber).info.mrn,
            medication: medication.name,
            dose: medication.dose,
            route: medication.route,
            scheduledTime: medication.timeDue,
            administeredTime: now,
            administeredBy: currentUser.fullname,
            role: currentUser.role,
            status: "Given",
            remarks: medication.remarks || "BCMA Verified Simplified Workflow"
        };

        medication.status = 'Given';
        medication.timeAdministered = now;
        medication.nurseId = currentUser.id;
        medication.nurseName = currentUser.fullname; // Store for legal stamp
        medication.nurseRole = currentUser.role;     // Store for legal stamp

        updateDB(db);
        
        // Save to Legal Audit Log (Immutable)
        generateLog('LEGAL_MED_ADMIN', currentUser.id, JSON.stringify(legalRecord));
        
        showNotification(`${medication.name} successfully administered. Legal eMAR updated.`, 'success');
        
        // Refresh the appropriate view
        const bcmaModal = document.getElementById('bcma-workflow-modal');
        if (bcmaModal) {
            openPatientBCMAModal(bedNumber);
        } else {
            renderCabinet2();
        }
        updateDashboard();
    }, "BCMA Unit 2: Administering", `Drawer Unlocked. Please administer ${medication.name} to the patient.`);
}

window.promptUpdateTime = function(bedNumber, medId, currentTime) {
    if (!isStaffNurse()) {
        showNotification('Unauthorized: Only Staff Nurses can adjust medication timing.', 'error');
        return;
    }

    const newTimeStr = prompt('Adjust Medication Due Time (YYYY-MM-DD HH:MM):', currentTime.slice(0, 16).replace('T', ' '));
    if (newTimeStr) {
        const newTime = new Date(newTimeStr.replace(' ', 'T'));
        if (isNaN(newTime.getTime())) {
            showNotification('Invalid date format.', 'error');
            return;
        }

        const db = getDB();
        const patient = db.patients.find(p => p.bedNumber === bedNumber);
        const med = patient.medications.find(m => m.id === medId);
        
        const oldTime = med.timeDue;
        med.timeDue = newTime.toISOString();
        
        updateDB(db);
        generateLog('TIME_ADJUSTED', currentUser.id, `Adjusted ${med.name} (Bed ${bedNumber}) time from ${formatDateTime(oldTime)} to ${formatDateTime(med.timeDue)}`);
        
        showNotification(`Time adjusted for ${med.name}`, 'success');
        updateDashboard();
    }
};

function renderAlerts() {
    const alerts = checkAlerts();
    const container = document.getElementById('alerts-container');
    container.innerHTML = '';
    
    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 opacity-30">
                <svg class="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="text-sm font-bold uppercase tracking-widest">All Clear</p>
            </div>
        `;
        return;
    }

    alerts.forEach(alert => {
        const div = document.createElement('div');
        const isCritical = alert.type === 'critical';
        const isWarning = alert.type === 'warning';
        
        div.className = `group p-4 mb-3 rounded-2xl border transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md ${
            isCritical ? 'bg-red-50 border-red-100 text-red-900' : 
            isWarning ? 'bg-amber-50 border-amber-100 text-amber-900' : 
            'bg-blue-50 border-blue-100 text-blue-900'
        }`;
        
        if (alert.bedNumber) {
            div.onclick = () => openPatientModal(alert.bedNumber);
        }

        div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl ${
                    isCritical ? 'bg-red-100 text-red-600' : 
                    isWarning ? 'bg-amber-100 text-amber-600' : 
                    'bg-blue-100 text-blue-600'
                }">
                    ${isCritical ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>' : 
                      isWarning ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' : 
                      '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>'}
                </div>
                <div class="flex-grow">
                    <div class="flex justify-between items-center">
                        <p class="text-[10px] font-extrabold uppercase tracking-widest opacity-60">${alert.title}</p>
                        ${alert.bedNumber ? '<span class="text-[9px] font-bold bg-white/50 px-2 py-0.5 rounded-full">Click to view Patient</span>' : ''}
                    </div>
                    <p class="text-sm font-bold leading-tight mt-0.5">${alert.message}</p>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderCabinet2() {
    const db = getDB();
    const container = document.getElementById('cabinet2-grid');
    if (!container) return;

    const occupiedPatients = db.patients.filter(p => p.occupied);
    
    if (occupiedPatients.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 opacity-50">
                <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h3 class="text-xl font-black text-slate-900 uppercase tracking-tighter">No Active Admissions</h3>
                <p class="text-sm font-bold text-slate-400 mt-2">All beds are currently vacant in this unit.</p>
                <button onclick="hardResetDB()" class="mt-6 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">System Restore & Initialize Patients</button>
            </div>
        `;
        return;
    }

    // Auto-select first patient if none selected
    if (!currentBCMAPatient) {
        currentBCMAPatient = occupiedPatients[0];
    } else {
        // Ensure current selection is still valid and has fresh data
        const freshData = occupiedPatients.find(p => p.info.mrn === currentBCMAPatient.info.mrn);
        if (freshData) currentBCMAPatient = freshData;
        else currentBCMAPatient = occupiedPatients[0];
    }

    // Master Split-Pane Container (Responsive Focus)
    container.className = "flex flex-col lg:flex-row gap-4 p-4 min-h-0"; 
    
    // 1. LEFT SIDEBAR: Compact Bed List (Fixed width on desktop, Horizontal on mobile)
    let sidebarHtml = `
        <div id="bcma-bed-list" class="w-full lg:w-72 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar pr-2 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 max-h-[120px] lg:max-h-[70vh]">
            <div class="hidden lg:flex px-4 py-3 bg-slate-900 text-white rounded-2xl items-center justify-between shadow-lg mb-2">
                <span class="text-[10px] font-black uppercase tracking-widest">Bed Unit</span>
                <span class="px-2 py-0.5 bg-blue-500 rounded text-[9px] font-bold">${occupiedPatients.length} Active</span>
            </div>
            ${occupiedPatients.map(p => {
                const isSelected = currentBCMAPatient && currentBCMAPatient.info.mrn === p.info.mrn;
                const overdueCount = p.medications.filter(m => (m.status === 'Pending' || m.status === 'Dispensed') && new Date(m.timeDue) < new Date()).length;
                
                return `
                    <button onclick="selectPatientForBCMA('${p.info.mrn}')" 
                        class="p-4 rounded-2xl text-left transition-all relative border-2 shrink-0 lg:shrink-1 w-48 lg:w-full ${
                            isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20 scale-[1.02] z-10' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50'
                        }">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-[11px] font-black uppercase tracking-widest ${isSelected ? 'text-blue-100' : 'text-slate-400'}">Bed ${p.bedNumber}</span>
                            ${overdueCount > 0 ? `<span class="px-1.5 py-0.5 bg-red-500 text-white rounded text-[8px] font-black animate-pulse">${overdueCount} DUE</span>` : ''}
                        </div>
                        <p class="text-sm font-black tracking-tight truncate">${p.info.name}</p>
                        <p class="text-[9px] font-bold uppercase ${isSelected ? 'text-blue-200' : 'text-blue-600'} mt-1 truncate">${p.info.mrn}</p>
                    </button>
                `;
            }).join('')}
        </div>
    `;

    // 2. MAIN AREA: Patient eMAR & Details (Flex-grow, Internal scroll)
    const patient = currentBCMAPatient;
    const medications = patient.medications;
    const dispensedMeds = medications.filter(m => m.status === 'Dispensed');
    let mainContentHtml = `
        <div class="flex-grow flex flex-col gap-4">
            <!-- Top Clinical Header (Details at a glance) -->
            <div class="bg-white rounded-3xl p-4 md:p-6 border-2 border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between shrink-0 gap-4">
                <div class="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                    <div class="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl font-black shadow-lg shadow-blue-500/20 shrink-0">
                        ${patient.bedNumber}
                    </div>
                    <div class="min-w-0">
                            <h2 class="text-lg md:text-2xl font-black text-slate-900 tracking-tighter leading-none truncate">${patient.info.name}</h2>
                            <div class="flex gap-2 md:gap-4 mt-1 md:mt-2">
                                <p class="text-[8px] md:text-[10px] font-bold text-blue-600 uppercase tracking-widest truncate">${(patient.info.doctor.startsWith('Dr.') ? '' : 'Dr. ') + patient.info.doctor}</p>
                                <span class="text-slate-200">•</span>
                                <p class="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Nurse: ${patient.info.nurseInCharge}</p>
                            </div>
                        </div>
                </div>

                <div class="hidden xl:flex gap-8 px-8 border-l border-slate-100">
                    <div>
                        <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Diagnosis</p>
                        <p class="text-xs font-black text-slate-700 max-w-[200px] truncate">${patient.info.diagnosis}</p>
                    </div>
                    <div class="px-6 py-2 rounded-xl ${patient.info.allergies !== 'None (NKDA)' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}">
                        <p class="text-[8px] font-black uppercase tracking-widest mb-0.5">Allergies</p>
                        <p class="text-[10px] font-black">${patient.info.allergies}</p>
                    </div>
                </div>

                <div class="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                    <div class="text-right hidden sm:block mr-2">
                        <p class="text-[8px] font-black text-slate-400 uppercase mb-1">Vitals</p>
                        <div class="flex gap-3 text-[10px] font-black text-slate-900">
                            <span class="text-blue-600">${patient.info.diagnosticResults.vitals.bp}</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2 justify-center">
                        <button onclick="openPatientModal(${patient.bedNumber})" class="bg-slate-900 text-white px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2">
                            Profile
                        </button>
                        <button onclick="generatePrescriptionPrint(${JSON.stringify(patient).replace(/"/g, '&quot;')})" class="bg-blue-600 text-white px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
                            eMAR
                        </button>
                        <button onclick="generateAllHEPrint(${JSON.stringify(patient).replace(/"/g, '&quot;')})" class="bg-indigo-600 text-white px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                            HE
                        </button>
                        <button onclick="openPatientBCMAModal(${patient.bedNumber})" class="btn-premium px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all">
                            History
                        </button>
                    </div>
                </div>
            </div>

            <!-- eMAR Table (Scrollable area) -->
            <div class="bg-white rounded-3xl border-2 border-slate-100 shadow-2xl overflow-hidden flex flex-col">
                <div class="px-4 md:px-8 py-3 md:py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <h3 class="text-[9px] md:text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Standard Clinical Administration Record (eMAR)</h3>
                    <div class="flex items-center gap-3">
                        <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-black uppercase">${medications.length} Rx</span>
                    </div>
                </div>

                <div class="max-h-[50vh] overflow-auto custom-scrollbar">
                    <table class="w-full text-left border-collapse min-w-[800px]">
                        <thead class="sticky top-0 bg-white z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th class="px-8 py-4">Medication Agent</th>
                                <th class="px-6 py-4">Prescriber</th>
                                <th class="px-6 py-4">Route/Freq</th>
                                <th class="px-6 py-4 text-center">Schedule</th>
                                <th class="px-6 py-4">7 Rights Check</th>
                                <th class="px-6 py-4">Remarks/Legal Record</th>
                                <th class="px-8 py-4 text-right">Administration</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            ${medications.map(med => {
                                const isGiven = med.status === 'Given' || med.status === 'Administered';
                                const isMissed = med.status === 'Missed';
                                const now = new Date();
                                const dueTime = new Date(med.timeDue);
                                const isOverdue = !isGiven && !isMissed && now > dueTime;
                                
                                return `
                                    <tr class="group transition-all ${isGiven || isMissed ? 'bg-slate-50/50 opacity-60' : 'hover:bg-blue-50/30'}">
                                        <td class="px-8 py-6">
                                            <div class="flex items-center gap-3">
                                                <div class="w-2.5 h-2.5 rounded-full ${isGiven ? 'bg-green-500' : isMissed || isOverdue ? 'bg-red-500' : 'bg-amber-400 animate-pulse'}"></div>
                                                <div class="flex-grow">
                                                    <div class="flex items-center gap-2">
                                                        <p class="text-sm font-black text-slate-900 tracking-tight leading-none">${med.name}</p>
                                                        <button onclick="handleOpenHE('${patient.info.mrn}', '${med.id}')" class="p-1 hover:bg-blue-100 rounded-full transition-colors text-blue-600" title="Clinical Information & HE">
                                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        </button>
                                                    </div>
                                                    <p class="text-[10px] font-bold text-slate-500 mt-1.5">${med.dose}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-6">
                                            <div class="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                                                <p class="text-[8px] font-black text-blue-500 uppercase tracking-widest">Prescribed By</p>
                                                <p class="text-[11px] font-black text-blue-900 mt-1 leading-snug">${formatPrescriberName(med.prescribingDoctor || patient.info.doctor)}</p>
                                                <p class="text-[8px] font-bold text-blue-600 mt-2 uppercase tracking-widest">Prescription Time</p>
                                                <p class="text-[9px] font-bold text-blue-800 mt-1">${formatDateTime(med.prescribedAt || med.timeDue)}</p>
                                            </div>
                                        </td>
                                        <td class="px-6 py-6">
                                            <span class="text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">${med.route}</span>
                                            <p class="text-[9px] font-black text-slate-400 mt-1 uppercase">${med.frequency}</p>
                                        </td>
                                        <td class="px-6 py-6 text-center">
                                            <span class="text-[10px] font-black text-slate-700">${formatDateTime(med.timeDue)}</span>
                                            ${isOverdue ? '<p class="text-[8px] font-black text-red-600 uppercase tracking-widest mt-1">Overdue</p>' : ''}
                                        </td>
                                        <td class="px-6 py-6">
                                            <div class="grid grid-cols-1 gap-2 min-w-[220px]">
                                                <div class="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Right Patient</p>
                                                    <p class="text-[9px] font-bold text-slate-700 mt-1">Bed ${patient.bedNumber} · ${patient.info.mrn}</p>
                                                </div>
                                                <div class="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Right Drug / Dose / Route</p>
                                                    <p class="text-[9px] font-bold text-slate-700 mt-1">${med.name}</p>
                                                    <p class="text-[9px] font-bold text-slate-700">${med.dose} · ${med.route}</p>
                                                </div>
                                                <div class="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Right Time / Reason / Documentation</p>
                                                    <p class="text-[9px] font-bold ${isOverdue ? 'text-red-600' : 'text-slate-700'} mt-1">${isOverdue ? 'Overdue review required' : 'Scheduled window active'}</p>
                                                    <p class="text-[9px] font-bold text-slate-700">${med.reasonForPrescription || patient.info.diagnosis}</p>
                                                    <p class="text-[9px] font-bold ${isGiven ? 'text-emerald-700' : 'text-amber-700'}">${isGiven ? 'Documented in eMAR' : 'Awaiting documentation'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-6">
                                            ${isMissed ? `
                                                <div class="p-3 bg-red-50 rounded-xl border border-red-100">
                                                    <p class="text-[9px] font-black text-red-700 uppercase mb-0.5">${med.justification}</p>
                                                    <p class="text-[10px] font-bold text-red-900 italic leading-tight">"${med.remarks || 'No remarks'}"</p>
                                                </div>
                                            ` : isGiven ? `
                                                <div class="p-3 bg-green-50 rounded-xl border border-green-100">
                                                    <p class="text-[10px] font-bold text-green-800 italic leading-tight">"${med.remarks || 'Verified Administration'}"</p>
                                                </div>
                                            ` : med.status === 'Dispensed' ? `
                                                <div class="p-3 bg-blue-50 rounded-xl border border-blue-100 animate-pulse">
                                                    <p class="text-[9px] font-black text-blue-700 uppercase">Awaiting Administration</p>
                                                    <p class="text-[10px] font-bold text-blue-900 italic leading-tight mt-0.5">"${med.dispensingRemarks || 'Direct Transfer'}"</p>
                                                </div>
                                            ` : `<p class="text-[10px] font-bold text-slate-300 italic">No record entry...</p>`}
                                        </td>
                                        <td class="px-8 py-6 text-right">
                                            ${isGiven 
                                                ? `<div class="flex flex-col items-end">
                                                    <p class="text-[10px] font-black text-slate-900 leading-none">${med.nurseName || 'Authorized Nurse'}</p>
                                                    <p class="text-[8px] font-bold text-slate-400 mt-1">${new Date(med.timeAdministered).toLocaleTimeString()}</p>
                                                  </div>`
                                                : isMissed 
                                                ? `<p class="text-[9px] font-black text-red-600 uppercase tracking-widest">Documented Missed</p>`
                                                : `
                                                    <div class="flex justify-end gap-2">
                                                        ${isOverdue ? `
                                                            <button onclick="handleShowMissedJustification(${patient.bedNumber}, '${med.id}')" class="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all">Omit</button>
                                                        ` : ''}
                                                        <button onclick="handleOneClickAdminister(${patient.bedNumber}, '${med.id}')" class="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Administer</button>
                                                    </div>
                                                  `
                                            }
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    `;

    container.innerHTML = sidebarHtml + mainContentHtml;

    const bedList = document.getElementById('bcma-bed-list');
    if (bedList) {
        bedList.scrollTop = bcmaBedListScrollTop;
        bedList.scrollLeft = bcmaBedListScrollLeft;
        bedList.onscroll = () => {
            bcmaBedListScrollTop = bedList.scrollTop;
            bcmaBedListScrollLeft = bedList.scrollLeft;
        };
    }
}

window.selectPatientForBCMA = function(mrn) {
    const existingBedList = document.getElementById('bcma-bed-list');
    if (existingBedList) {
        bcmaBedListScrollTop = existingBedList.scrollTop;
        bcmaBedListScrollLeft = existingBedList.scrollLeft;
    }
    const db = getDB();
    const patient = db.patients.find(p => p.info.mrn === mrn);
    if (patient) {
        currentBCMAPatient = patient;
        renderCabinet2();
    }
};

/**
 * Global Handler for Health Education Pamphlets
 * Fixes accessibility issues by using ID lookup instead of object stringification
 */
window.handleOpenHE = function(mrn, medId) {
    const db = getDB();
    const patient = db.patients.find(p => p.info.mrn === mrn);
    if (!patient) return;
    
    const med = patient.medications.find(m => m.id === medId);
    if (!med) return;
    
    // Toggle logic: If mobile (width < 768), show in-app HTML modal. Otherwise, open A4 printable PDF.
    if (window.innerWidth < 768) {
        showHEModal(patient, med);
    } else {
        generateHEPamphlet(patient, med);
    }
};

/**
 * Clinical Alerts Engine
 */
function getClinicalAlerts(patient) {
    const alerts = [];
    const db = getDB();

    // 1. Allergy Alerts
    if (patient.info.allergies && patient.info.allergies !== 'None (NKDA)') {
        alerts.push(`CRITICAL ALLERGY: ${patient.info.allergies}`);
    }

    // 2. High-Alert Medication Alerts
    patient.medications.forEach(m => {
        const protocol = db.medicationProtocols[m.name];
        if (protocol && protocol.isHighAlert && m.status !== 'Given' && m.status !== 'Administered') {
            alerts.push(`HIGH-ALERT DUE: ${m.name}`);
        }
    });

    // 3. Timing Alerts (Overdue meds)
    const now = new Date();
    patient.medications.forEach(m => {
        if ((m.status === 'Pending' || m.status === 'Dispensed') && new Date(m.timeDue) < now) {
            alerts.push(`OVERDUE: ${m.name} (Due ${formatDateTime(m.timeDue)})`);
        }
    });

    return alerts;
}

window.registerNewPatient = function(bedNumber) {
    const rn = prompt(`Enter Patient Registration Number (RN/MRN) for Bed ${bedNumber}:`);
    if (!rn || rn.trim() === '') {
        showNotification('Registration cancelled: Invalid MRN/RN', 'error');
        return;
    }

    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    if (!patient) return;

    // Clinical Scenarios Database for Realistic Demo
    const scenarios = [
        {
            diagnosis: 'Type 2 Diabetes Mellitus with Diabetic Foot Ulcer (DFU)',
            meds: [
                { name: 'Metformin 500mg Tablet', dose: '500mg', route: 'Oral (PO)', freq: 'BD' },
                { name: 'Insulin Actrapid (Soluble) SC', dose: '12 units', route: 'Subcutaneous (SC)', freq: 'TDS (Pre-meal)' },
                { name: 'Ceftriaxone 1g Injection', dose: '1g', route: 'Intravenous (IV)', freq: 'OD' },
                { name: 'Aspirin 75mg Tablet', dose: '75mg', route: 'Oral (PO)', freq: 'OD' }
            ],
            clinicalNote: 'Patient admitted for DFU management. Wound debridement planned. Monitoring CBG levels pre-meals.'
        },
        {
            diagnosis: 'Acute Coronary Syndrome (ACS) - NSTEMI',
            meds: [
                { name: 'Clopidogrel 75mg Tablet', dose: '75mg', route: 'Oral (PO)', freq: 'OD' },
                { name: 'Bisoprolol 5mg Tablet', dose: '5mg', route: 'Oral (PO)', freq: 'OD' },
                { name: 'Enoxaparin 40mg/0.4ml Pre-filled Syringe', dose: '40mg', route: 'Subcutaneous (SC)', freq: 'BD' },
                { name: 'Pantoprazole 40mg Injection', dose: '40mg', route: 'Intravenous (IV)', freq: 'OD' }
            ],
            clinicalNote: 'NSTEMI protocol initiated. Stable vitals. Monitoring for chest pain and bleeding tendencies.'
        },
        {
            diagnosis: 'Community Acquired Pneumonia (CAP) - CURB-65 Score 2',
            meds: [
                { name: 'Piperacillin/Tazobactam 4.5g Injection', dose: '4.5g', route: 'Intravenous (IV)', freq: 'TDS' },
                { name: 'Paracetamol 500mg Tablet', dose: '1g', route: 'Oral (PO)', freq: 'PRN (Fever)' },
                { name: 'Furosemide 20mg/2ml Injection', dose: '20mg', route: 'Intravenous (IV)', freq: 'BD' },
                { name: 'Amoxicillin 500mg Capsule', dose: '500mg', route: 'Oral (PO)', freq: 'TDS' }
            ],
            clinicalNote: 'Productive cough and fever. Oxygen support 2L/min via NP. Antibiotic therapy day 2.'
        },
        {
            diagnosis: 'Post-Appendectomy with Surgical Site Infection (SSI)',
            meds: [
                { name: 'Morphine 10mg/ml Injection (Controlled Drug)', dose: '2.5mg', route: 'Intravenous (IV)', freq: 'PRN (Pain)' },
                { name: 'Metronidazole 500mg/100ml IV Infusion', dose: '500mg', route: 'Intravenous (IV)', freq: 'TDS' },
                { name: 'Pantoprazole 40mg Injection', dose: '40mg', route: 'Intravenous (IV)', freq: 'OD' },
                { name: 'Ondansetron 4mg/2ml Injection', dose: '4mg', route: 'Intravenous (IV)', freq: 'PRN (Nausea)' }
            ],
            clinicalNote: 'Post-op day 3. Wound discharge noted. Culture and sensitivity sent. Pain managed via PCA/IV PRN.'
        }
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const firstName = ['Ahmad', 'Fatimah', 'Zubair', 'Aisyah', 'Umar', 'Khadijah', 'Ali', 'Zainab', 'Hassan', 'Maryam'][Math.floor(Math.random() * 10)];
    const lastName = ['Abdullah', 'Rahman', 'Ismail', 'Yusof', 'Ibrahim', 'Aziz', 'Hamzah', 'Saleh', 'Mahmud', 'Idris'][Math.floor(Math.random() * 10)];
    
    // Demo Optimization: Dynamic Time Scheduling & Unique Prescribing Doctors
    const now = new Date();
    
    // Create a pool of doctors and shuffle them to ensure uniqueness for each medication if needed,
    // or just ensure the patient's doctor is unique from other cases.
    const shuffledDoctors = [...db.doctors].sort(() => 0.5 - Math.random());
    const caseDoctor = shuffledDoctors.pop();
    
    const patientMeds = scenario.meds.map((med, index) => {
        const timeDue = new Date(now.getTime());
        // Stagger due times: -15 min (slightly overdue), +30 min (due soon), +2h, +4h
        const offsets = [-15, 30, 120, 240]; 
        timeDue.setMinutes(timeDue.getMinutes() + offsets[index % offsets.length]);
        
        // Use a different doctor from the pool for each medication order if possible
        const prescribingDoc = shuffledDoctors.length > 0 ? shuffledDoctors.pop() : caseDoctor;

        return {
            id: `MED-${Date.now()}-${bedNumber}-${index}`,
            name: med.name,
            dose: med.dose,
            route: med.route,
            frequency: med.freq,
            timeDue: timeDue.toISOString(),
            status: 'Pending',
            prescribingDoctor: prescribingDoc, // KKM MAR Requirement
            nurseId: 'Admitting Nurse',
            nurseInCharge: currentUser.fullname, // Current session nurse
            timeDispensed: null,
            timeAdministered: null
        };
    });

    // Populate patient info
    patient.occupied = true;
    patient.info = {
        name: `${firstName} ${lastName}`,
        mrn: rn.toUpperCase(),
        bedNumber: bedNumber,
        doctor: caseDoctor.startsWith('Dr.') ? caseDoctor : 'Dr. ' + caseDoctor,
        nurseInCharge: currentUser.fullname, // KKM MAR Requirement
        diagnosis: scenario.diagnosis,
        clinicalProgress: scenario.clinicalNote,
        diagnosticResults: {
            woundImage: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=400',
            xrayImage: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=400',
            vitals: {
                bp: `${110 + Math.floor(Math.random() * 30)}/${70 + Math.floor(Math.random() * 20)} mmHg`,
                hr: `${70 + Math.floor(Math.random() * 20)} bpm`,
                rr: `${14 + Math.floor(Math.random() * 6)} bpm`,
                temp: `${(36.5 + Math.random()).toFixed(1)}°C`,
                spo2: `${96 + Math.floor(Math.random() * 4)}%`,
                dxt: `${(5.0 + Math.random() * 5).toFixed(1)} mmol/L`,
                painScore: `${Math.floor(Math.random() * 4)}/10`,
                gcs: '15/15',
                ecg: 'Normal Sinus Rhythm'
            }
        }
    };
    patient.medications = patientMeds;

    updateDB(db);
    generateLog('PATIENT_REGISTRATION', currentUser.id, `Registered ${patient.info.name} (${patient.info.mrn}) for ${scenario.diagnosis}. Prescribed by ${patient.info.doctor}.`);
    showNotification(`Registered for ${scenario.diagnosis}.`, 'success');
    renderCabinet2();
};

window.restockItem = function(itemId) {
    const db = getDB();
    const item = db.inventory.find(i => i.id === itemId);
    if (!item) return;

    refreshInventoryDerivedFields(item);

    // Show replenishment instructions for ADC Cabinet 1
    const instructions = `
        ADC CABINET 1 REPLENISHMENT PROTOCOL:
        1. Verify current active batch: ${item.batch}
        2. Inspect physical integrity of medication.
        3. Prepare new incoming batch and expiry details.
        4. Place items into the designated slot.
        4. Close the drawer firmly after completion.
        
        Click OK to proceed with restocking.
    `;
    
    if (!confirm(instructions)) return;

    const qty = prompt(`Enter quantity of ${item.name} to replenish:`);
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) {
        showNotification('Invalid quantity entered', 'error');
        return;
    }

    const batch = prompt(`Enter NEW batch number for ${item.name}:`, `LOT-${Math.floor(Math.random() * 9000) + 1000}`);
    if (!batch) {
        showNotification('Batch number is required', 'error');
        return;
    }

    const expiry = prompt(`Enter expiry date for batch ${batch} (YYYY-MM-DD):`, new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    if (!expiry || Number.isNaN(new Date(expiry).getTime())) {
        showNotification('Invalid expiry date. Use YYYY-MM-DD format.', 'error');
        return;
    }

    // Trigger Replenishment Drawer Simulation (Cabinet 1)
    triggerDrawerSimulation(() => {
        if (!Array.isArray(item.lots)) item.lots = [];
        item.lots.push(createInventoryLot(parseInt(qty), expiry, batch));
        refreshInventoryDerivedFields(item);
        updateDB(db);
        generateLog('INVENTORY_REPLENISHMENT', currentUser.id, `Replenished ${qty} units of ${item.name} (Batch: ${batch}, Expiry: ${expiry})`);
        renderInventory();
        showNotification(`Successfully replenished ${qty} units of ${item.name}`, 'success');
    }, "Cabinet 1: Replenishing", "Drawer Opened. Please place items into the slot.");
};

function triggerDrawerSimulation(callback, title = "Cabinet Access", message = "Please take item in 10 seconds") {
    const overlay = document.getElementById('drawer-simulation');
    const animContainer = document.getElementById('drawer-anim-container');
    const countdownEl = document.getElementById('drawer-countdown');
    const titleEl = document.getElementById('drawer-title');
    const msgEl = document.getElementById('drawer-timer-text');
    const handTake = document.getElementById('hand-take-emoji');
    const handPut = document.getElementById('hand-put-emoji');
    
    titleEl.innerText = title;
    msgEl.innerText = message;
    
    // Reset classes
    handTake.classList.remove('active');
    handPut.classList.remove('active');
    overlay.classList.add('active');
    
    setTimeout(() => {
        animContainer.classList.add('open');
        
        // Trigger hand animations based on action
        if (title.includes("Dispensing") || title.includes("Cabinet Access")) {
            // "Taking" medication from Cabinet 2
            setTimeout(() => handTake.classList.add('active'), 800);
        } else if (title.includes("Replenishing")) {
            // "Putting" medication into Cabinet 1
            setTimeout(() => handPut.classList.add('active'), 800);
        }
    }, 100);

    let timeLeft = 5;
    countdownEl.innerText = timeLeft;

    const timer = setInterval(() => {
        timeLeft--;
        countdownEl.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            animContainer.classList.remove('open');
            setTimeout(() => {
                overlay.classList.remove('active');
                if (callback) callback();
            }, 500);
        }
    }, 1000);
}

window.triggerTransferSimulation = function(callback) {
    const overlay = document.getElementById('transfer-simulation');
    const progressBar = document.getElementById('transfer-progress-bar');
    
    overlay.classList.add('active');
    progressBar.style.width = '0%';

    let progress = 0;
    const interval = setInterval(() => {
        progress += 5; // Faster increment for 5s total
        if (progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.classList.remove('active');
                if (callback) callback();
            }, 500);
        }
    }, 200); // 200ms * 20 steps = 4 seconds + buffer = 5s
}

window.triggerPreparationSimulation = function(callback, solution, med) {
    const overlay = document.getElementById('prep-simulation');
    const progressCircle = document.getElementById('prep-progress-circle');
    const itemText = document.getElementById('prep-item-text');
    
    itemText.innerText = `${med} + ${solution}`;
    overlay.classList.add('active');
    
    const totalCircumference = 553;
    progressCircle.style.strokeDashoffset = totalCircumference;

    let progress = 0;
    const interval = setInterval(() => {
        progress += 4; // Faster increment
        const offset = totalCircumference - (progress / 100) * totalCircumference;
        progressCircle.style.strokeDashoffset = offset;

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.classList.remove('active');
                if (callback) callback();
            }, 500);
        }
    }, 150); // 150ms * 25 steps = 3.75s + buffer = ~5s
}

window.reportAssetIssue = function(itemId) {
    const issue = prompt("Select issue type:\n1. Sedimentation\n2. Leakage\n3. Contamination\n4. Damaged Packaging\n5. Expired\nEnter number (1-5):");
    
    let issueText = "";
    switch(issue) {
        case '1': issueText = "Sedimentation"; break;
        case '2': issueText = "Leakage"; break;
        case '3': issueText = "Contamination"; break;
        case '4': issueText = "Damaged Packaging"; break;
        case '5': issueText = "Expired"; break;
        default: 
            if (issue) showNotification('Invalid issue selection', 'error');
            return;
    }

    const qty = prompt(`Enter quantity of ${issueText} assets to decommission:`);
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) {
        showNotification('Invalid quantity entered', 'error');
        return;
    }

    const db = getDB();
    const item = db.inventory.find(i => i.id === itemId);
    if (item) {
        refreshInventoryDerivedFields(item);
        if (item.quantity < parseInt(qty)) {
            showNotification('Insufficient quantity in stock to report this amount', 'error');
            return;
        }

        let targetLot = null;
        if (Array.isArray(item.lots) && item.lots.length > 0) {
            const lotOptions = item.lots.map((lot, index) => `${index + 1}. ${lot.batch} | ${lot.expiry} | Qty ${lot.quantity}`).join('\n');
            const selected = prompt(`Select batch to remove from:\n${lotOptions}\nEnter number:`, '1');
            const selectedIndex = parseInt(selected, 10) - 1;
            targetLot = item.lots[selectedIndex];
            if (!targetLot) {
                showNotification('Invalid batch selection', 'error');
                return;
            }
            if (targetLot.quantity < parseInt(qty)) {
                showNotification('Selected batch does not have enough quantity', 'error');
                return;
            }
            targetLot.quantity -= parseInt(qty);
        } else {
            item.quantity -= parseInt(qty);
        }

        refreshInventoryDerivedFields(item);
        updateDB(db);
        generateLog('ASSET_INTEGRITY_ISSUE', currentUser.id, `Decommissioned ${qty} units of ${item.name} due to ${issueText} (Batch: ${targetLot ? targetLot.batch : item.batch})`);
        renderInventory();
        showNotification(`Reported ${issueText} for ${qty} units of ${item.name}. Assets removed from inventory.`, 'warning');
    }
};

window.showInventoryLots = function(itemId) {
    const db = getDB();
    const item = db.inventory.find(i => i.id === itemId);
    if (!item) {
        showNotification('Batch details not found for this medication.', 'error');
        return;
    }
    if (!Array.isArray(item.lots) || item.lots.length < 2) {
        ensureInventoryLotDepth(item, Math.max(0, 2 - (item.lots?.length || 0)));
    } else {
        refreshInventoryDerivedFields(item);
    }
    updateDB(db);
    const existingModal = document.getElementById('inventory-batch-modal');
    if (existingModal) existingModal.remove();
    item.lots.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
    const expiredLots = item.lots.filter(lot => new Date(lot.expiry) < new Date());
    const nearExpiryLots = item.lots.filter(lot => {
        const days = (new Date(lot.expiry) - new Date()) / (1000 * 60 * 60 * 24);
        return days >= 0 && days <= 30;
    });
    const activeLots = item.lots.filter(lot => new Date(lot.expiry) >= new Date());
    const movementLogs = [...db.logs]
        .filter(log => log.details && log.details.includes(item.name))
        .slice(-8)
        .reverse();

    const lotsHtml = item.lots.map((lot, index) => {
        const lifecycle = getLotLifecycle(lot.expiry);
        const isFefo = index === 0;
        const isDepleted = lot.quantity === 0;
        return `
            <div class="rounded-2xl border ${isDepleted ? 'border-slate-200 bg-slate-50' : lifecycle.label === 'Expired' ? 'border-red-200 bg-red-50' : lifecycle.label === 'Near Expiry' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'} p-4">
                <div class="flex justify-between items-start gap-3">
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch</p>
                        <p class="text-sm font-mono font-bold text-slate-900">${lot.batch}</p>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                        <span class="px-2 py-1 rounded-full border text-[9px] font-black uppercase ${isDepleted ? 'bg-slate-100 text-slate-600 border-slate-200' : lifecycle.chipClass}">${isDepleted ? 'Depleted' : lifecycle.label}</span>
                        ${isFefo ? '<span class="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black uppercase">FEFO Priority</span>' : ''}
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiry</p>
                        <p class="text-sm font-bold ${lifecycle.textClass}">${lot.expiry}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                        <p class="text-sm font-bold text-slate-800">${lot.quantity} units</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shelf Life</p>
                        <p class="text-sm font-bold ${isDepleted ? 'text-slate-600' : lifecycle.textClass}">${isDepleted ? 'Stock exhausted' : lifecycle.subtitle}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const movementHtml = movementLogs.length > 0 ? movementLogs.map(log => `
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="flex items-center justify-between gap-3">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${log.type.replace(/_/g, ' ')}</p>
                <p class="text-[10px] font-bold text-slate-500">${new Date(log.timestamp).toLocaleString()}</p>
            </div>
            <p class="text-sm font-bold text-slate-800 mt-2 leading-relaxed">${log.details}</p>
        </div>
    `).join('') : `
        <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
            <p class="text-sm font-bold text-slate-500">No recent movement logs found for this medication yet.</p>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'inventory-batch-modal';
    modal.className = 'fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[500] flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-pop-in">
            <div class="bg-slate-900 text-white p-6 flex items-center justify-between">
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Batch View</p>
                    <h3 class="text-2xl font-black tracking-tight">${item.name}</h3>
                    <p class="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">FEFO managed • Batch-aware stock control</p>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="p-3 bg-white/10 rounded-full">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="p-6 overflow-y-auto max-h-[65vh] space-y-4 custom-scrollbar">
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Quantity</p>
                        <p class="text-xl font-black text-slate-900 mt-2">${item.quantity}</p>
                    </div>
                    <div class="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                        <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest">Active Lots</p>
                        <p class="text-xl font-black text-blue-800 mt-2">${activeLots.length}</p>
                    </div>
                    <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p class="text-[9px] font-black text-amber-600 uppercase tracking-widest">Near Expiry</p>
                        <p class="text-xl font-black text-amber-800 mt-2">${nearExpiryLots.length}</p>
                    </div>
                    <div class="rounded-2xl border border-red-200 bg-red-50 p-4">
                        <p class="text-[9px] font-black text-red-600 uppercase tracking-widest">Expired Lots</p>
                        <p class="text-xl font-black text-red-800 mt-2">${expiredLots.length}</p>
                    </div>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">FEFO Priority Batch</p>
                    <p class="text-sm font-mono font-bold text-slate-900 mt-2">${item.batch}</p>
                    <p class="text-[10px] font-bold text-slate-500 mt-1">Next expiry in use: ${item.expiry}</p>
                </div>
                <div class="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                    <p class="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Batch Governance</p>
                    <p class="text-sm font-bold text-indigo-900 mt-2 leading-relaxed">Each replenishment creates a new batch record with its own expiry date and quantity. Issue reporting can remove stock from a specific batch, including expired lots.</p>
                </div>
                ${lotsHtml}
                <div class="pt-2">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Recent Inventory Movements</p>
                            <p class="text-xs font-bold text-slate-500 mt-1">Restock, decommission, and issue-related activity for this medication.</p>
                        </div>
                    </div>
                    <div class="space-y-3">
                        ${movementHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

function renderInventory() {
    const db = getDB();
    const container = document.getElementById('inventory-list');
    const totalSkuEl = document.getElementById('inv-total-sku');
    const lowAlertsEl = document.getElementById('inv-low-alerts');
    
    container.innerHTML = '';
    
    let lowCount = 0;
    totalSkuEl.innerText = db.inventory.length;

    db.inventory.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
        refreshInventoryDerivedFields(item);
        const isLow = item.quantity < 10;
        if (isLow) lowCount++;
        const expiredLots = (item.lots || []).filter(lot => getLotLifecycle(lot.expiry).label === 'Expired').length;
        const nearExpiryLots = (item.lots || []).filter(lot => getLotLifecycle(lot.expiry).label === 'Near Expiry').length;
        const fefoLot = item.lots && item.lots.length ? [...item.lots].sort((a, b) => new Date(a.expiry) - new Date(b.expiry))[0] : null;
        const div = document.createElement('div');
        // Mobile-friendly card layout that switches to grid on desktop
        div.className = 'p-5 md:p-6 border-b border-slate-100 hover:bg-slate-50 transition-all group';
        
        const expiryDate = new Date(item.expiry);
        const isExpired = expiryDate < new Date();
        const isNearExpiry = (expiryDate - new Date()) / (1000 * 60 * 60 * 24) < 30;

        div.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <!-- Medicine Name -->
                <div class="md:col-span-3">
                    <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medicine</p>
                    <div class="flex items-center justify-between md:block">
                        <p class="font-black text-slate-900 group-hover:text-blue-600 transition-colors text-base md:text-sm">${item.name}</p>
                        <span class="md:hidden text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">ID: ${item.id}</span>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-2">
                        <span class="hidden md:inline-block text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">ID: ${item.id}</span>
                        <button onclick="showInventoryLots('${item.id}')" class="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100">View ${item.lotCount || item.lots?.length || 1} Batches</button>
                        ${expiredLots > 0 ? `<span class="text-[9px] font-black px-2 py-0.5 bg-red-50 text-red-700 rounded-full">${expiredLots} expired</span>` : ''}
                        ${nearExpiryLots > 0 ? `<span class="text-[9px] font-black px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">${nearExpiryLots} near expiry</span>` : ''}
                    </div>
                </div>

                <!-- Batch -->
                <div class="grid grid-cols-2 md:block md:col-span-2 bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-xl">
                    <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch</p>
                    <p class="text-xs font-mono font-bold text-slate-700 text-right md:text-left">${item.batch}</p>
                    <p class="text-[8px] font-bold text-slate-400 text-right md:text-left mt-1">${item.lotCount || item.lots?.length || 1} batch(es)</p>
                    ${fefoLot ? `<p class="text-[8px] font-bold text-blue-600 text-right md:text-left mt-1">FEFO: ${fefoLot.batch}</p>` : ''}
                </div>

                <!-- Stock -->
                <div class="grid grid-cols-2 md:block md:col-span-2 bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-xl">
                    <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In Stock</p>
                    <div class="flex items-center justify-end md:justify-start gap-2">
                        <p class="text-lg md:text-xl font-black ${isLow ? 'text-red-500 animate-pulse' : 'text-blue-600'}">${item.quantity}</p>
                        <span class="text-[9px] font-bold text-slate-400 uppercase">Units</span>
                    </div>
                </div>

                <!-- Expiry -->
                <div class="grid grid-cols-2 md:block md:col-span-2 bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-xl">
                    <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiry</p>
                    <p class="text-[11px] md:text-xs font-bold ${isExpired ? 'text-red-600' : isNearExpiry ? 'text-amber-600' : 'text-slate-600'} text-right md:text-left">
                        ${item.expiry}
                        <span class="block md:inline text-[8px]">${isExpired ? ' (EXPIRED)' : isNearExpiry ? ' (NEARBY)' : ''}</span>
                    </p>
                </div>

                <!-- Temp -->
                <div class="grid grid-cols-2 md:block md:col-span-1 bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-xl">
                    <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Temp</p>
                    <p class="text-xs font-bold text-slate-700 text-right md:text-left">${item.temperature}°C</p>
                </div>

                <!-- Actions -->
                <div class="md:col-span-2 flex justify-center md:justify-end gap-3 md:gap-2 mt-2 md:mt-0">
                    <button onclick="restockItem('${item.id}')" class="flex-grow md:flex-none flex items-center justify-center gap-2 md:block p-3 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-95" title="Replenish Stock">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        <span class="md:hidden text-xs font-bold">Restock</span>
                    </button>
                    <button onclick="reportAssetIssue('${item.id}')" class="flex-grow md:flex-none flex items-center justify-center gap-2 md:block p-3 bg-red-50 text-red-600 rounded-xl md:rounded-2xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95" title="Report Issue">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <span class="md:hidden text-xs font-bold">Report</span>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    lowAlertsEl.innerText = lowCount;
    if (lowCount > 0) {
        lowAlertsEl.classList.remove('bg-blue-500');
        lowAlertsEl.classList.add('bg-red-500', 'animate-bounce');
    } else {
        lowAlertsEl.classList.add('bg-blue-500');
        lowAlertsEl.classList.remove('bg-red-500', 'animate-bounce');
    }
}

function renderAuditTrails() {
    const db = getDB();
    const container = document.getElementById('audit-logs');
    const countDisplay = document.getElementById('audit-count');
    container.innerHTML = '';

    countDisplay.innerText = db.logs.length;
    const recentLogs = [...db.logs].reverse().slice(0, 100);
    
    recentLogs.forEach(log => {
        const div = document.createElement('div');
        // Responsive log row
        div.className = 'p-4 md:p-6 hover:bg-blue-50/30 transition-colors group border-b border-slate-50';
        
        let actionBadgeColor = 'bg-gray-100 text-gray-600';
        let logCategory = 'SYSTEM';
        
        if (log.action.includes('DISPENSED')) {
            actionBadgeColor = 'bg-green-100 text-green-700';
            logCategory = 'PHARMACY';
        }
        if (log.action.includes('ADMINISTERED')) {
            actionBadgeColor = 'bg-blue-100 text-blue-700';
            logCategory = 'eMAR';
        }
        if (log.action.includes('ISSUE') || log.action.includes('FAILURE') || log.action.includes('STOP')) {
            actionBadgeColor = 'bg-red-100 text-red-700';
            logCategory = 'SAFETY';
        }

        div.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
                <div class="md:col-span-3 text-[10px] md:text-[11px] font-bold text-gray-400 font-mono flex items-center justify-between md:block">
                    <span class="md:hidden uppercase tracking-widest text-[8px]">Timestamp</span>
                    ${formatDateTime(log.timestamp)}
                </div>
                <div class="md:col-span-2 text-xs font-extrabold text-blue-900 flex items-center justify-between md:block">
                    <span class="md:hidden uppercase tracking-widest text-[8px] text-gray-400">Personnel</span>
                    ${log.nurseId}
                </div>
                <div class="md:col-span-2 flex items-center justify-between md:block">
                    <span class="md:hidden uppercase tracking-widest text-[8px] text-gray-400">Domain</span>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-tighter ${actionBadgeColor}">${logCategory}</span>
                </div>
                <div class="md:col-span-5 text-[11px] md:text-xs font-medium text-gray-600 italic group-hover:text-blue-900 transition-colors flex flex-col md:block">
                    <span class="md:hidden uppercase tracking-widest text-[8px] text-gray-400 mb-1 not-italic">Clinical Narrative</span>
                    ${log.details}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Global Event Listeners for UI interaction
window.addEventListener('dbUpdated', () => {
    updateDashboard();
    if (document.getElementById('cabinet2-section').classList.contains('hidden') === false) renderCabinet2();
    if (document.getElementById('inventory-section').classList.contains('hidden') === false) renderInventory();
    if (document.getElementById('logs-section').classList.contains('hidden') === false) renderAuditTrails();
    
    // Refresh dropdowns if they exist in global scope
    if (typeof populateCabinet1Patients === 'function') populateCabinet1Patients();
    if (typeof populateCabinet3Patients === 'function') populateCabinet3Patients();
});

function openPatientModal(bedNumber) {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    if (!patient) return;

    const modal = document.getElementById('patient-modal');
    const content = document.getElementById('modal-content');
    const name = document.getElementById('modal-patient-name');

    name.innerText = `${patient.info.name} (Bed ${bedNumber}) - MRN: ${patient.info.mrn}`;
    
    // Clinical progress steps for a "more correct" medical progress view
    const progressSteps = [
        { label: 'Admission', status: 'completed', date: 'Day 1' },
        { label: 'Stabilization', status: 'completed', date: 'Day 2' },
        { label: 'Treatment Plan', status: 'in_progress', date: 'Ongoing' },
        { label: 'Rehabilitation', status: 'pending', date: 'Planned' },
        { label: 'Discharge Plan', status: 'pending', date: 'Pending' }
    ];

    content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left Column: Patient Profile & Clinical Summary (8 cols) -->
            <div class="lg:col-span-8 space-y-8">
                <!-- Patient Profile Card -->
                <div class="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                    <div class="flex items-center gap-6 mb-6">
                        <div class="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <div>
                            <h3 class="text-2xl font-extrabold text-blue-900">${patient.info.name}</h3>
                            <div class="flex gap-4 mt-1 text-sm font-bold">
                                <span class="text-blue-600 uppercase tracking-widest">Bed ${patient.bedNumber}</span>
                                <span class="text-gray-400">•</span>
                                <span class="text-gray-500">${patient.info.mrn}</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-6 pt-6 border-t border-blue-100/50">
                        <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Primary Diagnosis</p>
                            <p class="text-sm font-bold text-blue-900">${patient.info.diagnosis}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Attending Clinician</p>
                            <p class="text-sm font-bold text-blue-900">${(patient.info.doctor.startsWith('Dr.') ? '' : 'Dr. ') + patient.info.doctor}</p>
                        </div>
                    </div>
                </div>

                <!-- Clinical Progress Tracker -->
                <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Clinical Care Pathway</h3>
                    <div class="relative flex justify-between items-start px-4">
                        <div class="absolute top-4 left-0 w-full h-0.5 bg-gray-100 -z-0"></div>
                        ${progressSteps.map(step => `
                            <div class="relative z-10 flex flex-col items-center text-center">
                                <div class="w-8 h-8 rounded-full border-2 ${
                                    step.status === 'completed' ? 'bg-green-500 border-green-500' : 
                                    step.status === 'in_progress' ? 'bg-blue-500 border-blue-500 animate-pulse' : 
                                    'bg-white border-gray-200'
                                } flex items-center justify-center mb-2">
                                    ${step.status === 'completed' ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}
                                </div>
                                <p class="text-[10px] font-bold text-gray-900 leading-tight">${step.label}</p>
                                <p class="text-[9px] text-gray-400 font-medium">${step.date}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Clinical Notes -->
                <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Latest Nursing & Clinical Notes</h3>
                    <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p class="text-sm text-gray-700 leading-relaxed font-medium italic">
                            "${patient.info.clinicalProgress}"
                        </p>
                        <div class="mt-3 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Updated 2 hours ago by Staff Nurse
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Vitals & Diagnostics (4 cols) -->
            <div class="lg:col-span-4 space-y-6">
                <!-- Vitals Panel -->
                <div class="bg-slate-950 text-white p-6 rounded-3xl shadow-2xl border border-slate-800">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xs font-black text-blue-400 uppercase tracking-[0.2em]">Biomedical Telemetry</h3>
                        <div class="flex gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" style="animation-delay: 0.2s"></span>
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" style="animation-delay: 0.4s"></span>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                            <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">NIBP (mmHg)</p>
                            <p class="text-2xl font-black text-slate-100 tabular-nums">${patient.info.diagnosticResults.vitals.bp}</p>
                        </div>
                        <div>
                            <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Heart Rate (BPM)</p>
                            <div class="flex items-baseline gap-2">
                                <p class="text-2xl font-black text-red-500 tabular-nums">${patient.info.diagnosticResults.vitals.hr}</p>
                                <svg class="w-3 h-3 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path></svg>
                            </div>
                        </div>
                        <div>
                            <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">SpO2 (%)</p>
                            <p class="text-2xl font-black text-cyan-400 tabular-nums">${patient.info.diagnosticResults.vitals.spo2.split('%')[0]}<span class="text-xs ml-0.5">%</span></p>
                        </div>
                        <div>
                            <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Resp Rate (BPM)</p>
                            <p class="text-2xl font-black text-slate-100 tabular-nums">${patient.info.diagnosticResults.vitals.rr || '18'}</p>
                        </div>
                        <div>
                            <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Temp (°C)</p>
                            <p class="text-2xl font-black text-orange-400 tabular-nums">${patient.info.diagnosticResults.vitals.temp}<span class="text-xs ml-0.5">°C</span></p>
                        </div>
                        <div>
                            <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">GCS Score</p>
                            <p class="text-lg font-black text-slate-100">${patient.info.diagnosticResults.vitals.gcs || '15/15'}</p>
                        </div>
                        <div class="col-span-2 pt-4 border-t border-slate-800">
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="text-[9px] text-yellow-500 font-black uppercase tracking-widest mb-1">Glucose (DXT)</p>
                                    <p class="text-2xl font-black text-yellow-500 tabular-nums">${patient.info.diagnosticResults.vitals.dxt}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">ECG Rhythm</p>
                                    <p class="text-xs font-black text-green-400 uppercase tracking-widest animate-pulse">${patient.info.diagnosticResults.vitals.ecg || 'Sinus Rhythm'}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-span-2">
                            <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Pain Score</p>
                            <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                                <div class="bg-green-500 h-full" style="width: 20%"></div>
                                <div class="bg-slate-700 h-full flex-grow"></div>
                            </div>
                            <p class="text-[10px] font-black text-slate-300 mt-1 uppercase tracking-widest text-right">${patient.info.diagnosticResults.vitals.painScore || '2/10'}</p>
                        </div>
                    </div>
                </div>

                <!-- Diagnostic Thumbnails -->
                <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Imaging</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="group relative rounded-2xl overflow-hidden aspect-square bg-gray-100 cursor-pointer">
                            <img src="${patient.info.diagnosticResults.woundImage}" class="w-full h-full object-cover transition-transform group-hover:scale-110">
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span class="text-[10px] text-white font-bold uppercase">View Wound</span>
                            </div>
                        </div>
                        <div class="group relative rounded-2xl overflow-hidden aspect-square bg-gray-100 cursor-pointer">
                            <img src="${patient.info.diagnosticResults.xrayImage}" class="w-full h-full object-cover transition-transform group-hover:scale-110">
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span class="text-[10px] text-white font-bold uppercase">View X-Ray</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Polypharmacy Management Section -->
        <div class="mt-6 pt-6 border-t">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                    <h3 class="font-bold text-blue-800">Clinical Verification & Medication</h3>
                    <button onclick="printMedicationSheet(${JSON.stringify(patient).replace(/"/g, '&quot;')})" class="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print eMAR
                    </button>
                </div>
                <div class="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-100">
                    <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Nurse-in-Charge:</span>
                    <span class="text-xs font-extrabold text-blue-900">${patient.info.nurseInCharge}</span>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                ${patient.medications.map(med => {
                    const statusColor = getMedicationStatus(med);
                    const isCompleted = med.status === 'Administered';
                    const isPending = med.status === 'Pending';
                    const isDispensed = med.status === 'Dispensed';

                    return `
                        <div class="p-4 rounded-2xl border transition-all ${isCompleted ? 'bg-green-50/50 border-green-100' : 'bg-white border-gray-100 shadow-sm'}">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <div class="flex items-center gap-2 mb-1">
                                        <p class="font-extrabold text-blue-900 leading-tight">${med.name}</p>
                                        <button onclick="showMedInfo('${med.name}')" class="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Info</button>
                                    </div>
                                    <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                        statusColor === 'Green' ? 'bg-green-100 text-green-700' : 
                                        statusColor === 'Red' ? 'bg-red-100 text-red-700' : 
                                        'bg-yellow-100 text-yellow-700'
                                    }">${med.status}</span>
                                </div>
                                <div class="flex gap-1">
                                    ${isPending ? `
                                        <button onclick="handleDispense(${patient.bedNumber}, '${med.id}')" class="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all transform active:scale-90">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                                        </button>
                                    ` : ''}
                                    ${isDispensed ? `
                                        <button onclick="handleAdminister(${patient.bedNumber}, '${med.id}')" class="p-2 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 transition-all transform active:scale-90">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <div class="flex gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>${med.dose}</span>
                                <span>•</span>
                                <span>${med.route}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
}

// Ensure modal buttons use the global handlers
window.handleDispense = function(bed, id) {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bed);
    const med = patient.medications.find(m => m.id === id);

    // Trigger Dispense Drawer Simulation (Cabinet 2)
    triggerDrawerSimulation(() => {
        dispenseMedication(bed, id);
        openPatientModal(bed); // Refresh modal
    }, "Cabinet 2: Dispensing", `Please take ${med.name} from the drawer.`);
};

window.handleAdminister = function(bed, id) {
    administerMedication(bed, id);
    openPatientModal(bed); // Refresh modal
};

window.handleTerminate = function(bed) {
    terminatePatientRecord(bed);
};

window.handleReportIssue = function(invId) {
    const issue = prompt("Please describe the issue (Expired/Contaminated/Broken/Discoloration):");
    if (issue) reportMedicationIssue(invId, issue);
};

function closePatientModal() {
    const modal = document.getElementById('patient-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}
