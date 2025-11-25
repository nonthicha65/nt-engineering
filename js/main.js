// รอให้ DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    if (!document.getElementById('dataForm')) return;
    
    // ฟอร์มเพิ่มข้อมูล
    document.getElementById('dataForm').addEventListener('submit', handleFormSubmit);
    
    // อัปโหลด Excel
    document.getElementById('excelFile').addEventListener('change', handleExcelImport);
    
    // ส่งออก Excel
    document.getElementById('exportExcel').addEventListener('click', exportToExcel);
    
    // ค้นหา
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // ฟอร์มแก้ไข
    document.getElementById('editForm').addEventListener('submit', handleEditSubmit);
    
    // โหลดข้อมูล
    loadData(displayData);
}

// จัดการการส่งฟอร์ม
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const locationName = document.getElementById('locationName').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const description = document.getElementById('description').value;
    const imageFiles = document.getElementById('imageFile').files;
    
    try {
        // บันทึกข้อมูล
        const locationId = await saveData({
            locationName,
            latitude,
            longitude,
            description
        });
        
        // อัปโหลดรูปภาพ
        if (imageFiles.length > 0) {
            const imageUrls = await uploadImages(imageFiles, locationId);
            await updateData(locationId, { images: imageUrls });
        }
        
        alert('✅ บันทึกข้อมูลสำเร็จ!');
        e.target.reset();
        document.getElementById('imagePreview').innerHTML = '';
    } catch (error) {
        alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    }
}

// แสดงข้อมูลในตาราง
function displayData(data) {
    const tbody = document.getElementById('dataTableBody');
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">ไม่มีข้อมูล</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.locationName}</td>
            <td>${item.latitude}, ${item.longitude}</td>
            <td>${item.description || '-'}</td>
            <td>
                ${item.images ? item.images.map(url => 
                    `<img src="${url}" class="image-thumbnail" onclick="window.open('${url}', '_blank')">`
                ).join('') : '-'}
            </td>
            <td>
                <a href="${createMapsLink(item.latitude, item.longitude)}" target="_blank" class="btn btn-success">
                    🗺️ Maps
                </a>
                <a href="${createEarthLink(item.latitude, item.longitude)}" target="_blank" class="btn btn-success">
                    🌍 Earth
                </a>
            </td>
            <td class="action-buttons">
                <button class="btn btn-primary" onclick="editItem('${item.id}')">✏️</button>
                <button class="btn btn-danger" onclick="deleteItem('${item.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// แก้ไขข้อมูล
function editItem(id) {
    dataRef.child(id).once('value', (snapshot) => {
        const data = snapshot.val();
        document.getElementById('editId').value = id;
        document.getElementById('editLocationName').value = data.locationName;
        document.getElementById('editLatitude').value = data.latitude;
        document.getElementById('editLongitude').value = data.longitude;
        document.getElementById('editDescription').value = data.description || '';
        
        document.getElementById('editModal').style.display = 'block';
    });
}

// ปิด Modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// ปิด Modal เมื่อคลิกนอก Modal
window.onclick = (e) => {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeEditModal();
    }
};

// จัดการการแก้ไข
async function handleEditSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const data = {
        locationName: document.getElementById('editLocationName').value,
        latitude: document.getElementById('editLatitude').value,
        longitude: document.getElementById('editLongitude').value,
        description: document.getElementById('editDescription').value
    };
    
    try {
        await updateData(id, data);
        alert('✅ แก้ไขข้อมูลสำเร็จ!');
        closeEditModal();
    } catch (error) {
        alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    }
}

// ลบข้อมูล
async function deleteItem(id) {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?')) {
        try {
            await deleteData(id);
            alert('✅ ลบข้อมูลสำเร็จ!');
        } catch (error) {
            alert('❌ เกิดข้อผิดพลาด: ' + error.message);
        }
    }
}

// ค้นหาข้อมูล
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#dataTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// นำเข้า Excel
async function handleExcelImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            for (let row of jsonData) {
                await saveData({
                    locationName: row['ชื่อสถานที่'] || row['locationName'],
                    latitude: row['Latitude'] || row['latitude'],
                    longitude: row['Longitude'] || row['longitude'],
                    description: row['รายละเอียด'] || row['description'] || ''
                });
            }
            
            alert(`✅ นำเข้าข้อมูล ${jsonData.length} รายการสำเร็จ!`);
        } catch (error) {
            alert('❌ เกิดข้อผิดพลาด: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

// ส่งออก Excel
function exportToExcel() {
    dataRef.once('value', (snapshot) => {
        const data = [];
        snapshot.forEach((child) => {
            const item = child.val();
            data.push({
                'ชื่อสถานที่': item.locationName,
                'Latitude': item.latitude,
                'Longitude': item.longitude,
                'รายละเอียด': item.description || '',
                'ลิงก์ Maps': createMapsLink(item.latitude, item.longitude)
            });
        });
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ข้อมูล');
        XLSX.writeFile(workbook, `ข้อมูลกองช่าง_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
}