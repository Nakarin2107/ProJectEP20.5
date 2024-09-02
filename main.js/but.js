document.addEventListener('DOMContentLoaded', () => {
    // ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่จาก Local Storage
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
        const user = JSON.parse(currentUser); // แปลงข้อมูล JSON ที่เก็บไว้ใน Local Storage ให้เป็น Object

        // ตรวจสอบว่า Element ที่จะใช้แสดงชื่อผู้ใช้มีอยู่หรือไม่
        const userDisplay = document.getElementById('userDisplay');
        const userDisplayName = document.getElementById('userDisplayName');

        if (userDisplay) userDisplay.textContent = user.displayName; // แสดงชื่อผู้ใช้บนปุ่มเมนูดรอปดาวน์
        if (userDisplayName) userDisplayName.textContent = user.displayName; // แสดงชื่อผู้ใช้ในเมนูดรอปดาวน์
    } else {
        window.location.href = 'login.html'; // หากไม่มีข้อมูลผู้ใช้ให้กลับไปที่หน้า Login
    }
});


        // ฟังก์ชันสำหรับออกจากระบบ
        document.getElementById('logoutButton').addEventListener('click', () => {
            Swal.fire({
                title: 'คุณแน่ใจหรือไม่?',
                text: "คุณต้องการออกจากระบบหรือไม่?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'ออกจากระบบ',
                cancelButtonText: 'ยกเลิก'
            }).then((result) => {
                if (result.isConfirmed) {
                    // ลบข้อมูลการเข้าสู่ระบบจาก Local Storage
                    localStorage.removeItem('currentUser'); // ลบสถานะผู้ใช้ที่กำลังล็อกอิน
                    Swal.fire({
                        icon: 'success',
                        title: 'ออกจากระบบสำเร็จ!',
                        text: 'คุณได้ออกจากระบบแล้ว',
                        confirmButtonText: 'ตกลง'
                    }).then(() => {
                        window.location.href = 'login.html'; // นำผู้ใช้กลับไปที่หน้า Login
                    });
                }
            });
        });
