// ฟังก์ชันการเข้ารหัสรหัสผ่าน (Hashing)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ฟังก์ชันการแสดงรายละเอียดผู้ใช้ทั้งหมดที่เคยสมัครไว้ (รวมถึงรหัสผ่าน)
function showAllUsersWithDetails() {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];

    if (storedUsers.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'ไม่มีผู้ใช้ที่สมัครสมาชิก',
            text: 'ยังไม่มีผู้ใช้ที่ทำการสมัครสมาชิกในระบบนี้',
            confirmButtonText: 'ตกลง',
            customClass: {
                confirmButton: 'swal2-styled swal2-confirm',
            }
        });
        return;
    }

    // สร้างรายการรายละเอียดผู้ใช้ทั้งหมด รวมถึงรหัสผ่าน
    const userList = storedUsers.map(user => `ชื่อที่แสดง: ${user.displayName}, ชื่อผู้ใช้: ${user.username}, รหัสผ่าน: ${user.password}`).join('<br>');

    Swal.fire({
        icon: 'info',
        title: 'รายการผู้ใช้ที่เคยสมัครไว้',
        html: userList,
        confirmButtonText: 'ตกลง',
        customClass: {
            confirmButton: 'swal2-styled swal2-confirm',
        }
    });
}

// ฟังก์ชันการรีเซ็ตข้อมูลผู้ใช้
function resetUserDetails() {
    Swal.fire({
        title: 'กรุณาใส่ชื่อผู้ใช้ที่ต้องการรีเซ็ต',
        input: 'text',
        inputLabel: 'ชื่อผู้ใช้',
        inputPlaceholder: 'ใส่ชื่อผู้ใช้ที่ต้องการรีเซ็ต',
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        customClass: {
            confirmButton: 'swal2-styled swal2-confirm',
            cancelButton: 'swal2-styled swal2-cancel'
        }
    }).then(async (result) => {
        if (result.isConfirmed && result.value) {
            const usernameToReset = result.value;
            const storedUsers = JSON.parse(localStorage.getItem('users')) || [];

            const userIndex = storedUsers.findIndex(user => user.username === usernameToReset);
            if (userIndex === -1) {
                Swal.fire({
                    icon: 'error',
                    title: 'ไม่พบชื่อผู้ใช้',
                    text: 'ชื่อผู้ใช้ที่กรอกไม่มีอยู่ในระบบ',
                    confirmButtonText: 'ตกลง',
                    customClass: {
                        confirmButton: 'swal2-styled swal2-confirm',
                    }
                });
                return;
            }

            Swal.fire({
                title: 'กรุณาใส่ข้อมูลใหม่',
                html:
                    '<input id="newDisplayName" class="swal2-input" placeholder="ชื่อที่แสดงใหม่">' +
                    '<input id="newPassword" type="password" class="swal2-input" placeholder="รหัสผ่านใหม่">',
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'รีเซ็ต',
                cancelButtonText: 'ยกเลิก',
                customClass: {
                    confirmButton: 'swal2-styled swal2-confirm',
                    cancelButton: 'swal2-styled swal2-cancel'
                },
                preConfirm: async () => {
                    const newDisplayName = document.getElementById('newDisplayName').value;
                    const newPassword = document.getElementById('newPassword').value;

                    if (!newDisplayName || !newPassword) {
                        Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบ');
                        return;
                    }

                    // เข้ารหัสรหัสผ่านใหม่
                    const hashedPassword = await hashPassword(newPassword);
                    storedUsers[userIndex].displayName = newDisplayName;
                    storedUsers[userIndex].password = hashedPassword;
                    localStorage.setItem('users', JSON.stringify(storedUsers));

                    Swal.fire({
                        icon: 'success',
                        title: 'รีเซ็ตข้อมูลสำเร็จ!',
                        text: `ข้อมูลของ ${usernameToReset} ถูกรีเซ็ตเรียบร้อยแล้ว`,
                        confirmButtonText: 'ตกลง',
                        customClass: {
                            confirmButton: 'swal2-styled swal2-confirm',
                        }
                    });
                }
            });
        }
    });
}

// ฟังก์ชันการลบข้อมูลผู้ใช้ทั้งหมด
function clearAllUsers() {
    Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "ข้อมูลผู้ใช้ทั้งหมดจะถูกลบถาวร!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก',
        customClass: {
            confirmButton: 'swal2-styled swal2-confirm',
            cancelButton: 'swal2-styled swal2-cancel'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('users');
            Swal.fire({
                icon: 'success',
                title: 'ลบข้อมูลสำเร็จ!',
                text: 'ข้อมูลผู้ใช้ทั้งหมดถูกลบเรียบร้อยแล้ว',
                confirmButtonText: 'ตกลง',
                customClass: {
                    confirmButton: 'swal2-styled swal2-confirm',
                }
            });
        }
    });
}