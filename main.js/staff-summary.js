const maxRequestsPerPage = 10; // กำหนดจำนวนคำขอที่จะแสดงในแต่ละหน้า
let currentPage = 1; // กำหนดหน้าปัจจุบันเป็นหน้าแรก

document.addEventListener('DOMContentLoaded', () => {
    populateStaffSelect();
    setDefaultMonthAndYear(); // เรียกฟังก์ชันตั้งค่าเริ่มต้น
    generateStaffSummary(); // เรียกฟังก์ชันเพื่อแสดงข้อมูลครั้งแรก
});

function populateStaffSelect() {
    const staffSelect = document.getElementById('staffSelect');
    const requests = JSON.parse(localStorage.getItem('requests')) || [];

    const staffNames = [...new Set(requests.map(request => request.staffName))];
    staffNames.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff;
        option.textContent = staff;
        staffSelect.appendChild(option);
    });
}

function generateStaffSummary() {
    const selectedStaff = document.getElementById('staffSelect').value;
    const selectedMonth = document.getElementById('monthSelect').value;
    const selectedYear = document.getElementById('yearSelect').value;
    const requests = JSON.parse(localStorage.getItem('requests')) || [];

    const filteredRequests = requests.filter(request => {
        const requestDate = new Date(request.dateTime);
        const requestMonth = (requestDate.getMonth() + 1).toString().padStart(2, '0');
        const requestYear = requestDate.getFullYear().toString();

        // เช็คเงื่อนไขกรณีเลือก "ทั้งหมด" หรือเดือนที่เจาะจง
        return request.staffName === selectedStaff &&
               requestYear === selectedYear &&
               (selectedMonth === 'all' || requestMonth === selectedMonth);
    });

    displayPaginatedData(filteredRequests); // เรียกฟังก์ชันเสมอเพื่อแสดงตาราง แม้ไม่มีข้อมูล
    updatePaginationInfo(filteredRequests.length);
}

function displayPaginatedData(requests) {
    const summaryContainer = document.getElementById('staffSummaryContainer');
    summaryContainer.innerHTML = ''; // ล้างข้อมูลเก่าออกก่อน

    const table = document.createElement('table');
    table.className = 'table table-bordered';
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>วันที่ยืม</th>
        <th>วันที่คืน</th>
        <th>รหัสนักศึกษา</th>
        <th>ชื่อนักศึกษา</th>
        <th>อุปกรณ์</th>
        <th>สถานะ</th>
    `;
    table.appendChild(headerRow);

    if (requests.length === 0) {
        // แสดง SweetAlert2 เมื่อไม่พบข้อมูล
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบข้อมูลที่ตรงกับเจ้าหน้าที่และเดือนที่เลือก',
            confirmButtonText: 'ตกลง'
        });

        // แสดงข้อความว่าไม่มีข้อมูลในแถวเดียวของตาราง
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">ไม่พบข้อมูล</td>`;
        table.appendChild(emptyRow);
    } else {
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
                <td>${request.status}</td>
            `;
            table.appendChild(row);
        });
    }

    summaryContainer.appendChild(table);
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
        generateStaffSummary();
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
            generateStaffSummary();
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
            generateStaffSummary();
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
            generateStaffSummary();
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
        generateStaffSummary();
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
