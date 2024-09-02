const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");

signupBtn.onclick = (() => {
    loginForm.style.marginLeft = "-50%";
    loginText.style.marginLeft = "-50%";
});
loginBtn.onclick = (() => {
    loginForm.style.marginLeft = "0%";
    loginText.style.marginLeft = "0%";
});
signupLink.onclick = (() => {
    signupBtn.click();
    return false;
});

// ฟังก์ชันแสดงแจ้งเตือน
function showAlert(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonText: 'ตกลง'
    });
}

// ฟังก์ชันการเข้ารหัสรหัสผ่าน
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ฟังก์ชันการสมัครสมาชิก
async function signupUser() {
    const displayName = document.getElementById('displayName').value;
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    if (!displayName || !username || !password) {
        showAlert('error', 'กรอกข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
        return;
    }

    // ตรวจสอบความยาวของชื่อผู้ใช้และรหัสผ่าน
    if (username.length < 4 || password.length < 6) {
        showAlert('error', 'ข้อมูลไม่ถูกต้อง', 'ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร และรหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return;
    }

    // ตรวจสอบรูปแบบของชื่อผู้ใช้
    const usernamePattern = /^[a-zA-Z0-9_]+$/;
    if (!usernamePattern.test(username)) {
        showAlert('error', 'ชื่อผู้ใช้ไม่ถูกต้อง', 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร, ตัวเลข, หรือ "_" เท่านั้น');
        return;
    }

    // ดึงข้อมูลผู้ใช้ทั้งหมดจาก Local Storage และตรวจสอบว่ามีหรือไม่
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];

    // ตรวจสอบว่าชื่อผู้ใช้ซ้ำหรือไม่
    if (storedUsers.some(user => user.username === username)) {
        showAlert('error', 'ชื่อผู้ใช้ซ้ำ', 'ชื่อผู้ใช้ที่เลือกมีอยู่แล้ว โปรดเลือกชื่ออื่น');
        return;
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await hashPassword(password);

    // กำหนดบทบาทของผู้ใช้
    const role = (username === 'admin') ? 'admin' : 'user'; // หากชื่อผู้ใช้คือ 'admin' จะถือว่าเป็น admin

    // เพิ่มผู้ใช้ใหม่ไปยังอาร์เรย์
    storedUsers.push({ displayName, username, password: hashedPassword, role });

    // เก็บอาร์เรย์ผู้ใช้ที่อัปเดตลงใน Local Storage
    localStorage.setItem('users', JSON.stringify(storedUsers));

    Swal.fire({
        icon: 'success',
        title: 'สมัครสมาชิกสำเร็จ!',
        text: 'กรุณาเข้าสู่ระบบ.',
        confirmButtonText: 'ตกลง'
    }).then(() => {
        loginBtn.click(); // สลับไปยังฟอร์มการเข้าสู่ระบบ
    });
}

// ฟังก์ชันการเข้าสู่ระบบ
async function loginUser() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const storedUsers = JSON.parse(localStorage.getItem('users')) || []; // ดึงข้อมูลผู้ใช้ทั้งหมดจาก Local Storage

    // เข้ารหัสรหัสผ่านที่ผู้ใช้กรอก
    const hashedPassword = await hashPassword(password);

    // ตรวจสอบข้อมูลผู้ใช้ที่ถูกเก็บไว้กับข้อมูลที่กรอกในฟอร์ม
    const user = storedUsers.find(user => user.username === username && user.password === hashedPassword);

    if (user) {
        Swal.fire({
            icon: 'success',
            title: 'เข้าสู่ระบบสำเร็จ',
            text: 'คุณจะถูกนำไปยังหน้าถัดไป',
            confirmButtonText: 'ตกลง'
        }).then(() => {
            localStorage.setItem('currentUser', JSON.stringify(user)); // เก็บข้อมูลผู้ใช้ที่กำลังล็อกอิน
            window.location.href = 'borrow.html'; // เปลี่ยนเส้นทางไปยัง borrow.html
        });
    } else {
        showAlert('error', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'กรุณาลองใหม่');
    }
}

// ฟังก์ชันการแสดงชื่อผู้ใช้ทั้งหมดที่เคยสมัครไว้
function showAllUsers() {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];

    if (storedUsers.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'ไม่มีผู้ใช้ที่สมัครสมาชิก',
            text: 'ยังไม่มีผู้ใช้ที่ทำการสมัครสมาชิกในระบบนี้',
            confirmButtonText: 'ตกลง'
        });
        return;
    }

    const userList = storedUsers.map(user => user.username).join('<br>');

    Swal.fire({
        icon: 'info',
        title: 'รายการชื่อผู้ใช้ที่เคยสมัครไว้',
        html: userList,
        confirmButtonText: 'ตกลง'
    });
}

// ฟังก์ชันการลบผู้ใช้
function deleteUser(username) {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = storedUsers.filter(user => user.username !== username);

    localStorage.setItem('users', JSON.stringify(updatedUsers));

    Swal.fire({
        icon: 'success',
        title: 'ลบผู้ใช้สำเร็จ!',
        text: `ข้อมูลของ ${username} ถูกลบเรียบร้อยแล้ว`,
        confirmButtonText: 'ตกลง'
    });
}

// ฟังก์ชันการแสดงรายละเอียดผู้ใช้ทั้งหมดที่เคยสมัครไว้
function showAllUsersWithDetails() {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];

    if (storedUsers.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'ไม่มีผู้ใช้ที่สมัครสมาชิก',
            text: 'ยังไม่มีผู้ใช้ที่ทำการสมัครสมาชิกในระบบนี้',
            confirmButtonText: 'ตกลง'
        });
        return;
    }

    const userList = storedUsers.map(user => `ชื่อที่แสดง: ${user.displayName}, ชื่อผู้ใช้: ${user.username}`).join('<br>');

    Swal.fire({
        icon: 'info',
        title: 'รายการผู้ใช้ที่เคยสมัครไว้',
        html: userList,
        confirmButtonText: 'ตกลง'
    });
}
