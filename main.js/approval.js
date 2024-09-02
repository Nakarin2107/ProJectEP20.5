// กำหนดจำนวนคำขอสูงสุดต่อหน้า และจำนวนหน้าทั้งหมด
const maxRequestsPerPage = 8;
const totalPages = 1000; 
let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1; // กำหนดหน้าปัจจุบันจาก URL หรือเป็นหน้าแรก

// ฟังก์ชันสำหรับดึงข้อมูลคำขอจาก Local Storage
function getRequests() {
    try {
        return JSON.parse(localStorage.getItem('requests')) || [];
    } catch (error) {
        console.error('Error parsing requests from local storage:', error);
        return [];
    }
}


// ฟังก์ชันสำหรับบันทึกข้อมูลคำขอลงใน Local Storage
function setRequests(requests) {
    localStorage.setItem('requests', JSON.stringify(requests));
}

// ฟังก์ชันสำหรับฟอร์แมตวันที่ให้อยู่ในรูปแบบที่ต้องการ
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

// ฟังก์ชันสำหรับนับจำนวนครั้งที่นักศึกษายืมอุปกรณ์
function countBorrowedTimes(studentId) {
    return getRequests().filter(request => request.studentId === studentId).length;
}

// ฟังก์ชันคำนวณสถิติการยืมอุปกรณ์
function calculateEquipmentStatistics() {
    const requests = getRequests();

    // นับจำนวนอุปกรณ์ทั้งหมดตามประเภทที่ถูกยืมมา
    const equipmentCounts = requests.reduce((acc, request) => {
        if (request.equipment) {
            acc[request.equipment] = (acc[request.equipment] || 0) + 1;
        }
        return acc;
    }, {});

    // นับจำนวนรวมของคำขอทั้งหมด
    const totalRequestsCount = requests.length;

    return {
        equipmentCounts,
        totalRequestsCount
    };
}

// ฟังก์ชันแสดงสถิติ
function displayEquipmentStatistics() {
    const statsContainer = document.getElementById('equipmentStatistics');
    const totalBorrowingsElement = document.getElementById('totalBorrowings');
    
    const { equipmentCounts, totalRequestsCount } = calculateEquipmentStatistics(); // นำค่า totalRequestsCount มาใช้งาน
    
    // อัปเดตจำนวนการยืมทั้งหมด
    totalBorrowingsElement.innerText = `ทั้งหมด: ${totalRequestsCount} รายการ`;
    
    // ลบข้อมูลเก่าที่แสดง
    statsContainer.innerHTML = '';

    // แสดงจำนวนการยืมแยกตามอุปกรณ์ที่ได้รับการอนุมัติ
    for (const [equipment, count] of Object.entries(equipmentCounts)) {
        const equipmentStat = document.createElement('p');
        equipmentStat.innerText = `${equipment}: ${count} รายการ`;
        statsContainer.appendChild(equipmentStat);
    }
}


