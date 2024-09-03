const maxRequestsPerPage = 10;
const totalPages = 1000; 
let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1; 

// ดึงข้อมูลคำขอจาก Local Storage
function getRequests() {
    try {
        return JSON.parse(localStorage.getItem('requests')) || [];
    } catch (error) {
        console.error('ไม่สามารถดึงข้อมูลคำขอจาก Local Storage ได้:', error);
        return [];
    }
}

// กำหนดค่าเริ่มต้นเมื่อหน้าเว็บโหลด
document.addEventListener("DOMContentLoaded", function() {
    const currentDate = new Date();
    const monthSelect = document.getElementById('monthSelect');
    const yearInput = document.getElementById('yearSelect');

    // ตั้งค่าเริ่มต้นของเดือนเป็น 'all' (เลือกทั้งหมด)
    monthSelect.value = 'all';
    // ตั้งค่าปีปัจจุบัน
    yearInput.value = currentDate.getFullYear();
});

// ฟังก์ชันสร้างรายงานตามเดือนและปีที่เลือก
function generateReport() {
    const selectedMonth = document.getElementById('monthSelect').value;
    const selectedYear = parseInt(document.getElementById('yearSelect').value, 10);

    if (!selectedMonth || isNaN(selectedYear)) {
        Swal.fire('กรุณาเลือกเดือนและปี');
        return;
    }

    const requests = filterRequestsByDate(getRequests(), selectedMonth, selectedYear);

    if (requests.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบข้อมูลที่ตรงกับเดือนและปีที่เลือก',
            confirmButtonText: 'ตกลง'
        });
    }

    displayReport(requests);
}

// ฟังก์ชันกรองคำขอตามเดือนและปีที่เลือก
function filterRequestsByDate(requests, month, year) {
    return requests.filter(request => {
        const requestDate = new Date(request.dateTime);
        return (
            requestDate.getFullYear() === year &&
            (month === 'all' || requestDate.getMonth() + 1 === parseInt(month, 10))
        );
    });
}


// ฟังก์ชันแสดงข้อมูลในตารางรายงาน
function displayReport(requests) {
    const reportTableBody = document.querySelector('#reportTable tbody');
    reportTableBody.innerHTML = '';

    if (requests.length === 0) {
        createEmptyRow(reportTableBody);
        return;
    }

    const paginatedRequests = paginateRequests(requests, currentPage, maxRequestsPerPage);
    paginatedRequests.forEach(request => createRow(reportTableBody, request));

    updatePaginationInfo(requests.length);
}

// ฟังก์ชันสำหรับสร้างแถวข้อมูลในตาราง
function createRow(tableBody, request) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${formatDate(request.dateTime)}</td>
        <td>${request.returnDateTime ? formatDate(request.returnDateTime) : '-'}</td>
        <td>${request.studentId}</td>
        <td>${request.studentName}</td>
        <td>${request.equipment}</td>
        <td>${request.staffName || '-'}</td>
        <td>${request.status}</td>
    `;
    tableBody.appendChild(row);
}

// ฟังก์ชันสำหรับสร้างแถวว่างในตาราง
function createEmptyRow(tableBody) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `<td colspan="7" style="text-align: center;">ไม่พบข้อมูล</td>`;
    tableBody.appendChild(emptyRow);
}

// ฟังก์ชันแบ่งหน้าคำขอ
function paginateRequests(requests, page, maxPerPage) {
    const startIndex = (page - 1) * maxPerPage;
    const endIndex = startIndex + maxPerPage;
    return requests.slice(startIndex, endIndex);
}



// ฟังก์ชันสำหรับฟอร์แมตวันที่ให้อยู่ในรูปแบบที่ต้องการ
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
        return `${day}-${month}-${year}`;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการฟอร์แมตวันที่:', error);
        return '-';
    }
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
        generateReport();
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
            generateReport();
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
            generateReport();
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
            generateReport();
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
        generateReport();
    };
    paginationContainer.appendChild(lastButton);
}

