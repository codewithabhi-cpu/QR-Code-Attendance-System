// =======================
// LOGIN / LOGOUT CONTROL
// =======================

window.onload = () => {
    if (localStorage.getItem("loggedInUser")) {
        unlockSite();
    } else {
        lockSite();
    }
};

function lockSite() {
    document.body.classList.add("locked");
    authBox.style.display = "block";
    authOverlay.style.display = "block";
    logoutBtn.style.display = "none";
}

function unlockSite() {
    document.body.classList.remove("locked");
    authBox.style.display = "none";
    authOverlay.style.display = "none";
    logoutBtn.style.display = "block";
}

// =======================
// AUTH FUNCTIONS
// =======================

function login() {
    const user = authUser.value.trim();
    const pass = authPass.value.trim();
    const msg = authMsg;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const found = users.find(
        u => u.username === user && u.password === pass
    );

    if (!found) {
        msg.textContent = "Invalid username or password";
        return;
    }

    localStorage.setItem("loggedInUser", user);
    unlockSite();
}

function register() {
    const user = authUser.value.trim();
    const pass = authPass.value.trim();
    const msg = authMsg;

    if (!user || !pass) {
        msg.textContent = "All fields required";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some(u => u.username === user)) {
        msg.textContent = "User already exists";
        return;
    }

    users.push({ username: user, password: pass });
    localStorage.setItem("users", JSON.stringify(users));

    msg.style.color = "green";
    msg.textContent = "Registered successfully. Now login.";
}

function logout() {
    localStorage.removeItem("loggedInUser");
    lockSite();   // 🔑 THIS IS THE KEY FIX
}


const bgBtn = document.getElementById("bgToggleBtn");

// Load saved background mode
window.addEventListener("load", () => {
    const mode = localStorage.getItem("bgMode") || "light";
    document.body.classList.add(mode + "-mode");
});

// Toggle background
bgBtn.addEventListener("click", () => {
    if (document.body.classList.contains("light-mode")) {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        localStorage.setItem("bgMode", "dark");
    } else {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        localStorage.setItem("bgMode", "light");
    }
});


let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

document.getElementById('generateBtn').addEventListener('click', ()=>{
    let name = document.getElementById('name').value.trim();
    let roll = document.getElementById('roll').value.trim();
    let qrDisplay = document.getElementById('qrcode');
    qrDisplay.innerHTML = '';

    if(!name || !roll){
        alert('please enter both roll number and name ');
        return
    }

    const qrData = `${roll}|${name}`;
    new QRCode(qrDisplay ,{
        text:qrData,
        width:180,
        height:180,
    })

    if(!students.some(s=> s.roll === roll)){
        students.push({roll,name})
        localStorage.setItem('students',JSON.stringify(students));
    }

    const qrDisplayContainer = document.getElementById('qrDisplayContainer');
    const userInfo = document.getElementById('userInfo')
    userInfo.innerHTML = `<strong>Name:</strong> ${name} <br> <strong>Roll Number:</strong> ${roll}`
    qrDisplayContainer.style.display = 'block';

    document.getElementById('name').value = '';
    document.getElementById('roll').value = '';
    displayAttendance();

})

function onScanSuccess(decodedText){
    const [roll, name] = decodedText.split('|');

    if (!roll || !name) {
        alert('Invalid QR Code');
        return;
    }

    if (attendance.some(a => a.roll === roll)) {
        alert("Attendance already marked!");
        return;
    }

    attendance.push({ roll, name, status: 'Present' });
    localStorage.setItem('attendance', JSON.stringify(attendance));
    displayAttendance();
}


function onScanError(err){
    console.log(err)
}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    {fps : 10, qrbox:250},
    false
)

html5QrcodeScanner.render(onScanSuccess , onScanError);

