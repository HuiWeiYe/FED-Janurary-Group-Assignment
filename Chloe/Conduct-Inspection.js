// 1. Get current stall info from storage immediately
const currentInspectionStall = localStorage.getItem('currentInspectionStall');
const currentCategory = localStorage.getItem('currentCategory');

// 2. Main Submit Function
function submitInspection() {
    // 1. Get the inputs
    const gradeEl = document.querySelector('input[name="hygieneGrade"]:checked');
    const notes = document.getElementById('inspectorNotes').value;
    const violations = document.getElementById('violationCount').value;
    
    // 2. Validation
    if (!gradeEl) {
        alert("Please select a Hygiene Grade before submitting.");
        return;
    }

    const selectedGrade = gradeEl.value;
    const stallName = localStorage.getItem('currentInspectionStall');
    const category = localStorage.getItem('currentCategory');

    // 3. Retrieve the full data object from LocalStorage
    // We parse it into a local variable called 'data'
    let fullData = JSON.parse(localStorage.getItem('inspectionData'));

    // 4. If LocalStorage is empty (first time), we need to handle that
    // (In a real app, this would be your default inspectionData object)
    if (!fullData) {
        alert("Error: Could not find inspection records. Please restart from the dashboard.");
        window.location.href = "Inspector.html";
        return;
    }

    // 5. Find the stall in the correct category (upcoming or overdue)
    const stallIndex = fullData[category].findIndex(s => s.name === stallName);
    
    if (stallIndex > -1) {
        // REMOVE from the old list
        const stallObj = fullData[category].splice(stallIndex, 1)[0];
        
        // UPDATE the object with new info
        stallObj.result = `Grade ${selectedGrade}`;
        stallObj.date = new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
        stallObj.notes = notes;
        stallObj.violations = violations;

        // ADD to the completed list
        fullData.completed.unshift(stallObj);

        // 6. SAVE the entire updated object back to LocalStorage
        localStorage.setItem('inspectionData', JSON.stringify(fullData));
        
        alert("Inspection Submitted Successfully!");
        
        // 7. Redirect back
        window.location.href = "Inspector.html";
    } else {
        alert("Error: Stall not found in the records.");
    }
}