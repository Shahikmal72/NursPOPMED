// Cabinet 3: IV Solution Storage

function requestIVAccess(requestData) {
    const db = getDB();
    const solutionItem = findInventoryItem(db, requestData.solutionType);

    if (!solutionItem) {
        showNotification(`Clinical Error: ${requestData.solutionType} not found in inventory.`, 'error');
        return false;
    }

    if (solutionItem.quantity <= 0) {
        showNotification(`Error: ${requestData.solutionType} is out of stock.`, 'error');
        return false;
    }

    // Deduct stock
    solutionItem.quantity -= 1;

    // Trigger Preparation Simulation for Cabinet 3
    triggerPreparationSimulation(() => {
        const requestLog = {
            id: `REQ-${Date.now()}`,
            timestamp: new Date().toISOString(),
            nurseId: currentUser.id,
            patientName: requestData.patientName,
            bedNumber: requestData.bedNumber,
            medicationToDilute: requestData.medicationToDilute,
            solutionType: requestData.solutionType,
            quantity: 1
        };

        db.ivRequests.push(requestLog);
        updateDB(db);
        generateLog('IV_ACCESS', currentUser.id, `Accessed Cabinet 3: Removed ${requestData.solutionType} for dilution of ${requestData.medicationToDilute} (Bed ${requestData.bedNumber})`);
        showNotification(`Access Granted: ${requestData.solutionType} removed from Cabinet 3 for dilution.`, 'success');
        
        // Refresh UI
        updateDashboard();
    }, requestData.solutionType, requestData.medicationToDilute);

    return true;
}
