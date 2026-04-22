/**
 * ADC Unit 1: Medication Dispensing Logic
 * Handles the automated dispensing of pharmacological agents from central stock.
 */
function handleCabinet1Submit(orderData) {
    const db = getDB();

    // Security Verification: Authorized for Dispensing
    if (!isAuthorizedForAction('MED_DISPENSING')) {
        showNotification('SECURITY DENIED: Your role is not authorized for medication dispensing.', 'error');
        generateLog('SECURITY_VIOLATION', currentUser.id, `Unauthorized dispensing attempt for ${orderData.medicationName} (Bed ${orderData.bedNumber})`);
        return false;
    }

    const inventoryItem = findInventoryItem(db, orderData.medicationName);

    if (!inventoryItem || inventoryItem.quantity <= 0) {
        showNotification(`Inventory Error: ${orderData.medicationName} is out of stock.`, 'error');
        return false;
    }

    // Safety Alert: Expiry Check
    const now = new Date();
    if (new Date(inventoryItem.expiry) <= now) {
        showNotification(`Safety Alert: ${orderData.medicationName} (Lot: ${inventoryItem.batch}) is EXPIRED. Dispensing blocked.`, 'error');
        return false;
    }

    // Patient and Prescription Validation
    const patient = db.patients.find(p => p.bedNumber === parseInt(orderData.bedNumber));
    const availableMed = patient && patient.medications.find(m => m.name === orderData.medicationName && m.status === 'Pending');
    
    if (!availableMed) {
        showNotification(`Clinical Error: ${orderData.medicationName} is not in the patient's active orders.`, 'error');
        return false;
    }

    // Security Check: Controlled Drugs (Requires Dual Authentication simulation)
    if (inventoryItem.isControlled) {
        const witness = prompt("CONTROLLED DRUG PROTOCOL: Secondary clinician ID required for witness verification:");
        if (!witness) {
            showNotification('Security Error: Controlled drug dispensing requires dual authentication.', 'error');
            return false;
        }
    }

    // Safety Alert: High Alert or LASA
    const protocol = db.medicationProtocols[orderData.medicationName];
    if (protocol && (protocol.isHighAlert || protocol.isLASA)) {
        const type = protocol.isHighAlert ? 'HIGH_ALERT' : 'LASA';
        const details = protocol.isLASA ? protocol.lasaNote : 'HIGH ALERT: Verify concentration and infusion rate as per protocol.';
        
        showClinicalSafetyAlert(orderData.medicationName, type, details, () => {
            // Proceed with dispensing after safety acknowledgement
            processDispensing(db, inventoryItem, availableMed, orderData);
        });
        return true; // Modal handles the rest
    }

    // Standard Dispensing
    processDispensing(db, inventoryItem, availableMed, orderData);
    return true;
}

function processDispensing(db, inventoryItem, availableMed, orderData) {
    // Inventory Deduction (FIFO logic - here simplified to single batch)
    inventoryItem.quantity -= 1;
    
    // Get remarks if any (from UI if we had an input, for now we'll add it to the log)
    const remarks = orderData.remarks || 'Standard ADC Release';

    // Automated Dispensing Sequence
    triggerTransferSimulation(() => {
        availableMed.status = 'Dispensed'; // Update to Dispensed for eMAR tracking
        availableMed.nurseId = currentUser.id;
        availableMed.timeDispensed = new Date().toISOString();
        availableMed.batchInfo = inventoryItem.batch;
        availableMed.dispensingRemarks = remarks;

        updateDB(db);
        generateLog('MEDICATION_DISPENSED', currentUser.id, `ADC DISPENSED: ${orderData.medicationName} (Lot: ${inventoryItem.batch}) for Bed ${orderData.bedNumber}. Remarks: ${remarks}`);
        showNotification(`Dispensing Successful: ${orderData.medicationName} released from ADC.`, 'success');
        
        updateDashboard();
    }, "ADC Unit 1: Automated Dispensing", `Dispensing ${orderData.medicationName}... Please retrieve from bin.`);
}

function reportMedicationIssue(invId, issue) {
    const db = getDB();
    const item = db.inventory.find(i => i.id === invId);
    if (item) {
        item.unusable = true;
        item.issueReport = issue;
        updateDB(db);
        generateLog('ISSUE_REPORTED', currentUser.id, `Reported ${item.name} as ${issue}. Marked as UNUSABLE.`);
        showNotification(`${item.name} marked as UNUSABLE.`, 'info');
    }
}

/**
 * NEW: Prescription Module Logic (For Medical Doctors)
 */
