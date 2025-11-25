// Reference to database
const dataRef = database.ref('locations');

// บันทึกข้อมูลใหม่
async function saveData(data) {
    try {
        const newRef = dataRef.push();
        await newRef.set({
            ...data,
            createdAt: Date.now(),
            createdBy: auth.currentUser.email
        });
        console.log('Data saved successfully');
        return newRef.key;
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
}

// อัปโหลดรูปภาพ
async function uploadImages(files, locationId) {
    const imageUrls = [];
    
    for (let file of files) {
        try {
            const storageRef = storage.ref(`images/${locationId}/${file.name}`);
            await storageRef.put(file);
            const url = await storageRef.getDownloadURL();
            imageUrls.push(url);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }
    
    return imageUrls;
}

// ดึงข้อมูลทั้งหมด
function loadData(callback) {
    dataRef.on('value', (snapshot) => {
        const data = [];
        snapshot.forEach((childSnapshot) => {
            data.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        callback(data);
    });
}

// แก้ไขข้อมูล
async function updateData(id, data) {
    try {
        await dataRef.child(id).update({
            ...data,
            updatedAt: Date.now(),
            updatedBy: auth.currentUser.email
        });
        console.log('Data updated successfully');
    } catch (error) {
        console.error('Error updating data:', error);
        throw error;
    }
}

// ลบข้อมูล
async function deleteData(id) {
    try {
        await dataRef.child(id).remove();
        console.log('Data deleted successfully');
    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
}

// สร้างลิงก์ Google Maps
function createMapsLink(lat, lng) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
}

// สร้างลิงก์ Google Earth
function createEarthLink(lat, lng) {
    return `https://earth.google.com/web/@${lat},${lng},0a,1000d,35y,0h,0t,0r`;
}