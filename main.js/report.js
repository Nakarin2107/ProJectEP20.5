const maxRequestsPerPage = 10;
const totalPages = 1000; 
let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1; // กำหนดหน้าปัจจุบันจาก URL หรือเป็นหน้าแรก

// ดึงข้อมูลคำขอจาก Local Storage
function getRequests() {
    try {
        const requests = JSON.parse(localStorage.getItem('requests')) || [];
        return requests;
    } catch (error) {
        console.error('ไม่สามารถดึงข้อมูลคำขอจาก Local Storage ได้:', error);
        return [];
    }
}

// ฟังก์ชันสร้างรายงานตามเดือนและปีที่เลือก
function generateReport() {
    try {
        const selectedMonth = document.getElementById('monthSelect').value;
        const selectedYear = parseInt(document.getElementById('yearSelect').value, 10);
        if (!selectedMonth || isNaN(selectedYear)) {
            Swal.fire('กรุณาเลือกเดือนและปี');
            return;
        }

        const requests = getRequests();

        // กรองคำขอตามเดือนและปีที่เลือก
        const filteredRequests = requests.filter(request => {
            const requestDate = new Date(request.dateTime);
            return (
                requestDate.getFullYear() === selectedYear &&
                (selectedMonth === 'all' || requestDate.getMonth() + 1 === parseInt(selectedMonth, 10))
            );
        });

        // ตรวจสอบว่าพบข้อมูลหรือไม่
        if (filteredRequests.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'ไม่พบข้อมูล',
                text: 'ไม่พบข้อมูลที่ตรงกับเดือนและปีที่เลือก',
                confirmButtonText: 'ตกลง'
            });
        }

        displayReport(filteredRequests); // เรียกฟังก์ชันเพื่อแสดงตาราง ไม่ว่าจะพบข้อมูลหรือไม่
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างรายงาน:', error);
    }
}

// ฟังก์ชันแสดงข้อมูลในตารางรายงาน
function displayReport(requests) {
    const reportTableBody = document.querySelector('#reportTable tbody');
    reportTableBody.innerHTML = ''; // ล้างข้อมูลเก่าออกก่อน

    // ตรวจสอบว่าพบข้อมูลหรือไม่
    if (requests.length === 0) {
        // สร้างโครงสร้างตารางว่างเปล่า
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" style="text-align: center;">ไม่พบข้อมูล</td>`;
        reportTableBody.appendChild(emptyRow);
        return;
    }

    // คำนวณคำขอที่จะแสดงในหน้าปัจจุบัน
    const startIndex = (currentPage - 1) * maxRequestsPerPage;
    const endIndex = startIndex + maxRequestsPerPage;
    const paginatedRequests = requests.slice(startIndex, endIndex);

    paginatedRequests.forEach(request => {
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
        reportTableBody.appendChild(row);
    });

    updatePaginationInfo(requests.length);
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

// กำหนดค่าเดือนปัจจุบันเมื่อหน้าเว็บโหลด
document.addEventListener("DOMContentLoaded", function() {
    const currentDate = new Date();
    const monthSelect = document.getElementById('monthSelect');
    const yearInput = document.getElementById('yearSelect');

    // ตั้งค่าเดือนปัจจุบัน
    monthSelect.value = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    // ตั้งค่าปีปัจจุบัน
    yearInput.value = currentDate.getFullYear();
});

// เรียกฟังก์ชันเพื่อสร้างรายงานเมื่อหน้าโหลดเสร็จ
window.onload = generateReport;
