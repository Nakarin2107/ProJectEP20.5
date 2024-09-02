const maxRequestsPerPage = 10; // กำหนดจำนวนคำขอที่จะแสดงในแต่ละหน้า
let currentPage = 1; // กำหนดหน้าปัจจุบันเป็นหน้าแรก

document.addEventListener('DOMContentLoaded', () => {
    // ดึงข้อมูลจาก Local Storage หรือฐานข้อมูลเมื่อหน้าโหลดเสร็จ
});

function generateStudentReport() {
    const studentId = document.getElementById('studentId').value;
    const requests = JSON.parse(localStorage.getItem('requests')) || [];

    // กรองคำขอตามรหัสนักศึกษาที่ค้นหา
    const filteredRequests = requests.filter(request => request.studentId === studentId);

    const reportContainer = document.getElementById('studentReportContainer');
    reportContainer.innerHTML = ''; // ล้างข้อมูลเก่าออกก่อน

    if (filteredRequests.length === 0) {
        // แสดงการแจ้งเตือนด้วย SweetAlert2
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบข้อมูลที่ตรงกับรหัสนักศึกษาที่เลือก',
            confirmButtonText: 'ตกลง'
        });
        return;
    }

    // คำนวณคำขอที่จะแสดงในหน้าปัจจุบัน
    const startIndex = (currentPage - 1) * maxRequestsPerPage;
    const endIndex = startIndex + maxRequestsPerPage;
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    // สร้างตารางแสดงรายงาน
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>วันที่ยืม</th>
        <th>วันที่คืน</th>
        <th>อุปกรณ์</th>
        <th>สถานะ</th>
    `;
    table.appendChild(headerRow);

    paginatedRequests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(request.dateTime)}</td>
            <td>${request.returnDateTime ? formatDate(request.returnDateTime) : '-'}</td>
            <td>${request.equipment}</td>
            <td>${request.status}</td>
        `;
        table.appendChild(row);
    });

    reportContainer.appendChild(table);

    // อัปเดตข้อมูลการแบ่งหน้า
    updatePaginationInfo(filteredRequests.length);
}

function updatePaginationInfo(totalRequests) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ''; // ล้าง Pagination เก่า

    const totalPageCount = Math.ceil(totalRequests / maxRequestsPerPage);
    const maxVisibleButtons = 10;

    // สร้างปุ่ม หน้าแรก
    const firstButton = document.createElement('button');
    firstButton.textContent = 'หน้าแรก';
    firstButton.className = 'btn btn-primary btn-sm mx-1';
    firstButton.disabled = currentPage === 1;
    firstButton.onclick = () => {
        currentPage = 1;
        generateStudentReport();
    };
    paginationContainer.appendChild(firstButton);

    // สร้างปุ่ม Previous พร้อมไอคอน
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.className = 'btn btn-secondary btn-sm mx-1';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            generateStudentReport();
        }
    };
    paginationContainer.appendChild(prevButton);

    // สร้างปุ่มหมายเลขเพจ
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = startPage + maxVisibleButtons - 1;

    if (endPage > totalPageCount) {
        endPage = totalPageCount;
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = 'btn btn-outline-primary btn-sm mx-1';
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.onclick = () => {
            currentPage = i;
            generateStudentReport();
        };
        paginationContainer.appendChild(pageButton);
    }

    // สร้างปุ่ม Next พร้อมไอคอน
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.className = 'btn btn-secondary btn-sm mx-1';
    nextButton.disabled = currentPage === totalPageCount;
    nextButton.onclick = () => {
        if (currentPage < totalPageCount) {
            currentPage++;
            generateStudentReport();
        }
    };
    paginationContainer.appendChild(nextButton);

    // สร้างปุ่ม หน้าสุดท้าย
    const lastButton = document.createElement('button');
    lastButton.textContent = 'หน้าสุดท้าย';
    lastButton.className = 'btn btn-primary btn-sm mx-1';
    lastButton.disabled = currentPage === totalPageCount;
    lastButton.onclick = () => {
        currentPage = totalPageCount;
        generateStudentReport();
    };
    paginationContainer.appendChild(lastButton);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    return `${day}-${month}-${year}`;
}
