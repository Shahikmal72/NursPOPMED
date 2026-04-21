// Dashboard and Main UI Logic
let currentBCMAPatient = null;

function updateDashboard() {
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
            if (m.status === 'Pending' || m.status === 'Dispensed' || m.status === 'Missed') {
                const dueTime = new Date(m.timeDue);
                if (m.status === 'Missed' || now > dueTime) {
                    totalMissed++;
                } else {
                    totalPending++;
                }
            }
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
    
    const medicationsDue = patient.medications.filter(m => m.status === 'Pending' || m.status === 'Dispensed' || m.status === 'Given' || m.status === 'Administered' || m.status === 'Missed');
    
    modal.innerHTML = `
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-pop-in border border-white/20 max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-8 text-white relative shrink-0">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <span class="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-300 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Patient Identity Verified
                            </span>
                        </div>
                        <h2 class="text-3xl font-black tracking-tighter">${patient.info.name}</h2>
                        <p class="text-blue-200 font-bold uppercase tracking-widest text-xs mt-1">Bed ${bedNumber} • ${patient.info.mrn} • Allergy: <span class="text-red-300">${patient.info.allergies}</span></p>
                    </div>
                    <button onclick="this.closest('#bcma-workflow-modal').remove()" class="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>

            <div class="p-8 overflow-y-auto">
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
                                        <p class="text-xl font-black text-slate-900">${med.name}</p>
                                        <p class="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1">${med.dose} • ${med.route} • ${med.frequency}</p>
                                        <div class="mt-2 flex items-center gap-2">
                                            <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ordered By:</p>
                                            <p class="text-[10px] font-black text-blue-800">${med.prescribingDoctor || patient.info.doctor}</p>
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
                                                        <button onclick="handleShowMissedJustification(${patient.bedNumber}, '${med.id}')" class="bg-red-500 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all">Document Missed</button>
                                                    ` : ''}
                                                    <button onclick="handleOneClickAdminister(${patient.bedNumber}, '${med.id}')" class="btn-premium px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Administered</button>
                                                  `
                                            }
                                        </div>
                                    </div>
                                    ${isGiven ? `
                                        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[9px] font-bold text-slate-500">
                                            <span class="uppercase tracking-widest text-[8px] opacity-60">Legal Record:</span> Administered at ${formatDateTime(med.timeAdministered)}
                                        </div>
                                    ` : isMissed ? `
                                        <div class="bg-red-50 p-3 rounded-xl border border-red-100 text-[9px] font-bold text-red-500">
                                            <div class="flex flex-col gap-1">
                                                <div><span class="uppercase tracking-widest text-[8px] opacity-60">Justification:</span> ${med.justification}</div>
                                                ${med.remarks ? `<div><span class="uppercase tracking-widest text-[8px] opacity-60">Remarks:</span> ${med.remarks}</div>` : ''}
                                                <div class="text-[8px] opacity-40 mt-1 italic">Recorded at ${formatDateTime(med.timeAdministered)}</div>
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

    // Security Verification: Ensure the user is authorized for Medication Administration
    if (!isAuthorizedForAction('MED_ADMINISTRATION')) {
        showNotification('SECURITY DENIED: Your role is not authorized for medication administration.', 'error');
        generateLog('SECURITY_VIOLATION', currentUser.id, `Unauthorized admin attempt for ${medication.name} (Bed ${bedNumber})`);
        return;
    }

    // SIMPLIFIED WORKFLOW: Internal 5 Rights Verification (No manual scan)
    const verification = validate5Rights(patient, medication, patient.info.mrn, medication.barcode || '');

    // Allergy check and critical stops are still enforced
    if (verification.criticalStop) {
        showNotification(`SAFETY ALERT: ${verification.drug.message || verification.patient.message}`, 'error');
        generateLog('CLINICAL_STOP', currentUser.id, `SAFETY ALERT: ${verification.drug.message || verification.patient.message} (Bed: ${bedNumber}, Drug: ${medication.name})`);
        return;
    }

    // Safety Alert: High Alert or LASA
    const protocol = db.medicationProtocols[medication.name];
    if (protocol && (protocol.isHighAlert || protocol.isLASA)) {
        const type = protocol.isHighAlert ? 'HIGH_ALERT' : 'LASA';
        const details = protocol.isLASA ? protocol.lasaNote : 'HIGH ALERT: Second independent verification of dosage and pump settings mandatory.';
        
        showClinicalSafetyAlert(medication.name, type, details, () => {
            processAdministration(db, medication, bedNumber);
        });
        return;
    }

    // Standard Administration
    processAdministration(db, medication, bedNumber);
};