// ฟังก์ชันโหลดคำขอในแต่ละหน้า
function loadRequests(page) {
    const requestsTable = document.getElementById('requestsTable');
    const requests = getRequests();

    // ลบแถวก่อนหน้า ยกเว้นส่วนหัว
    requestsTable.querySelectorAll('tr:not(:first-child)').forEach(row => row.remove());

    // คำนวณจุดเริ่มต้นและสิ้นสุดสำหรับการแบ่งหน้า
    const start = (page - 1) * maxRequestsPerPage;
    const end = start + maxRequestsPerPage;
    const paginatedRequests = requests.slice(start, end);
    

    // แสดงคำขอที่แบ่งหน้ามาในตาราง
    paginatedRequests.forEach(request => {
        const row = requestsTable.insertRow();
        row.className = request.status === 'อนุมัติ' ? 'table-custom-approved' :
                        request.status === 'ยกเลิก' ? 'table-custom-denied' :
                        request.status === 'คืนแล้ว' ? 'table-custom-returned' : '';

        // แสดงข้อมูลในแต่ละคอลัมน์ของตาราง
        row.insertCell(0).innerText = formatDate(request.dateTime);
        row.insertCell(1).innerText = request.returnDateTime ? formatDate(request.returnDateTime) : '-'; 
        row.insertCell(2).innerText = request.studentId;
        row.insertCell(3).innerText = request.studentName;
        row.insertCell(4).innerText = request.equipment;
        row.insertCell(5).innerText = request.staffName || '-';
        row.insertCell(6).innerText = request.status;

        const actionCell = row.insertCell(7);
        actionCell.innerHTML = ''; // ลบเนื้อหาภายในของเซลล์การดำเนินการก่อนที่จะเพิ่มเนื้อหาใหม่

        // แสดงปุ่มหรือเครื่องหมายตามสถานะที่กำหนด
        if (request.status === 'รออนุมัติ') {
            // สถานะรออนุมัติ: แสดงทั้งปุ่มอนุมัติและยกเลิก
            const approveButton = createButton('อนุมัติ', 'btn btn-success btn-sm mr-2', () => updateRequestStatus(request.id, 'อนุมัติ'));
            const denyButton = createButton('ยกเลิก', 'btn btn-danger btn-sm', () => updateRequestStatus(request.id, 'ยกเลิก'));
            actionCell.appendChild(approveButton);
            actionCell.appendChild(denyButton);
        } else if (request.status === 'อนุมัติ') {
            // สถานะอนุมัติ: แสดงไอคอนเครื่องหมายถูกและกากะบาท
            actionCell.innerHTML = '<i class="fas fa-circle-check" style="color: green; font-size: 20px;"></i> <i class="fas fa-circle-xmark" style="color: red; font-size: 20px;"></i>';
        } else if (request.status === 'ยกเลิก') {
            // สถานะยกเลิก: แสดงไอคอนเครื่องหมายกากะบาททั้งคู่
            actionCell.innerHTML = '<i class="fas fa-circle-xmark" style="color: red; font-size: 20px;"></i> <i class="fas fa-circle-xmark" style="color: red; font-size: 20px;"></i>';
        } else if (request.status === 'คืนแล้ว') {
            // สถานะคืนแล้ว: แสดงไอคอนเครื่องหมายถูกทั้งคู่
            actionCell.innerHTML = '<i class="fas fa-circle-check" style="color: green; font-size: 20px;"></i> <i class="fas fa-circle-check" style="color: green; font-size: 20px;"></i>';
        }
    });

    // อัปเดตปุ่ม Pagination
    updatePaginationInfo(page, totalPages);
    displayEquipmentStatistics();
}

// ฟังก์ชันสำหรับสร้างปุ่ม
function createButton(textOrHTML, className, onClick) {
    const button = document.createElement('button');
    button.innerHTML = textOrHTML; 
    button.className = className;
    button.onclick = onClick;
    return button;
}


function updatePaginationInfo(page, totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    // ปุ่มหน้าแรก
    const firstButton = createButton('หน้าแรก', 'btn btn-primary btn-sm', () => goToPage(1));
    firstButton.disabled = page <= 1;
    paginationContainer.appendChild(firstButton);

    // ปุ่มก่อนหน้า
    const prevButton = createButton('<i class="fas fa-chevron-left"></i>', 'btn btn-secondary btn-sm mx-1', () => goToPage(page - 1));
    prevButton.disabled = page <= 1;
    paginationContainer.appendChild(prevButton);

    // ปุ่มหมายเลขหน้า
    const [startPage, endPage] = calculatePageRange(page, totalPages, 5);
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createButton(i, 'btn btn-outline-primary btn-sm mx-1', () => goToPage(i));
        if (i === page) pageButton.classList.add('active');
        paginationContainer.appendChild(pageButton);
    }

    // ปุ่มถัดไป
    const nextButton = createButton('<i class="fas fa-chevron-right"></i>', 'btn btn-secondary btn-sm mx-1', () => goToPage(page + 1));
    nextButton.disabled = page >= totalPages;
    paginationContainer.appendChild(nextButton);

    // ปุ่มหน้าสุดท้าย
    const lastButton = createButton('หน้าสุดท้าย', 'btn btn-primary btn-sm', () => goToPage(totalPages));
    lastButton.disabled = page >= totalPages;
    paginationContainer.appendChild(lastButton);
}



// ฟังก์ชันเปลี่ยนหน้าไปยังหน้าที่ระบุ
function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        loadRequests(currentPage);
    }
}



