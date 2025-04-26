// Data Storage
let members = JSON.parse(localStorage.getItem('fittrackMembers')) || [];
let attendance = JSON.parse(localStorage.getItem('fittrackAttendance')) || {};
let fitnessPlans = JSON.parse(localStorage.getItem('fittrackFitnessPlans')) || [];
let nutritionPlans = JSON.parse(localStorage.getItem('fittrackNutritionPlans')) || [];

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard counters
    updateDashboardCounters();
    
    // Initialize member list
    renderMemberList();
    
    // Member form submission handler
    const memberForm = document.getElementById('member-form');
    if (memberForm) {
        memberForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewMember();
        });
    }
    
    // BMI Calculator form submission handler
    const bmiForm = document.getElementById('bmi-form');
    if (bmiForm) {
        bmiForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateBMI();
        });
    }
    
    // Attendance button handler
    const markAttendanceBtn = document.getElementById('mark-attendance-btn');
    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener('click', markAttendance);
    }
    
    // Fitness Plan assignment handlers
    const assignPlanBtns = document.querySelectorAll('.assign-plan-btn');
    assignPlanBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const planType = this.getAttribute('data-plan');
            document.getElementById('selected-plan').value = planType;
            populateMemberDropdown('plan-member-select');
        });
    });
    
    // Nutrition Plan assignment handlers
    const assignDietBtns = document.querySelectorAll('.assign-diet-btn');
    assignDietBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const dietType = this.getAttribute('data-diet');
            document.getElementById('selected-diet').value = dietType;
            populateMemberDropdown('diet-member-select');
        });
    });
    
    // Assign Plan form submission
    const assignPlanForm = document.getElementById('assign-plan-form');
    if (assignPlanForm) {
        assignPlanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            assignFitnessPlan();
        });
    }
    
    // Assign Diet form submission
    const assignDietForm = document.getElementById('assign-diet-form');
    if (assignDietForm) {
        assignDietForm.addEventListener('submit', function(e) {
            e.preventDefault();
            assignNutritionPlan();
        });
    }
});

// Function to update dashboard counters
function updateDashboardCounters() {
    document.getElementById('total-members').textContent = members.length;
    
    const activeMembers = members.filter(member => member.membershipStatus === 'y');
    document.getElementById('active-memberships').textContent = activeMembers.length;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const todaysAttendance = attendance[today] ? attendance[today].length : 0;
    document.getElementById('todays-attendance').textContent = todaysAttendance;
    
    document.getElementById('active-plans').textContent = fitnessPlans.length;
}

// Function to add a new member
function addNewMember() {
    const memberName = document.getElementById('member-name').value;
    const memberEmail = document.getElementById('member-email').value;
    const memberPhone = document.getElementById('member-phone').value;
    const memberAge = document.getElementById('member-age').value;
    const memberGender = document.getElementById('member-gender').value;
    const membershipStatus = document.getElementById('membership-status').value;
    
    const newMember = {
        id: generateMemberId(),
        name: memberName,
        email: memberEmail,
        phone: memberPhone,
        age: memberAge,
        gender: memberGender,
        membershipStatus: membershipStatus,
        bmi: null,
        dateJoined: new Date().toISOString().split('T')[0]
    };
    
    members.push(newMember);
    localStorage.setItem('fittrackMembers', JSON.stringify(members));
    
    // Clear the form
    document.getElementById('member-form').reset();
    
    // Update the member list
    renderMemberList();
    
    // Update dashboard
    updateDashboardCounters();
    
    alert('Member added successfully!');
}

// Function to generate a unique member ID
function generateMemberId() {
    return 'MEM' + Date.now().toString().slice(-6);
}

