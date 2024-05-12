export function formatGPA(gpa) {
    return  +(Math.round(gpa + "e+2") + "e-2")
}

export function roundGPA(gpa) {
    return Math.round((gpa + Number.EPSILON) * 100) / 100;
}

export function getHonours(gpa) {
    if (gpa >= 4.5 && gpa <= 5.0) {
        return 'FIRST CLASS HONOURS'
    }

    if (gpa >= 3.5 && gpa <= 4.49) {
        return 'SECOND CLASS HONOURS (UPPER DIVISION)'
    }

    if (gpa >= 2.4 && gpa <= 3.49) {
        return 'SECOND CLASS HONOURS (LOWER DIVISION)'
    }

    if (gpa >= 1.5 && gpa <= 2.39) {
        return 'THIRD CLASS HONOURS'
    }

    if (gpa >= 1 && gpa <= 1.49) {
        return 'PASS'
    }

    return 'FAIL'
}