// ฟังก์ชันคำนวณขอบเขตของหมายเลขหน้าที่แสดงใน Pagination
function calculatePageRange(page, totalPages, maxButtons) {
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    return [startPage, endPage];
}

// ฟังก์ชันอัปเดตสถานะของคำขอ
// ฟังก์ชันอัปเดตสถานะของคำขอ
function updateRequestStatus(id, status) {
    let requests = getRequests();
    let updatedRequest;

    // อัปเดตสถานะในคำขอที่มี ID ตรงกัน
    requests = requests.map(request => {
        if (request.id === id) {
            updatedRequest = { 
                ...request, 
                status,
                returnDateTime: status === 'คืนแล้ว' ? new Date().toISOString() : request.returnDateTime // อัปเดตวันที่คืนถ้าสถานะเป็น 'คืนแล้ว'
            };
            return updatedRequest;
        }
        return request;
    });

    setRequests(requests);

    if (status === 'อนุมัติ') {
        sendApprovalRequest(updatedRequest); // ส่งข้อมูลไปยัง Google Sheets หากอนุมัติ
    } else {
        showAlert('warning', 'คำขอถูกยกเลิก', 'คำขอนี้ถูกยกเลิกแล้ว');
    }

    loadRequests(currentPage);
}

// ฟังก์ชันส่งคำขอที่อนุมัติไปยัง Google Sheets
function sendApprovalRequest(updatedRequest) {
    Swal.fire({
        title: 'กำลังส่งคำขอ...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
    });

    fetch('https://script.google.com/macros/s/AKfycbwzvhkpu2W4MIxA9Xj3f9qkcpZOKLwylozAwlQeWdR4HQVSwTuaDvXU1kesPO4lxL7vVg/exec', {
        method: 'POST',
        body: new URLSearchParams({
            dateTime: updatedRequest.dateTime,
            studentId: updatedRequest.studentId,
            studentName: updatedRequest.studentName,
            equipment: updatedRequest.equipment,
            staffName: updatedRequest.staffName,
            returnDateTime: updatedRequest.returnDateTime // เพิ่มข้อมูลวันที่คืน
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
        .then(response => response.text())
        .then(() => showAlert('success', 'สำเร็จ!', 'คำขอถูกอนุมัติแล้ว'))
        .catch(error => {
            console.error('Error sending data to Google Sheets:', error);
            showAlert('error', 'เกิดข้อผิดพลาด', 'การส่งข้อมูลไปยัง Google Sheets ล้มเหลว');
        })
        .finally(displayEquipmentStatistics);
}


// ฟังก์ชันแสดงข้อความแจ้งเตือนโดยใช้ SweetAlert2
function showAlert(icon, title, text) {
    Swal.fire({
        icon,
        title,
        text,
        confirmButtonText: 'ตกลง',
    });
}

// ฟังก์ชันลบคำขอที่ระบุ
function deleteRequest(id) {
    Swal.fire({
        title: 'คุณแน่ใจหรือว่าต้องการลบคำขอนี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก',
    }).then(result => {
        if (result.isConfirmed) {
            let requests = getRequests().filter(request => request.id !== id);
            setRequests(requests);
            loadRequests(currentPage);
            showAlert('success', 'ลบสำเร็จ!', 'คำขอถูกลบแล้ว');
        }
    });
}

// ฟังก์ชันลบคำขอทั้งหมดในหน้าปัจจุบัน
function deleteAllRequests() {
    Swal.fire({
        title: 'คุณแน่ใจหรือว่าต้องการลบคำขอทั้งหมดในหน้านี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก',
    }).then(result => {
        if (result.isConfirmed) {
            let requests = getRequests();
            const start = (currentPage - 1) * maxRequestsPerPage;
            const end = start + maxRequestsPerPage;

            // กรองคำขอที่ไม่อยู่ในหน้านี้ออก
            requests = requests.filter((_, index) => index < start || index >= end);
            setRequests(requests);
            loadRequests(currentPage);
            showAlert('success', 'ลบสำเร็จ!', 'คำขอทั้งหมดในหน้านี้ถูกลบแล้ว');
        }
    });
}

// เรียกใช้ฟังก์ชันเมื่อเริ่มต้น
window.onload = () => {
    loadRequests(currentPage);
};
