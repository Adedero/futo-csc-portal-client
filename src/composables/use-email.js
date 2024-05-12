export function maskEmail(email) {
    // Check if the email is valid
    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return 'Invalid email';
    }

    // Split the email into username and domain parts
    const [username, domain] = email.split('@');

    // Calculate the length of the username and domain parts
    const usernameLength = Math.ceil(username.length / 3);

    // Replace the middle characters of the username and domain with asterisks
    const maskedUsername = username.substring(0, Math.floor(username.length / 3)) + '*'.repeat(username.length - usernameLength);

    // Concatenate the masked username and domain with '@' symbol
    return maskedUsername + '@' + domain;
}

export function validateEmail(email) {
    //const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return re.test(String(email).toLowerCase());
}