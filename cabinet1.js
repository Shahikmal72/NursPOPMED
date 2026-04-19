// Cabinet 1: Medication Processing Unit

function processOrder(orderData) {
    const db = getDB();
    const inventoryItem = findInventoryItem(db, orderData.medicationName);

    // Auto checks
    if (!inventoryItem) {
        showNotification(`Clinical Error: ${orderData.medicationName} not found in inventory.`, 'error');
        return false;
    }

    if (inventoryItem.quantity <= 0) {
        showNotification(`Error: ${orderData.medicationName} is out of stock.`, 'error');
        return false;
    }

    // Duplicate and Availability check
    const patient = db.patients.find(p => p.bedNumber === parseInt(orderData.bedNumber));
    
    // Check if the medication is in the patient's "Available" list
    const availableMed = patient && patient.medications.find(m => m.name === orderData.medicationName && m.status === 'Pending');
    
    if (!availableMed) {
        showNotification(`Clinical Error: ${orderData.medicationName} is not in the patient's Available Medications list.`, 'error');
        return false;
    }

    if (patient && patient.medications.some(m => m.name === orderData.medicationName && m.status === 'Dispensed')) {
        if (!confirm(`Warning: ${orderData.medicationName} is already Dispensed for Bed ${orderData.bedNumber}. Proceed anyway?`)) {
            return false;
        }
    }

    // Process deduction
    inventoryItem.quantity -= 1;
    
    // Trigger Transfer Simulation before final processing
    triggerTransferSimulation(() => {
        // Update existing medication entry instead of pushing a new one
        availableMed.status = 'Pending (Transferred)'; // Intermediate state for log/tracking
        availableMed.status = 'Pending'; // Keep it pending for Cabinet 2
        availableMed.nurseId = currentUser.id;
        availableMed.timeDispensed = null;

        updateDB(db);
        generateLog('TRANSFER_CABINET_2', currentUser.id, `Sent available medicine: ${orderData.medicationName} to Bed ${orderData.bedNumber}`);
        showNotification(`Success: ${orderData.medicationName} sent to Patient Bed.`, 'success');
        
        // Refresh UI
        updateDashboard();
    });

    return true;
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
