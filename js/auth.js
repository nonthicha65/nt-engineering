// ตรวจสอบสถานะการ Login
auth.onAuthStateChanged((user) => {
    if (user) {
        // ถ้า Login แล้ว
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
        
        // แสดงชื่อผู้ใช้
        if (document.getElementById('userName')) {
            document.getElementById('userName').textContent = user.email;
        }
        
        console.log('User logged in:', user.email);
    } else {
        // ถ้ายังไม่ Login
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});

// ฟังก์ชัน Login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            console.log('Login successful');
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'เข้าสู่ระบบไม่สำเร็จ: ' + error.message;
            errorDiv.classList.add('show');
        }
    });
}

// ฟังก์ชัน Logout
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}