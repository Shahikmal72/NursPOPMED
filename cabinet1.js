/**
 * ADC Unit 1: Medication Dispensing Logic
 * Handles the automated dispensing of pharmacological agents from central stock.
 */
function handleCabinet1Submit(orderData) {
    const db = getDB();
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