// Function to calculate BMI
function calculateBMI() {
    const height = parseFloat(document.getElementById('bmi-height').value); // in cm
    const weight = parseFloat(document.getElementById('bmi-weight').value); // in kg
    
    // Convert height to meters
    const heightInMeters = height / 100;
    
    // Calculate BMI: weight (kg) / (height (m) * height (m))
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // Display the BMI result
    document.getElementById('bmi-value').textContent = bmi.toFixed(1);
    
    // Determine BMI category
    let category, progressClass, recommendation;
    
    if (bmi < 18.5) {
        category = 'Underweight';
        progressClass = 'bmi-underweight';
        recommendation = 'Consider gaining weight through a balanced diet and strength training. Focus on protein-rich foods and calorie-dense meals.';
    } else if (bmi >= 18.5 && bmi < 25) {
        category = 'Normal Weight';
        progressClass = 'bmi-normal';
        recommendation = 'Maintain your healthy weight through regular exercise and a balanced diet. Focus on whole foods and portion control.';
    } else if (bmi >= 25 && bmi < 30) {
        category = 'Overweight';
        progressClass = 'bmi-overweight';
        recommendation = 'Consider losing weight through increased physical activity and a calorie-controlled diet. Focus on portion sizes and reduce processed foods.';
    } else {
        category = 'Obese';
        progressClass = 'bmi-obese';
        recommendation = 'It\'s recommended to consult with a healthcare provider. Focus on a gradual weight loss plan combining diet changes and regular exercise.';
    }
    
    document.getElementById('bmi-category').textContent = `Category: ${category}`;
    
    // Update the progress bar
    const progressBar = document.getElementById('bmi-progress');
    progressBar.className = 'progress-bar';
    progressBar.classList.add(progressClass);
    
    // Set width based on BMI (max at 40)
    const widthPercentage = Math.min(100, (bmi / 40) * 100);
    progressBar.style.width = `${widthPercentage}%`;
    progressBar.textContent = bmi.toFixed(1);
    
    // Display recommendation
    document.getElementById('bmi-recommendation').textContent = recommendation;
    
    // Show the result
    document.getElementById('bmi-result').style.display = 'block';
    
    return bmi;
}

// Function to calculate BMI for a specific member
function calculateMemberBMI(height, weight) {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
}

