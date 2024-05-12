export function getNumberOfCourses(courses) {
    let rain = 0
    let har = 0
    for (let course of courses) {
        let code = course.code
        let courseEnding = parseInt(code[code.length - 1])

        if (courseEnding % 2 === 0 || courseEnding === 0) {
            rain += 1
        } else if(courseEnding % 2 !== 0) {
            har += 1
        }
    }

    return { rain, har }
}