window.handleShowMissedJustification = function(bedNumber, medId) {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    const medication = patient.medications.find(m => m.id === medId);

    const modal = document.createElement('div');
    modal.id = 'missed-justification-modal';
    modal.className = 'fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[500] flex items-center justify-center p-4';
    
    modal.innerHTML = `
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-pop-in border border-slate-200">
            <div class="bg-red-600 p-6 text-white text-center">
                <h2 class="text-xl font-black uppercase tracking-tighter">Missed Dose Justification</h2>
                <p class="text-red-100 text-[10px] font-bold uppercase tracking-widest mt-1">Legal Documentation Required</p>
            </div>
            
            <div class="p-8 space-y-6">
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medication</p>
                    <p class="text-lg font-black text-slate-900">${medication.name}</p>
                </div>
                
                <div class="space-y-3">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Reason (MAR Standards):</p>
                    
                    <button onclick="handleMissedSubmission(${bedNumber}, '${medId}', 'Patient refused medication')" class="w-full p-4 rounded-2xl border border-slate-200 hover:border-red-500 hover:bg-red-50 text-left transition-all group">
                        <p class="text-sm font-black text-slate-700 group-hover:text-red-700">Patient refused medication</p>
                    </button>
                    
                    <button onclick="handleMissedSubmission(${bedNumber}, '${medId}', 'Patient in Operating Theatre (OT)')" class="w-full p-4 rounded-2xl border border-slate-200 hover:border-red-500 hover:bg-red-50 text-left transition-all group">
                        <p class="text-sm font-black text-slate-700 group-hover:text-red-700">Patient in Operating Theatre (OT)</p>
                    </button>
                    
                    <button onclick="handleMissedSubmission(${bedNumber}, '${medId}', 'Doctor ordered to omit')" class="w-full p-4 rounded-2xl border border-slate-200 hover:border-red-500 hover:bg-red-50 text-left transition-all group">
                        <p class="text-sm font-black text-slate-700 group-hover:text-red-700">Doctor ordered to omit</p>
                    </button>

                    <button onclick="handleMissedSubmission(${bedNumber}, '${medId}', 'Given But Late')" class="w-full p-4 rounded-2xl border border-slate-200 hover:border-red-500 hover:bg-red-50 text-left transition-all group">
                        <p class="text-sm font-black text-slate-700 group-hover:text-red-700">Given But Late</p>
                    </button>
                </div>

                <div class="space-y-2">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Additional Remarks (Optional):</p>
                    <textarea id="missed-remarks-input" placeholder="Enter clinical remarks here..." class="w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700 h-24 resize-none"></textarea>
                </div>
                
                <button onclick="document.getElementById('missed-justification-modal').remove()" class="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
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
            remarks: "BCMA Verified Simplified Workflow"
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
    
    // Ensure currentBCMAPatient is still occupied and valid
    if (currentBCMAPatient) {
        const stillValid = occupiedPatients.find(p => p.info.mrn === currentBCMAPatient.info.mrn);
        if (!stillValid) currentBCMAPatient = null;
    }

    // Auto-select first patient if none selected
    if (!currentBCMAPatient && occupiedPatients.length > 0) {
        currentBCMAPatient = occupiedPatients[0];
    }

    // 1. High-End Patient Switcher (Clinical Tabs)
    let patientPillsHtml = `
        <div class="flex items-center gap-3 overflow-x-auto pb-6 no-scrollbar mb-2 px-1">
            <div class="flex bg-slate-200/50 p-1 rounded-2xl backdrop-blur-md border border-slate-200">
                ${occupiedPatients.map(p => `
                    <button onclick="selectPatientForBCMA('${p.info.mrn}')" 
                    class="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                        currentBCMAPatient && currentBCMAPatient.info.mrn === p.info.mrn 
                        ? 'bg-white text-blue-600 shadow-xl shadow-blue-500/10' 
                        : 'text-slate-500 hover:text-slate-800'
                    }">
                        Bed ${p.bedNumber}
                    </button>
                `).join('')}
            </div>
            <div class="h-6 w-[1px] bg-slate-300 mx-2"></div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Active Admissions: ${occupiedPatients.length}</p>
        </div>
    `;

    // 2. Main Clinical Command Center Area
    let mainContentHtml = '';
    if (currentBCMAPatient) {
        // Always fetch fresh data from DB
        const patient = db.patients.find(p => p.info.mrn === currentBCMAPatient.info.mrn);
        const medications = patient.medications;
        const alerts = getClinicalAlerts(patient);

        // Clinical progress steps (Sync with openPatientModal)
        const progressSteps = [
            { label: 'Admission', status: 'completed', date: 'Day 1' },
            { label: 'Stabilization', status: 'completed', date: 'Day 2' },
            { label: 'Treatment Plan', status: 'in_progress', date: 'Ongoing' },
            { label: 'Rehabilitation', status: 'pending', date: 'Planned' },
            { label: 'Discharge Plan', status: 'pending', date: 'Pending' }
        ];
        
        mainContentHtml = `
            <div class="desktop-grid">
                
                <!-- LEFT: PATIENT CLINICAL DOSSIER (Sync with Profile View) -->
                <div class="col-span-12 lg:col-span-3 space-y-6">
                    <!-- Profile Card -->
                    <div class="glass-panel p-6 rounded-[2.5rem] relative overflow-hidden">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/20">
                                ${patient.bedNumber}
                            </div>
                            <div>
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ID: ${patient.info.mrn}</p>
                                <h3 class="text-lg font-black text-slate-900 tracking-tighter leading-tight">${patient.info.name}</h3>
                                <p class="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">${patient.info.doctor}</p>
                            </div>
                        </div>

                        <div class="space-y-4 pt-6 border-t border-slate-100">
                            <div>
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Diagnosis</p>
                                <p class="text-[11px] font-bold text-slate-700 leading-tight">${patient.info.diagnosis || 'Pending'}</p>
                            </div>
                            <div class="p-4 rounded-2xl ${patient.info.allergies && patient.info.allergies !== 'None (NKDA)' ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}">
                                <p class="text-[9px] font-black ${patient.info.allergies && patient.info.allergies !== 'None (NKDA)' ? 'text-red-600' : 'text-green-600'} uppercase tracking-widest mb-1">Allergies</p>
                                <p class="text-xs font-black ${patient.info.allergies && patient.info.allergies !== 'None (NKDA)' ? 'text-red-900' : 'text-green-900'}">
                                    ${patient.info.allergies || 'NKDA'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Clinical Progress Tracker -->
                    <div class="glass-panel p-6 rounded-[2.5rem]">
                        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Care Pathway</h3>
                        <div class="relative flex justify-between items-start px-2">
                            <div class="absolute top-3 left-0 w-full h-0.5 bg-slate-100"></div>
                            ${progressSteps.map(step => `
                                <div class="relative z-10 flex flex-col items-center text-center">
                                    <div class="w-6 h-6 rounded-full border-2 ${
                                        step.status === 'completed' ? 'bg-green-500 border-green-500' : 
                                        step.status === 'in_progress' ? 'bg-blue-500 border-blue-500 animate-pulse' : 
                                        'bg-white border-slate-200'
                                    } flex items-center justify-center mb-2">
                                        ${step.status === 'completed' ? '<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' : ''}
                                    </div>
                                    <p class="text-[8px] font-black text-slate-900 leading-tight uppercase tracking-tighter">${step.label}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Clinical Notes -->
                    <div class="glass-panel p-6 rounded-[2.5rem]">
                        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Latest Notes</h3>
                        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p class="text-[11px] text-slate-600 leading-relaxed font-bold italic">
                                "${patient.info.clinicalProgress || 'No notes available'}"
                            </p>
                        </div>
                    </div>
                </div>

                <!-- CENTER: eMAR COMMAND CENTER -->
                <div class="col-span-12 lg:col-span-6">
                    <div class="glass-panel rounded-[2.5rem] overflow-hidden">
                        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                            <div>
                                <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">eMAR Administration Console</h3>
                                <p class="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Electronic Medication Administration Record • Bed ${patient.bedNumber}</p>
                            </div>
                            <div class="flex gap-2">
                                <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-200">${medications.length} Prescriptions</span>
                            </div>
                        </div>

                        <!-- DESKTOP CLINICAL TABLE -->
                        <div class="desktop-only overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead class="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                                    <tr>
                                        <th class="px-8 py-5">Medication Agent</th>
                                        <th class="px-6 py-5">Clinical Dosing</th>
                                        <th class="px-6 py-5">Due Status</th>
                                        <th class="px-8 py-5 text-right">Verification</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 bg-white/30">
                                    ${medications.map(med => {
                                        const isGiven = med.status === 'Given' || med.status === 'Administered';
                                        const isMissed = med.status === 'Missed';
                                        const protocol = db.medicationProtocols[med.name];
                                        
                                        return `
                                            <tr class="group transition-all duration-300 ${isGiven || isMissed ? 'opacity-60' : 'hover:bg-blue-50/50'}">
                                                <td class="px-8 py-6">
                                                    <div class="flex items-center gap-3">
                                                        <div class="w-2 h-2 rounded-full ${isGiven ? 'bg-green-500' : isMissed ? 'bg-red-500' : 'bg-amber-400 animate-pulse'}"></div>
                                                        <div>
                                                            <div class="flex items-center gap-2">
                                                                <p class="text-sm font-black text-slate-900 tracking-tight cursor-help hover:text-blue-700 transition-colors" onclick="handleOpenHE('${patient.info.mrn}', '${med.id}')">${med.name}</p>
                                                                <button onclick="handleOpenHE('${patient.info.mrn}', '${med.id}')" class="p-1 text-indigo-400 hover:text-indigo-600 transition-colors" title="Clinical Guidelines">
                                                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                                </button>
                                                            </div>
                                                            <div class="flex items-center gap-2 mt-1">
                                                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${med.frequency}</span>
                                                                ${protocol?.isHighAlert ? '<span class="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[7px] font-black">HIGH ALERT</span>' : ''}
                                                                ${protocol?.isLASA ? '<span class="px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded text-[7px] font-black">LASA</span>' : ''}
                                                            </div>
                                                            ${isMissed ? `
                                                                <div class="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                                                                    <p class="text-[8px] font-black text-red-600 uppercase tracking-tighter">Missed: ${med.justification}</p>
                                                                    ${med.remarks ? `<p class="text-[8px] font-bold text-red-400 mt-1 italic">${med.remarks}</p>` : ''}
                                                                </div>
                                                            ` : `
                                                                <div class="mt-2 pt-2 border-t border-slate-50">
                                                                    <p class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Prescribing Doctor</p>
                                                                    <p class="text-[10px] font-black text-blue-800">${med.prescribingDoctor || patient.info.doctor}</p>
                                                                </div>
                                                            `}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-6">
                                                    <p class="text-xs font-black text-slate-700 leading-none">${med.dose}</p>
                                                    <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1.5 bg-blue-50 px-2 py-0.5 rounded-md inline-block border border-blue-100/50">${med.route}</p>
                                                </td>
                                                <td class="px-6 py-6">
                                                    <div class="flex flex-col">
                                                        <span class="text-[10px] font-black text-slate-600">${formatDateTime(med.timeDue)}</span>
                                                        <span class="text-[8px] font-bold text-slate-400 uppercase mt-1">Ref ID: ${med.id.split('-').pop()}</span>
                                                    </div>
                                                </td>
                                                <td class="px-8 py-6 text-right">
                                                    ${isGiven 
                                                        ? `<div class="flex flex-col items-end gap-2">
                                                            <div class="flex items-center gap-2">
                                                                <button onclick="handleOpenHE('${patient.info.mrn}', '${med.id}')" class="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm border border-indigo-100" title="Education Sheet">
                                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                                                                </button>
                                                                <span class="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black border border-green-100 uppercase tracking-widest">Administered</span>
                                                            </div>
                                                            <div class="text-right">
                                                                <p class="text-[9px] font-black text-slate-900">${med.nurseName || 'Authorized Nurse'}</p>
                                                                <p class="text-[8px] font-bold text-slate-400">${new Date(med.timeAdministered).toLocaleTimeString()}</p>
                                                            </div>
                                                          </div>`
                                                        : isMissed 
                                                        ? `<div class="flex flex-col items-end gap-2">
                                                            <span class="px-3 py-1 bg-red-50 text-red-700 rounded-full text-[9px] font-black border border-red-100 uppercase tracking-widest">Missed</span>
                                                            <div class="text-right">
                                                                <p class="text-[9px] font-black text-slate-900">${med.nurseName || 'Authorized Nurse'}</p>
                                                                <p class="text-[8px] font-bold text-slate-400">${new Date(med.timeAdministered).toLocaleTimeString()}</p>
                                                            </div>
                                                          </div>`
                                                        : `<button onclick="handleOneClickAdminister(${patient.bedNumber}, '${med.id}')" class="btn-premium px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/10 active:scale-95 transition-all">Verify & Administer</button>`
                                                    }
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>

                        <!-- MOBILE CLINICAL VIEW -->
                        <div class="mobile-only p-5 space-y-4">
                            ${medications.map(med => {
                                const isGiven = med.status === 'Given' || med.status === 'Administered';
                                const isMissed = med.status === 'Missed';
                                return `
                                    <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all active:scale-[0.98]">
                                        <div class="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 class="text-lg font-black text-slate-900 tracking-tight leading-none">${med.name}</h4>
                                                <p class="text-[11px] font-black text-blue-600 uppercase tracking-widest mt-2 bg-blue-50 px-2 py-1 rounded-lg inline-block">${med.dose} • ${med.route}</p>
                                                <div class="mt-2 text-[9px] font-bold text-slate-400">
                                                    <p class="uppercase tracking-tighter">Ordered By:</p>
                                                    <p class="text-blue-800 font-black">${med.prescribingDoctor || patient.info.doctor}</p>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <span class="text-[9px] font-black text-slate-400 uppercase block">${formatDateTime(med.timeDue)}</span>
                                                <span class="text-[8px] font-bold text-slate-300 uppercase">${med.frequency}</span>
                                            </div>
                                        </div>
                                        ${isGiven 
                                            ? `<div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <div class="flex items-center gap-2">
                                                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <span class="text-[10px] font-black text-green-700 uppercase tracking-widest">Administered</span>
                                                </div>
                                                <button onclick="handleOpenHE('${patient.info.mrn}', '${med.id}')" class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-200 pb-0.5">📘 HE Pamphlet</button>
                                               </div>`
                                            : isMissed 
                                            ? `<div class="bg-red-50 p-4 rounded-2xl border border-red-100">
                                                <div class="flex items-center gap-2 mb-2">
                                                    <div class="w-2 h-2 rounded-full bg-red-500"></div>
                                                    <span class="text-[10px] font-black text-red-700 uppercase tracking-widest">Missed: ${med.justification}</span>
                                                </div>
                                                ${med.remarks ? `<p class="text-[9px] font-bold text-red-400 italic">${med.remarks}</p>` : ''}
                                               </div>`
                                            : `<button onclick="handleOneClickAdminister(${patient.bedNumber}, '${med.id}')" class="w-full py-5 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 active:scale-95 transition-all">✔ Administer Now</button>`
                                        }
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- RIGHT: VITALS & DIAGNOSTICS (Sync with Profile View) -->
                <div class="col-span-12 lg:col-span-3 space-y-6 lg:sticky lg:top-6">
                    <!-- Vitals Panel -->
                    <div class="bg-slate-950 text-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-800">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Telemetry</h3>
                            <div class="flex gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" style="animation-delay: 0.2s"></span>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <p class="text-[8px] text-slate-500 font-black uppercase mb-1">BP (mmHg)</p>
                                <p class="text-xl font-black text-slate-100">${patient.info.diagnosticResults.vitals.bp}</p>
                            </div>
                            <div>
                                <p class="text-[8px] text-slate-500 font-black uppercase mb-1">HR (BPM)</p>
                                <p class="text-xl font-black text-red-500">${patient.info.diagnosticResults.vitals.hr}</p>
                            </div>
                            <div>
                                <p class="text-[8px] text-slate-500 font-black uppercase mb-1">SpO2 (%)</p>
                                <p class="text-xl font-black text-cyan-400">${patient.info.diagnosticResults.vitals.spo2}</p>
                            </div>
                            <div>
                                <p class="text-[8px] text-slate-500 font-black uppercase mb-1">Temp (°C)</p>
                                <p class="text-xl font-black text-orange-400">${patient.info.diagnosticResults.vitals.temp}°C</p>
                            </div>
                            <div class="col-span-2 pt-4 border-t border-slate-800">
                                <p class="text-[8px] text-yellow-500 font-black uppercase mb-1">Glucose (DXT)</p>
                                <p class="text-xl font-black text-yellow-500">${patient.info.diagnosticResults.vitals.dxt}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Imaging Panel -->
                    <div class="glass-panel p-6 rounded-[2.5rem]">
                        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Diagnostic Imaging</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="group relative rounded-2xl overflow-hidden aspect-square bg-slate-100 cursor-pointer border border-slate-200">
                                <img src="${patient.info.diagnosticResults.woundImage}" class="w-full h-full object-cover transition-transform group-hover:scale-110">
                                <div class="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center p-2">
                                    <span class="text-[8px] text-white font-black uppercase leading-tight">Wound Profile</span>
                                </div>
                            </div>
                            <div class="group relative rounded-2xl overflow-hidden aspect-square bg-slate-100 cursor-pointer border border-slate-200">
                                <img src="${patient.info.diagnosticResults.xrayImage}" class="w-full h-full object-cover transition-transform group-hover:scale-110">
                                <div class="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center p-2">
                                    <span class="text-[8px] text-white font-black uppercase leading-tight">Chest X-Ray</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button onclick="window.print()" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                        <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Export Clinical eMAR
                    </button>
                </div>
            </div>
        `;
    } else {
        mainContentHtml = `
            <div class="flex flex-col items-center justify-center py-32 opacity-20">
                <div class="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                    <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h3 class="text-2xl font-black text-slate-400 uppercase tracking-[0.3em]">System Standby</h3>
                <p class="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">Select an active bed unit to initiate clinical documentation</p>
            </div>
        `;
    }

    container.className = "max-w-[1400px] mx-auto px-4"; 
    container.innerHTML = patientPillsHtml + mainContentHtml;
}

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
    
    // Demo Optimization: Dynamic Time Scheduling
    // Prevent excessive missed doses by setting "Time Due" to current time + small offsets
    const now = new Date();
    const patientMeds = scenario.meds.map((med, index) => {
        const timeDue = new Date(now.getTime());
        // Stagger due times: -15 min (slightly overdue), +30 min (due soon), +2h, +4h
        const offsets = [-15, 30, 120, 240]; 
        timeDue.setMinutes(timeDue.getMinutes() + offsets[index % offsets.length]);
        
        const doctor = db.doctors[Math.floor(Math.random() * db.doctors.length)];

        return {
            id: `MED-${Date.now()}-${bedNumber}-${index}`,
            name: med.name,
            dose: med.dose,
            route: med.route,
            frequency: med.freq,
            timeDue: timeDue.toISOString(),
            status: 'Pending',
            prescribingDoctor: doctor, // KKM MAR Requirement
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
        doctor: db.doctors[Math.floor(Math.random() * db.doctors.length)],
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

    // Show replenishment instructions for ADC Cabinet 1
    const instructions = `
        ADC CABINET 1 REPLENISHMENT PROTOCOL:
        1. Verify Batch Number: ${item.batch}
        2. Inspect physical integrity of medication.
        3. Place items into the designated slot.
        4. Close the drawer firmly after completion.
        
        Click OK to proceed with restocking.
    `;
    
    if (!confirm(instructions)) return;

    const qty = prompt(`Enter quantity of ${item.name} to replenish:`);
    if (!qty || isNaN(qty) || parseInt(qty) <= 0) {
        showNotification('Invalid quantity entered', 'error');
        return;
    }

    // Trigger Replenishment Drawer Simulation (Cabinet 1)
    triggerDrawerSimulation(() => {
        item.quantity += parseInt(qty);
        updateDB(db);
        generateLog('INVENTORY_REPLENISHMENT', currentUser.id, `Replenished ${qty} units of ${item.name} (Batch: ${item.batch})`);
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

    let timeLeft = 10;
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
            }, 1000);
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
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.classList.remove('active');
                if (callback) callback();
            }, 500);
        }
    }, 400);
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
        progress += 2;
        const offset = totalCircumference - (progress / 100) * totalCircumference;
        progressCircle.style.strokeDashoffset = offset;

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.classList.remove('active');
                if (callback) callback();
            }, 800);
        }
    }, 50);
}