// Function to render the member list
function renderMemberList() {
    const memberListElement = document.getElementById('member-list');
    if (!memberListElement) return;
    
    memberListElement.innerHTML = '';
    
    members.forEach(member => {
        const row = document.createElement('tr');
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        const isPresent = attendance[today] && attendance[today].includes(member.id);
        
        row.innerHTML = `
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${member.membershipStatus === 'y' ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}</td>
            <td>${isPresent ? '<span class="badge bg-success">Present</span>' : '<span class="badge bg-secondary">Absent</span>'}</td>
            <td>${member.bmi ? member.bmi.toFixed(1) : 'Not calculated'}</td>
            <td>
                <button class="btn btn-sm btn-info calc-bmi-btn" data-member-id="${member.id}">
                    <i class="fas fa-calculator"></i> BMI
                </button>
                <button class="btn btn-sm btn-primary view-btn" data-member-id="${member.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-member-id="${member.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        memberListElement.appendChild(row);
    });
    
    // Add event listeners for the BMI calculation buttons
    const calcBmiButtons = document.querySelectorAll('.calc-bmi-btn');
    calcBmiButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            showBmiCalculatorForMember(memberId);
        });
    });
    
    // Add event listeners for the delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            deleteMember(memberId);
        });
    });
    
    // Add event listeners for the view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-member-id');
            viewMemberDetails(memberId);
        });
    });
}

// Function to mark attendance
function markAttendance() {
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize today's attendance if it doesn't exist
    if (!attendance[today]) {
        attendance[today] = [];
    }
    
    // Show confirmation dialog
    const confirmAttendance = confirm('Do you want to mark attendance for all active members?');
    
    if (confirmAttendance) {
        // Get all active members
        const activeMembers = members.filter(member => member.membershipStatus === 'y');
        
        // Mark all active members as present
        activeMembers.forEach(member => {
            if (!attendance[today].includes(member.id)) {
                attendance[today].push(member.id);
            }
        });
        
        // Save attendance to localStorage
        localStorage.setItem('fittrackAttendance', JSON.stringify(attendance));
        
        // Update the member list
        renderMemberList();
        
        // Update dashboard
        updateDashboardCounters();
        
        alert('Attendance marked successfully for all active members!');
    }
}

// Function to show BMI calculator for a specific member
function showBmiCalculatorForMember(memberId) {
    // Find the member
    const member = members.find(m => m.id === memberId);
    
    if (!member) {
        alert('Member not found!');
        return;
    }
    
    // Prompt for height and weight
    const height = prompt(`Enter height for ${member.name} (in cm):`, member.height || '');
    if (!height) return;
    
    const weight = prompt(`Enter weight for ${member.name} (in kg):`, member.weight || '');
    if (!weight) return;
    
    // Calculate BMI
    const bmi = calculateMemberBMI(parseFloat(height), parseFloat(weight));
    
    // Update member with new BMI and measurements
    member.bmi = bmi;
    member.height = parseFloat(height);
    member.weight = parseFloat(weight);
    
    // Save to localStorage
    localStorage.setItem('fittrackMembers', JSON.stringify(members));
    
    // Update the member list
    renderMemberList();
    
    // Show the BMI result
    alert(`${member.name}'s BMI: ${bmi.toFixed(1)}\n\nBMI Category: ${getBmiCategory(bmi)}`);
}

// Function to get BMI category
function getBmiCategory(bmi) {
    if (bmi < 18.5) {
        return 'Underweight';
    } else if (bmi >= 18.5 && bmi < 25) {
        return 'Normal Weight';
    } else if (bmi >= 25 && bmi < 30) {
        return 'Overweight';
    } else {
        return 'Obese';
    }
}

// Function to delete a member
function deleteMember(memberId) {
    const confirmDelete = confirm('Are you sure you want to delete this member?');
    
    if (confirmDelete) {
        // Remove the member from the array
        members = members.filter(member => member.id !== memberId);
        
        // Save to localStorage
        localStorage.setItem('fittrackMembers', JSON.stringify(members));
        
        // Update the member list
        renderMemberList();
        
        // Update dashboard
        updateDashboardCounters();
        
        alert('Member deleted successfully!');
    }
}

// Function to view member details
function viewMemberDetails(memberId) {
    // Find the member
    const member = members.find(m => m.id === memberId);
    
    if (!member) {
        alert('Member not found!');
        return;
    }
    
    // Get assigned fitness plans
    const memberFitnessPlans = fitnessPlans.filter(plan => plan.memberId === memberId);
    let fitnessPlansText = '';
    if (memberFitnessPlans.length > 0) {
        fitnessPlansText = '\n\nAssigned Fitness Plans:';
        memberFitnessPlans.forEach(plan => {
            fitnessPlansText += `\n- ${getPlanName(plan.planType)} (${plan.duration} weeks)`;
        });
    } else {
        fitnessPlansText = '\n\nNo fitness plans assigned.';
    }
    
    // Get assigned nutrition plans
    const memberNutritionPlans = nutritionPlans.filter(plan => plan.memberId === memberId);
    let nutritionPlansText = '';
    if (memberNutritionPlans.length > 0) {
        nutritionPlansText = '\n\nAssigned Nutrition Plans:';
        memberNutritionPlans.forEach(plan => {
            nutritionPlansText += `\n- ${getDietName(plan.dietType)} (${plan.duration} weeks)`;
        });
    } else {
        nutritionPlansText = '\n\nNo nutrition plans assigned.';
    }
    
    // Attendance information
    let attendanceCount = 0;
    Object.keys(attendance).forEach(date => {
        if (attendance[date].includes(memberId)) {
            attendanceCount++;
        }
    });
    
    // Create a message with all member details
    const message = `Member Details: ${member.name}
    
ID: ${member.id}
Email: ${member.email}
Phone: ${member.phone}
Age: ${member.age}
Gender: ${member.gender}
Membership Status: ${member.membershipStatus === 'y' ? 'Active' : 'Inactive'}
BMI: ${member.bmi ? member.bmi.toFixed(1) + ' (' + getBmiCategory(member.bmi) + ')' : 'Not calculated'}
Date Joined: ${member.dateJoined}
Attendance: ${attendanceCount} days${fitnessPlansText}${nutritionPlansText}`;
    
    alert(message);
}

// Function to populate member dropdown
function populateMemberDropdown(selectId) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;
    
    // Clear existing options
    selectElement.innerHTML = '<option value="">Select a member...</option>';
    
    // Add options for each member
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (ID: ${member.id})`;
        
        // Add BMI information if available
        if (member.bmi) {
            option.textContent += ` - BMI: ${member.bmi.toFixed(1)}`;
        }
        
        selectElement.appendChild(option);
    });
}

// Function to assign a fitness plan
function assignFitnessPlan() {
    const memberId = document.getElementById('plan-member-select').value;
    const planType = document.getElementById('selected-plan').value;
    const duration = document.getElementById('plan-duration').value;
    const notes = document.getElementById('plan-notes').value;
    
    if (!memberId) {
        alert('Please select a member!');
        return;
    }
    
    // Create a new fitness plan
    const newPlan = {
        id: 'FP' + Date.now().toString().slice(-6),
        memberId: memberId,
        planType: planType,
        duration: duration,
        notes: notes,
        assignedDate: new Date().toISOString().split('T')[0]
    };
    
    // Add the plan to the array
    fitnessPlans.push(newPlan);
    
    // Save to localStorage
    localStorage.setItem('fittrackFitnessPlans', JSON.stringify(fitnessPlans));
    
    // Update dashboard
    updateDashboardCounters();
    
    // Close the modal and reset the form
    const modal = bootstrap.Modal.getInstance(document.getElementById('assignPlanModal'));
    modal.hide();
    document.getElementById('assign-plan-form').reset();
    
    alert(`Fitness plan "${getPlanName(planType)}" assigned successfully!`);
}

// Function to assign a nutrition plan
function assignNutritionPlan() {
    const memberId = document.getElementById('diet-member-select').value;
    const dietType = document.getElementById('selected-diet').value;
    const duration = document.getElementById('diet-duration').value;
    const notes = document.getElementById('diet-notes').value;
    
    if (!memberId) {
        alert('Please select a member!');
        return;
    }
    
    // Create a new nutrition plan
    const newPlan = {
        id: 'NP' + Date.now().toString().slice(-6),
        memberId: memberId,
        dietType: dietType,
        duration: duration,
        notes: notes,
        assignedDate: new Date().toISOString().split('T')[0]
    };
    
    // Add the plan to the array
    nutritionPlans.push(newPlan);
    
    // Save to localStorage
    localStorage.setItem('fittrackNutritionPlans', JSON.stringify(nutritionPlans));
    
    // Close the modal and reset the form
    const modal = bootstrap.Modal.getInstance(document.getElementById('assignDietModal'));
    modal.hide();
    document.getElementById('assign-diet-form').reset();
    
    alert(`Nutrition plan "${getDietName(dietType)}" assigned successfully!`);
}

// Helper function to get plan name
function getPlanName(planType) {
    switch (planType) {
        case 'weight-loss':
            return 'Weight Loss Plan';
        case 'maintenance':
            return 'Maintenance Plan';
        case 'weight-gain':
            return 'Weight Gain Plan';
        default:
            return 'Unknown Plan';
    }
}

// Helper function to get diet name
function getDietName(dietType) {
    switch (dietType) {
        case 'weight-loss':
            return 'Weight Loss Diet';
        case 'maintenance':
            return 'Balanced Diet';
        case 'weight-gain':
            return 'Weight Gain Diet';
        default:
            return 'Unknown Diet';
    }
}

// Add sample data for testing (uncomment to use)
/*
function addSampleData() {
    if (members.length === 0) {
        members = [
            {
                id: 'MEM123456',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '123-456-7890',
                age: 30,
                gender: 'male',
                membershipStatus: 'y',
                bmi: 24.5,
                height: 180,
                weight: 80,
                dateJoined: '2023-01-15'
            },
            {
                id: 'MEM234567',
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '234-567-8901',
                age: 28,
                gender: 'female',
                membershipStatus: 'y',
                bmi: 22.1,
                height: 165,
                weight: 60,
                dateJoined: '2023-02-20'
            },
            {
                id: 'MEM345678',
                name: 'Bob Johnson',
                email: 'bob@example.com',
                phone: '345-678-9012',
                age: 45,
                gender: 'male',
                membershipStatus: 'n',
                bmi: 27.8,
                height: 175,
                weight: 85,
                dateJoined: '2023-03-10'
            }
        ];
        
        localStorage.setItem('fittrackMembers', JSON.stringify(members));
        
        // Sample attendance data
        const today = new Date().toISOString().split('T')[0];
        attendance[today] = ['MEM123456', 'MEM234567'];
        localStorage.setItem('fittrackAttendance', JSON.stringify(attendance));
        
        // Sample fitness plans
        fitnessPlans = [
            {
                id: 'FP123456',
                memberId: 'MEM123456',
                planType: 'maintenance',
                duration: 4,
                notes: 'Focus on strength training',
                assignedDate: '2023-04-05'
            },
            {
                id: 'FP234567',
                memberId: 'MEM234567',
                planType: 'weight-loss',
                duration: 8,
                notes: 'Include extra cardio sessions',
                assignedDate: '2023-04-10'
            }
        ];
        
        localStorage.setItem('fittrackFitnessPlans', JSON.stringify(fitnessPlans));
        
        // Sample nutrition plans
        nutritionPlans = [
            {
                id: 'NP123456',
                memberId: 'MEM123456',
                dietType: 'maintenance',
                duration: 4,
                notes: 'Increase protein intake',
                assignedDate: '2023-04-05'
            }
        ];
        
        localStorage.setItem('fittrackNutritionPlans', JSON.stringify(nutritionPlans));
        
        alert('Sample data added successfully!');
        
        // Update UI
        renderMemberList();
        updateDashboardCounters();
    }
}
*/ 