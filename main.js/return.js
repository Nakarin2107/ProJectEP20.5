document.getElementById('returnForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const studentId = document.getElementById('studentId').value;
    loadBorrowedItems(studentId);
});

function formatThaiDate(dateTime) {
    const date = new Date(dateTime);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    return `${formattedDate} ${formattedTime}`;
}

function loadBorrowedItems(studentId) {
    const borrowedItemsDiv = document.getElementById('borrowedItems');
    const borrowedItemsBox = document.getElementById('borrowedItemsBox');
    const returnButton = document.getElementById('returnButton');

    // ล้างเนื้อหาก่อนหน้า
    borrowedItemsDiv.innerHTML = '';
    returnButton.style.display = 'none';
    borrowedItemsBox.style.display = 'none'; // ซ่อนกล่องรายการยืมตอนเริ่มต้น

    let requests = JSON.parse(localStorage.getItem('requests')) || [];
    const borrowedItems = requests.filter(request => request.studentId === studentId && request.type === 'ยืม' && request.status === 'อนุมัติ');

    if (borrowedItems.length > 0) {
        // เพิ่มข้อความ "รายการอุปกรณ์ที่ยืม"
        const heading = document.createElement('h2');
        heading.innerText = 'รายการอุปกรณ์ที่ยืม';
        borrowedItemsDiv.appendChild(heading);

        borrowedItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card mb-3';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = item.id;
            checkbox.className = 'form-check-input';

            const cardText = document.createElement('span');
            cardText.className = 'card-text';
            cardText.innerHTML = `<strong>${item.equipment}</strong> - ยืมเมื่อ ${formatThaiDate(item.dateTime)}`;

            cardBody.appendChild(checkbox);
            cardBody.appendChild(cardText);
            card.appendChild(cardBody);
            borrowedItemsDiv.appendChild(card);
        });

        borrowedItemsBox.style.display = 'block'; // แสดงกล่องรายการยืม
        returnButton.style.display = 'block'; // แสดงปุ่มคืนอุปกรณ์
    } else {
        borrowedItemsDiv.innerHTML = '<p class="text-muted">ไม่พบรายการอุปกรณ์ที่ยืม</p>';
        borrowedItemsBox.style.display = 'block'; // แสดงกล่องแม้ว่าจะไม่พบรายการ
    }
}


document.getElementById('returnButton').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('#borrowedItems input[type="checkbox"]:checked');
    let requests = JSON.parse(localStorage.getItem('requests')) || [];
    const now = new Date();
    const returnDateTime = now.toISOString();

    if (checkboxes.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบอุปกรณ์ที่เลือก',
            text: 'กรุณาเลือกอุปกรณ์ที่ต้องการคืน',
            confirmButtonText: 'ตกลง'
        });
        return;
    }

    checkboxes.forEach(checkbox => {
        requests = requests.map(request => {
            if (request.id == checkbox.value) {
                return { ...request, status: 'คืนแล้ว', returnDateTime };
            }
            return request;
        });
    });

    localStorage.setItem('requests', JSON.stringify(requests));

    Swal.fire({
        icon: 'success',
        title: 'คืนอุปกรณ์สำเร็จ',
        text: 'อุปกรณ์ที่เลือกถูกคืนแล้ว',
        confirmButtonText: 'ตกลง'
    }).then(() => {
        const studentId = document.getElementById('studentId').value;
        loadBorrowedItems(studentId);
    });
});
