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
    
    // Automated Dispensing Sequence
    triggerTransferSimulation(() => {
        availableMed.status = 'Dispensed'; // Update to Dispensed for eMAR tracking
        availableMed.nurseId = currentUser.id;
        availableMed.timeDispensed = new Date().toISOString();
        availableMed.batchInfo = inventoryItem.batch;

        updateDB(db);
        generateLog('MEDICATION_DISPENSED', currentUser.id, `ADC DISPENSED: ${orderData.medicationName} (Lot: ${inventoryItem.batch}) for Bed ${orderData.bedNumber}`);
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