window.reportAssetIssue = function(itemId) {
    const issue = prompt("Select issue type:\n1. Sedimentation\n2. Leakage\n3. Contamination\n4. Damaged Packaging\nEnter number (1-4):");
    
    let issueText = "";
    switch(issue) {
        case '1': issueText = "Sedimentation"; break;
        case '2': issueText = "Leakage"; break;
        case '3': issueText = "Contamination"; break;
        case '4': issueText = "Damaged Packaging"; break;
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
        if (item.quantity < parseInt(qty)) {
            showNotification('Insufficient quantity in stock to report this amount', 'error');
            return;
        }
        
        item.quantity -= parseInt(qty);
        updateDB(db);
        generateLog('ASSET_INTEGRITY_ISSUE', currentUser.id, `Decommissioned ${qty} units of ${item.name} due to ${issueText} (Batch: ${item.batch})`);
        renderInventory();
        showNotification(`Reported ${issueText} for ${qty} units of ${item.name}. Assets removed from inventory.`, 'warning');
    }
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
        const isLow = item.quantity < 10;
        if (isLow) lowCount++;
        
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
                    <span class="hidden md:inline-block text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full mt-2">ID: ${item.id}</span>
                </div>

                <!-- Batch -->
                <div class="grid grid-cols-2 md:block md:col-span-2 bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-xl">
                    <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch</p>
                    <p class="text-xs font-mono font-bold text-slate-700 text-right md:text-left">${item.batch}</p>
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
                            <p class="text-sm font-bold text-blue-900">${patient.info.doctor}</p>
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