function displayAttendance(){
    const table = document.querySelector("#attendanceTable tbody");
    table.innerHTML = "";

    const data = JSON.parse(localStorage.getItem('attendance')) || [];

    const countMap = {}
    data.forEach(item =>{
        if(!countMap[item.roll]){
            countMap[item.roll] = {name:item.name, count:0, status:item.status}
        }
        countMap[item.roll].count++;
    });

    Object.entries(countMap).forEach(([roll,info])=>{
        let row =`
          <tr>
          <td>${roll}</td>
          <td>${info.name}</td>
          <td style=\"color:green; font-weight:bold;\">${info.status}</td>
          <td style=\"color:green;\">${info.count}</td>
          </tr>
        `;
        table.innerHTML +=row;
    })
}

displayAttendance();

document.getElementById('downloadQrBtn').addEventListener('click',()=>{
    const qrContainer = document.getElementById('qrDisplayContainer');
    html2canvas(qrContainer).then(canvas =>{
          let link = document.createElement('a');
          link.download = `QR_${Date.now()}.png`;
          link.href = canvas.toDataURL()
          link.click();
    })
})

function displayAttendance(){
    const table = document.querySelector("#attendanceTable tbody");
    table.innerHTML = "";

    const data = JSON.parse(localStorage.getItem('attendance')) || [];

    const countMap = {};
    data.forEach(item =>{
        if(!countMap[item.roll]){
            countMap[item.roll] = {
                name: item.name,
                count: 0,
                status: item.status
            };
        }
        countMap[item.roll].count++;
    });

    Object.entries(countMap).forEach(([roll, info])=>{
        let row = `
          <tr>
            <td>${roll}</td>
            <td>${info.name}</td>
            <td style="color:green; font-weight:bold;">${info.status}</td>
            <td style="color:green;">${info.count}</td>
            <td>
                <button onclick="deleteAttendance('${roll}')" 
                        style="background:red;color:white;border:none;padding:5px 10px;cursor:pointer;">
                    Delete
                </button>
            </td>
          </tr>
        `;
        table.innerHTML += row;
    });
}


function deleteAttendance(roll){
    let attendance = JSON.parse(localStorage.getItem('attendance')) || [];

    // Remove all records for this roll number
    attendance = attendance.filter(a => a.roll !== roll);

    localStorage.setItem('attendance', JSON.stringify(attendance));
    displayAttendance();
}

function onScanSuccess(decodedText){
    const [roll, name] = decodedText.split('|');

    if (!roll || !name) {
        alert('Invalid QR Code');
        return;
    }

    // date function

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Prevent duplicate attendance for same roll on same date
    if (attendance.some(a => a.roll === roll && a.date === today)) {
        alert("Attendance already marked for today!");
        return;
    }

    attendance.push({
        roll,
        name,
        status: 'Present',
        date: today
    });

    localStorage.setItem('attendance', JSON.stringify(attendance));
    displayAttendance();
}

function displayAttendance(){
    const table = document.querySelector("#attendanceTable tbody");
    table.innerHTML = "";

    const data = JSON.parse(localStorage.getItem('attendance')) || [];

    const countMap = {};

    data.forEach(item =>{
        if(!countMap[item.roll]){
            countMap[item.roll] = {
                name: item.name,
                count: 0,
                status: item.status,
                dates: []
            };
        }
        countMap[item.roll].count++;
        countMap[item.roll].dates.push(item.date);
    });

    Object.entries(countMap).forEach(([roll, info])=>{
        let row = `
          <tr>
            <td>${roll}</td>
            <td>${info.name}</td>
            <td style="color:green;font-weight:bold;">${info.status}</td>
            <td style="color:green;">${info.count}</td>
            <td>${info.dates.join('<br>')}</td>
            <td>
                <button onclick="deleteAttendance('${roll}')"
                    style="background:red;color:white;border:none;padding:5px 10px;cursor:pointer;">
                    Delete
                </button>
            </td>
          </tr>
        `;
        table.innerHTML += row;
    });
}