function togglePrescriptionView() {
    const dispensingForm = document.getElementById('cabinet1-form');
    const prescriptionView = document.getElementById('prescription-view');
    const btnNew = document.getElementById('btn-new-prescription');
    const clinicalInstruction = dispensingForm.previousElementSibling;

    if (prescriptionView.classList.contains('hidden')) {
        // Switch to Prescription View
        dispensingForm.classList.add('hidden');
        clinicalInstruction.classList.add('hidden');
        prescriptionView.classList.remove('hidden');
        btnNew.innerHTML = 'Cancel Prescription';
        btnNew.classList.replace('bg-indigo-600', 'bg-slate-500');
        
        // Auto-populate Doctor Stamp
        const stampContainer = document.getElementById('doctor-stamp-container');
        if (stampContainer) {
            stampContainer.innerHTML = generateNurseStamp(currentUser.fullname, currentUser.role);
        }
        
        // Populate Medication List from global DB
        populatePrescriptionMeds();
        
        // Default time to now + 30 mins
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        document.getElementById('prescribe-time-due').value = now.toISOString().slice(0, 16);
    } else {
        // Switch back to Dispensing View
        prescriptionView.classList.add('hidden');
        dispensingForm.classList.remove('hidden');
        clinicalInstruction.classList.remove('hidden');
        btnNew.innerHTML = '+ New Prescription';
        btnNew.classList.replace('bg-slate-500', 'bg-indigo-600');
    }
}

function populatePrescriptionMeds() {
    const db = getDB();
    const select = document.getElementById('prescribe-med-name');
    if (!select) return;
    
    const allMeds = [
        ...db.medications.oral,
        ...db.medications.iv,
        ...db.medications.injection,
        ...db.medications.emergency,
        ...db.medications.others
    ];
    
    select.innerHTML = allMeds.map(m => `<option value="${m}">${m}</option>`).join('');
}

function handleNewPrescription() {
    const db = getDB();
    const bedNumber = parseInt(document.getElementById('cabinet1-patient-list').value);
    
    if (!bedNumber) {
        showNotification('Clinical Error: No patient selected for prescription.', 'error');
        return;
    }

    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    if (!patient || !patient.occupied) {
        showNotification('Clinical Error: Selected bed is currently unoccupied.', 'error');
        return;
    }

    const medName = document.getElementById('prescribe-med-name').value;
    const dose = document.getElementById('prescribe-dose').value;
    const route = document.getElementById('prescribe-route').value;
    const freq = document.getElementById('prescribe-frequency').value;
    const timeDue = document.getElementById('prescribe-time-due').value;

    if (!dose || !timeDue) {
        showNotification('Validation Error: Dose and Due Time are required.', 'warning');
        return;
    }

    // Create New Medication Order (KKM Standard Traceability)
    const newMed = {
        id: `MED-${Date.now()}-${bedNumber}`,
        name: medName,
        dose: dose,
        route: route,
        frequency: freq,
        timeDue: new Date(timeDue).toISOString(),
        status: 'Pending',
        prescribingDoctor: currentUser.fullname, // Auto-stamped
        nurseId: 'Awaiting Dispensing',
        nurseInCharge: patient.info.nurseInCharge,
        timeDispensed: null,
        timeAdministered: null
    };

    patient.medications.push(newMed);
    updateDB(db);

    // Clinical Log with Doctor Stamp Traceability
    generateLog('NEW_PRESCRIPTION', currentUser.id, `AUTHORIZED ORDER: ${medName} ${dose} ${route} ${freq}. Prescribed by ${currentUser.fullname} (${currentUser.role}).`);
    
    showNotification(`New prescription authorized for Bed ${bedNumber}: ${medName}`, 'success');
    
    // Switch back to dispensing view to see the new order
    togglePrescriptionView();
    selectPatientForCabinet1(bedNumber); // Refresh available meds list
}

function populateCabinet1Patients() {
    const db = getDB();
    const select = document.getElementById('cabinet1-patient-list');
    if (!select) return;
    
    const currentVal = select.value;
    select.innerHTML = '<option value="">Select a Patient / Bed</option>';
    
    db.patients.filter(p => p.occupied).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.bedNumber;
        opt.innerText = `Bed ${p.bedNumber}: ${p.info.name}`;
        select.appendChild(opt);
    });
    
    if (currentVal) select.value = currentVal;

    // Also update the global medication overview list
    const globalList = document.getElementById('cabinet1-global-list');
    if (globalList) {
        globalList.innerHTML = '';
        db.patients.filter(p => p.occupied).forEach(p => {
            p.medications.forEach(med => {
                if (med.status === 'Pending') {
                    const div = document.createElement('div');
                    div.className = 'p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center transition-all hover:border-blue-200 hover:bg-white cursor-pointer';
                    div.onclick = () => {
                        select.value = p.bedNumber;
                        selectPatientForCabinet1(p.bedNumber);
                        // Auto-fill logic moved to global scope or utility
                        if (typeof autoFillMedication === 'function') autoFillMedication(med);
                    };
                    
                    div.innerHTML = `
                        <div class="flex-grow">
                            <div class="flex items-center gap-2 mb-0.5">
                                <span class="text-[9px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">Bed ${p.bedNumber}</span>
                                <p class="text-xs font-bold text-slate-800">${med.name}</p>
                            </div>
                            <div class="flex justify-between items-center pr-2">
                                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${p.info.name}</p>
                                <p class="text-[9px] text-blue-600 font-black tracking-tighter">${formatDateTime(med.timeDue).split(',')[1]}</p>
                            </div>
                        </div>
                    `;
                    globalList.appendChild(div);
                }
            });
        });
        if (globalList.innerHTML === '') {
            globalList.innerHTML = '<p class="text-center text-slate-300 italic text-[10px] py-10">No pending medications found.</p>';
        }
    }
}

