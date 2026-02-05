/**
 * Generate avatar URL from user name
 * @param {string} name - User's full name
 * @param {string} email - User's email (used for color consistency)
 * @param {number} size - Avatar size in pixels (default: 200)
 * @returns {string} Avatar URL
 */
function generateAvatarUrl(name, email = '', size = 200) {
    // Extract initials from name (first letter of first 2 words)
    const initials = name
        .trim()
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    
    // Color palette for avatars
    const colors = [
        '3B82F6', // Blue
        'EF4444', // Red
        '10B981', // Green
        'F59E0B', // Orange
        '8B5CF6', // Purple
        'EC4899', // Pink
        '06B6D4', // Cyan
        'F43F5E', // Rose
        '14B8A6', // Teal
        'F97316'  // Orange-Red
    ];
    
    // Generate consistent color based on email or name
    const seedString = email || name;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    const bgColor = colors[colorIndex];
    
    // Build UI Avatars API URL
    const params = new URLSearchParams({
        name: initials,
        background: bgColor,
        color: 'fff',
        size: size,
        bold: 'true',
        format: 'svg',
        rounded: 'false'
    });
    
    return `https://ui-avatars.com/api/?${params.toString()}`;
}

/**
 * Set avatar image on an HTML element
 * @param {HTMLElement} element - Target element (can be div or img)
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {number} size - Avatar size
 */
function setAvatar(element, name, email = '', size = 200) {
    if (!element) {
        console.error('Avatar element not found');
        return;
    }
    
    const avatarUrl = generateAvatarUrl(name, email, size);
    
    if (element.tagName === 'IMG') {
        // If element is an img tag
        element.src = avatarUrl;
        element.alt = `${name}'s avatar`;
    } else {
        // If element is a div or other container
        element.innerHTML = `
            <img src="${avatarUrl}" 
                 alt="${name}'s avatar" 
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
        `;
    }
}

/**
 * Get initials from name (useful for fallback displays)
 * @param {string} name - User's full name
 * @returns {string} Initials (max 2 characters)
 */
function getInitials(name) {
    return name
        .trim()
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}