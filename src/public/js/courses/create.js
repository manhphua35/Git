function getUserIdFromCookie() {
    const decodedCookie = decodeURIComponent(document.cookie);
    const startIndex = decodedCookie.indexOf('userId=j:"');
    if (startIndex !== -1) {
        
        const userIdStartIndex = startIndex + 'userId=j:"'.length;
        
        const userIdEndIndex = decodedCookie.indexOf('"', userIdStartIndex);
        
        const userId = decodedCookie.substring(userIdStartIndex, userIdEndIndex).replace(/"/g, '');
        return userId;
    }
    return null; 
}
const userId = getUserIdFromCookie();
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('expenseForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const action = document.getElementById('action').value;
    const prices = document.getElementById('prices').value;
    const note = document.getElementById('note').value;
    const time = document.getElementById('time').value;
    const queryParams = `userId=${userId}&action=${encodeURIComponent(action)}&prices=${prices}&note=${encodeURIComponent(note)}&time=${encodeURIComponent(time)}`;
    
    fetch('/courses/store', {
        method: 'POST',
        headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: queryParams
        })
        .then(response => response.json())
        
         .then(data => {
        
        if (data.success) {
            
            window.location.href = '/me/stored/courses';
        } else {
            
            console.error('Lỗi khi lưu dữ liệu.');
        }
    })
        });
    
});