function selectPatientForCabinet1(bedValue) {
    if (!bedValue) return;
    const db = getDB();
    const bedNumber = parseInt(bedValue);
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    if (!patient) return;

    // Show panel
    const panel = document.getElementById('cabinet1-available-panel');
    if (panel) panel.classList.remove('hidden');
    
    // Update summary
    const diagnosisEl = document.getElementById('cab1-diagnosis');
    const progressEl = document.getElementById('cab1-progress');
    if (diagnosisEl) diagnosisEl.textContent = patient.info.diagnosis;
    if (progressEl) progressEl.textContent = patient.info.clinicalProgress;
    
    const summary = document.getElementById('cabinet1-patient-summary');
    if (summary) summary.classList.remove('hidden');

    renderCabinet1AvailableMeds(patient);
}

function renderCabinet1AvailableMeds(patient) {
    const availableList = document.getElementById('cabinet1-available-list');
    if (!availableList) return;

    const availableMeds = patient.medications.filter(m => m.status === 'Pending');

    // Show/Hide Bulk Transfer button
    const bulkBtn = document.getElementById('btn-bulk-transfer');
    if (bulkBtn) {
        bulkBtn.classList.toggle('hidden', availableMeds.length === 0);
        bulkBtn.innerHTML = 'Transfer Selected'; 
    }

    if (availableMeds.length === 0) {
        availableList.innerHTML = `
            <div class="p-6 text-center">
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">No pending medications</p>
            </div>
        `;
        return;
    }

    // Add Select All Toggle
    let html = `
        <div class="px-4 py-2 bg-slate-100 rounded-xl mb-3 flex items-center gap-3">
            <input type="checkbox" id="select-all-meds" onchange="toggleSelectAllMeds(this.checked)" class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer">
            <label for="select-all-meds" class="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer">Select All Pending</label>
        </div>
    `;

    html += availableMeds.map(med => `
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all group flex items-center gap-4 cursor-pointer" onclick="toggleMedSelection('${med.id}')">
            <div class="flex items-center" onclick="event.stopPropagation()">
                <input type="checkbox" id="check-${med.id}" class="med-transfer-checkbox w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" data-med-id="${med.id}">
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-black text-slate-900 truncate">${med.name}</p>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded">${med.dose}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${med.frequency}</span>
                </div>
            </div>
            <button onclick="event.stopPropagation(); initiateDispensing('${med.id}')" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-200 active:scale-95">
                Dispense
            </button>
        </div>
    `).join('');

    availableList.innerHTML = html;
}

function toggleMedSelection(medId) {
    const cb = document.getElementById(`check-${medId}`);
    if (cb) cb.checked = !cb.checked;
}

function toggleSelectAllMeds(checked) {
    const checkboxes = document.querySelectorAll('.med-transfer-checkbox');
    checkboxes.forEach(cb => cb.checked = checked);
}

function handleBulkTransfer() {
    const db = getDB();
    // Use the current bed number from the UI
    const bedNumber = parseInt(document.getElementById('cabinet1-patient-list').value);
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    if (!patient) return;

    // Get selected medication IDs from checkboxes
    const selectedCheckboxes = document.querySelectorAll('.med-transfer-checkbox:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-med-id'));

    if (selectedIds.length === 0) {
        showNotification('Clinical Error: No medications selected for transfer.', 'warning');
        return;
    }

    // Show processing state
    const bulkBtn = document.getElementById('btn-bulk-transfer');
    const originalText = bulkBtn.innerHTML;
    bulkBtn.disabled = true;
    bulkBtn.innerHTML = '<span class="animate-spin inline-block">⏳</span> Processing...';

    // Transfer only the selected medications
    const medicationsToTransfer = patient.medications.filter(m => selectedIds.includes(m.id));
    
    medicationsToTransfer.forEach(med => {
        med.status = 'Dispensed';
        med.nurseId = currentUser.id;
        med.timeDispensed = new Date().toISOString();
        med.dispensingRemarks = 'Bulk Selected ADC Transfer';
    });

    updateDB(db);
    generateLog('BULK_TRANSFER', currentUser.id, `Bulk transfer completed for Bed ${bedNumber}: ${medicationsToTransfer.length} items selected.`);

    // Wait for clinical simulation
    setTimeout(() => {
        renderCabinet1AvailableMeds(patient);
        updateDashboard();
        showNotification(`Successfully transferred ${medicationsToTransfer.length} medications.`, 'success');
        bulkBtn.disabled = false;
        bulkBtn.innerHTML = originalText;
    }, 1500);
}

function initiateDispensing(medId) {
    const db = getDB();
    const bedNumber = parseInt(document.getElementById('cabinet1-patient-list').value);
    const patient = db.patients.find(p => p.bedNumber === bedNumber);
    if (!patient) return;
    
    const med = patient.medications.find(m => m.id === medId);
    if (med) {
        handleCabinet1Submit({
            medicationName: med.name,
            bedNumber: bedNumber,
            remarks: 'Initiated from ADC Interface'
        });
    }
}
