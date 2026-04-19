// Dashboard and Main UI Logic

function updateDashboard() {
    renderCabinet2();
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
            if (m.status === 'Pending') {
                const dueTime = new Date(m.timeDue);
                if (now > dueTime) {
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

window.dispenseMedication = function(bedNumber, medId) {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    if (!patient) return;

    const medication = patient.medications.find(m => m.id === medId);
    if (!medication) return;

    // Deduct from inventory
    const inventoryItem = db.inventory.find(item => item.name === medication.name);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
        showNotification(`Insufficient stock for ${medication.name}`, 'error');
        return;
    }
    inventoryItem.quantity -= 1;

    medication.status = 'Dispensed';
    medication.timeDispensed = new Date().toISOString();
    medication.nurseId = currentUser.id;

    updateDB(db);
    generateLog('MED_DISPENSED', currentUser.id, `Dispensed ${medication.name} (${medication.dose}) for Bed ${bedNumber}`);
    
    // Refresh UI components to clear safety alerts immediately
    renderCabinet2();
    renderAlerts();
    updateDashboardStats();
    
    showNotification(`Dispensed ${medication.name} successfully`, 'success');
};

window.administerMedication = function(bedNumber, medId) {
    const db = getDB();
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    if (!patient) return;

    const medication = patient.medications.find(m => m.id === medId);
    if (!medication) return;

    medication.status = 'Administered';
    medication.timeAdministered = new Date().toISOString();

    updateDB(db);
    generateLog('MED_ADMINISTERED', currentUser.id, `Administered ${medication.name} to Bed ${bedNumber}`);
    
    // Refresh UI components to clear safety alerts immediately
    renderCabinet2();
    renderAlerts();
    updateDashboardStats();
    
    showNotification(`${medication.name} marked as administered`, 'success');
};

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
    container.innerHTML = '';

    db.patients.forEach(patient => {
        const bedCard = document.createElement('div');
        bedCard.className = `group p-5 border rounded-[2rem] shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${patient.occupied ? 'bg-white border-gray-100' : 'bg-gray-50/50 border-dashed border-gray-200'}`;
        
        let medListHtml = '';
        if (patient.occupied) {
            patient.medications.forEach(med => {
                const statusColor = getMedicationStatus(med);
                const colorClass = statusColor === 'Green' ? 'bg-green-50 text-green-700 border-green-100' : 
                                  statusColor === 'Red' ? 'bg-red-50 text-red-700 border-red-100' : 
                                  'bg-amber-50 text-amber-700 border-amber-100';
                
                medListHtml += `
                    <div class="mt-2 p-3 border rounded-2xl ${colorClass} transition-all">
                        <div class="flex justify-between items-start">
                            <div class="flex-grow">
                                <div class="flex items-center gap-2 mb-1">
                                    <p class="text-[11px] font-extrabold leading-tight">${med.name}</p>
                                    <button onclick="showMedInfo('${med.name}')" class="text-[9px] bg-white/50 text-blue-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter hover:bg-blue-100 transition-colors">HE</button>
                                </div>
                                <p class="text-[9px] font-bold opacity-60 uppercase tracking-tighter">${med.dose} • ${formatDateTime(med.timeDue)}</p>
                                
                                ${med.status === 'Pending' ? `
                                    <div class="mt-2 flex items-center gap-2">
                                        <div class="flex items-center gap-2 bg-white/30 p-1.5 rounded-xl border border-white/20">
                                            <input type="checkbox" id="he-check-${med.id}" class="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer">
                                            <label for="he-check-${med.id}" class="text-[9px] font-bold text-gray-700 cursor-pointer">HE Given</label>
                                        </div>
                                        ${isStaffNurse() ? `
                                            <button onclick="promptUpdateTime(${patient.bedNumber}, '${med.id}', '${med.timeDue}')" class="p-1 bg-white/50 rounded-lg hover:bg-white text-blue-600 transition-all" title="Adjust Time">
                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            </button>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="flex gap-1 ml-2">
                                ${med.status === 'Pending' ? `<button onclick="handleDispense(${patient.bedNumber}, '${med.id}')" class="p-1.5 bg-white/80 rounded-lg shadow-sm hover:bg-white text-blue-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg></button>` : ''}
                                ${med.status === 'Dispensed' ? `<button onclick="handleAdminister(${patient.bedNumber}, '${med.id}')" class="p-1.5 bg-green-500 rounded-lg shadow-sm hover:bg-green-600 text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        bedCard.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <span class="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.2em]">Bed Unit</span>
                    <h3 class="font-black text-3xl text-blue-900 leading-none">${patient.bedNumber}</h3>
                </div>
                <div class="flex gap-2">
                    ${patient.occupied ? `
                        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span class="text-[8px] font-black text-slate-500 uppercase pr-1">Active</span>
                        </div>
                        <button onclick="openPatientModal(${patient.bedNumber})" class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button>
                    ` : ''}
                </div>
            </div>
            ${patient.occupied ? `
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <div class="flex-grow">
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Assigned Patient</p>
                            <p class="text-sm font-extrabold text-gray-900 truncate">${patient.info.name}</p>
                        </div>
                    </div>
                    <div class="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                            Cycle Medications
                            <span class="text-blue-500">${patient.medications.length} total</span>
                        </p>
                        <div class="max-h-32 overflow-y-auto custom-scrollbar pr-1">
                            ${medListHtml || '<p class="text-[10px] text-gray-400 italic text-center py-2">No active orders</p>'}
                        </div>
                    </div>
                    <div class="pt-3 flex justify-between items-center border-t border-slate-100">
                        <div class="flex flex-col">
                            <span class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Verified by</span>
                            <span class="text-[9px] font-black text-blue-600">${patient.info.nurseInCharge}</span>
                        </div>
                        <button onclick="handleTerminate(${patient.bedNumber})" class="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-red-100 transition-all">Archive Unit</button>
                    </div>
            ` : `
                <div class="flex flex-col items-center justify-center py-10 opacity-40 group-hover:opacity-100 transition-all">
                    <div class="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-3 border-2 border-dashed border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-50 transition-all">
                        <svg class="w-8 h-8 text-slate-300 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] group-hover:text-blue-600 mb-4">Unit Available</p>
                    <button onclick="registerNewPatient(${patient.bedNumber})" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transform active:scale-95 transition-all shadow-lg shadow-blue-900/20">Register Patient</button>
                </div>
            `}
        `;
        container.appendChild(bedCard);
    });
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

    // Clinical simulation data generation
    const firstNames = ['Ahmad', 'Fatimah', 'Zubair', 'Aisyah', 'Umar', 'Khadijah', 'Ali', 'Zainab', 'Hassan', 'Maryam'];
    const lastNames = ['Abdullah', 'Rahman', 'Ismail', 'Yusof', 'Ibrahim', 'Aziz', 'Hamzah', 'Saleh', 'Mahmud', 'Idris'];
    const doctors = [
        'Assoc. Prof. Dr. Mohd Said Nurumal (Consultant)',
        'Assoc. Prof. Dr. Muhammad Kamil Che Hasan (Consultant)',
        'Assoc. Prof. Dr. Salizar Mohamed Ludin (Consultant)',
        'Asst. Prof. Dr. Siti Zuhailah Abdullah (Specialist)',
        'Asst. Prof. Dr. Patimah Abdul Wahiv (Specialist)',
        'Asst. Prof. Dr. Santhna Letchmi Panduragan (Specialist)'
    ];
    const diagnoses = [
        'Type 2 Diabetes Mellitus with Diabetic Foot Ulcer (DFU)',
        'Congestive Cardiac Failure (CCF) - NYHA Class III',
        'Community Acquired Pneumonia (CAP) - CURB-65 Score 2',
        'Chronic Kidney Disease (CKD) Stage 4',
        'Essential Hypertension with Hypertensive Urgency',
        'Post-Appendectomy with Surgical Site Infection (SSI)',
        'Acute Exacerbation of Bronchial Asthma (AEBA)',
        'Dengue Fever with Warning Signs',
        'Acute Coronary Syndrome (ACS) - NSTEMI'
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];

    // Randomized Prescribed Medications
    const allMedNames = [
        ...db.medications.oral,
        ...db.medications.iv,
        ...db.medications.injection,
        ...db.medications.emergency,
        ...db.medications.others
    ];
    
    // Polypharmacy: Generate 4-7 medications
    const medCount = Math.floor(Math.random() * 4) + 4; 
    const patientMeds = [];
    const shuffledMeds = [...allMedNames].sort(() => 0.5 - Math.random());
    
    for(let m=0; m < medCount; m++) {
        const medName = shuffledMeds[m];
        let route = 'Oral (PO)';
        if (db.medications.iv.includes(medName)) route = 'Intravenous (IV)';
        if (db.medications.injection.includes(medName)) route = 'Subcutaneous (SC)';
        if (db.medications.emergency.includes(medName)) route = 'Intravenous (IV)';

        patientMeds.push({
            id: `MED-${Date.now()}-${bedNumber}-${m}`,
            name: medName,
            dose: medName.includes('mg') ? medName.split(' ').filter(word => word.includes('mg'))[0] || '1 unit' : '1 unit',
            route: route,
            frequency: ['Stat', 'OD', 'BD', 'TDS', 'QID', 'PRN'][Math.floor(Math.random() * 6)],
            timeDue: new Date(Date.now() + (Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
            status: 'Pending',
            nurseId: 'Admitting Nurse',
            doctor: doctor,
            timeDispensed: null,
            timeAdministered: null
        });
    }

    // Populate patient info
    patient.occupied = true;
    patient.info = {
        name: `${firstName} ${lastName}`,
        mrn: rn.toUpperCase(),
        bedNumber: bedNumber,
        doctor: doctor,
        nurseInCharge: currentUser.id.replace(/_/g, ' '),
        diagnosis: diagnosis,
        clinicalProgress: 'New admission. Baseline assessments completed. Clinical stability established. Monitoring vitals and pharmacological response.',
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
    generateLog('PATIENT_REGISTRATION', currentUser.id, `Registered new patient ${patient.info.name} (MRN: ${patient.info.mrn}) with ${medCount} prescribed medications to Bed ${bedNumber}`);
    showNotification(`Patient registered successfully with ${medCount} prescribed medications.`, 'success');
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
        if (log.action.includes('DISPENSED')) actionBadgeColor = 'bg-green-100 text-green-700';
        if (log.action.includes('ADMINISTERED')) actionBadgeColor = 'bg-blue-100 text-blue-700';
        if (log.action.includes('ISSUE')) actionBadgeColor = 'bg-red-100 text-red-700';
        if (log.action.includes('USER')) actionBadgeColor = 'bg-yellow-100 text-yellow-700';

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
                    <span class="md:hidden uppercase tracking-widest text-[8px] text-gray-400">Action</span>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-tighter ${actionBadgeColor}">${log.action.replace(/_/g, ' ')}</span>
                </div>
                <div class="md:col-span-5 text-[11px] md:text-xs font-medium text-gray-600 italic group-hover:text-blue-900 transition-colors flex flex-col md:block">
                    <span class="md:hidden uppercase tracking-widest text-[8px] text-gray-400 mb-1 not-italic">Details</span>
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
                            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Attending Consultant</p>
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
                <h3 class="font-bold text-blue-800">Clinical Verification & Medication</h3>
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
                            
                            <div class="flex gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                <span>${med.dose}</span>
                                <span>•</span>
                                <span>${med.route}</span>
                            </div>

                            ${isPending ? `
                                <div class="mt-2 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                    <input type="checkbox" id="modal-he-check-${med.id}" class="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer">
                                    <label for="modal-he-check-${med.id}" class="text-[10px] font-black text-slate-600 cursor-pointer uppercase tracking-tighter">HE Verified</label>
                                </div>
                            ` : ''}
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
    const modalCheck = document.getElementById(`modal-he-check-${id}`);
    const dashCheck = document.getElementById(`he-check-${id}`);
    const isChecked = (modalCheck && modalCheck.checked) || (dashCheck && dashCheck.checked);

    if (!isChecked) {
        showNotification('Clinical Safety: HE Verification Required', 'error');
        return;
    }

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

