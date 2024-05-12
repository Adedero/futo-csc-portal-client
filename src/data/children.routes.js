export const adminRoutes = [
    {
        path: '',
        component: () => import('../views/admin/DashboardView.vue')
    },
    {
        path: 'students',
        name: 'admin-students',
        component: () => import('../views/admin/StudentsView.vue'),
    },
    {
        path: 'student-profile/:id',
        name: 'student-profile',
        component: () => import('../views/admin/StudentProfileView.vue')
    },
    {
        path: 'student-course-registration-details/:studentId/:session',
        name: 'student-course-registration-details',
        component: () => import('../views/admin/StudentCourseRegDetailsView.vue')
    },
    {
        path: 'staff',
        name: 'admin-staff',
        component: () => import('../views/admin/StaffView.vue')
    },
    {
        path: 'staff-profile/:id',
        name: 'staff-profile',
        component: () => import('../views/admin/StaffProfileView.vue')
    },
    {
        path: 'result-ogr/:staffId/:session/:semester/:level/:course',
        name: 'admin-result-ogr',
        component: () => import('../views/admin/ResultOGRView.vue')
    },
    {
        path: 'advisors',
        name: 'admin-advisors',
        component: () => import('../views/admin/AdvisorsView.vue')
    },
    {
        path: 'hod-dean',
        name: 'hod-dean',
        component: () => import('../views/admin/HODDeanView.vue')
    },
    {
        path: 'classes',
        name: 'admin-classes',
        component: () => import('../views/admin/ClassesView.vue')
    },
    {
        path: 'class-profile/:id',
        name: 'class-profile',
        component: () => import('../views/admin/ClassProfileView.vue')
    },
    {
        path: 'courses',
        name: 'admin-courses',
        component: () => import('../views/admin/CoursesView.vue'),
    },
    {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('../views/admin/SettingsView.vue')
    },
    {
        path: 'account',
        name: 'admin-account',
        component: () => import('../views/admin/AdminAccountView.vue')
    }
]

export const HODRoutes = [
    {
        path: '',
        component: () => import('../views/hod/DashboardView.vue')
    },
    {
        path: 'hod-staff',
        name: 'hod-staff',
        component: () => import('../views/hod/StaffView.vue')
    },
    {
        path: 'hod-staff-profile/:id',
        name: 'hod-staff-profile',
        component: () => import('../views/hod/StaffProfileView.vue')
    },
    {
        path: 'hod-results',
        name: 'hod-results',
        component: () => import('../views/hod/ResultsView.vue')
    },
    {
        path: 'hod-result-ogr/:resultId',
        name: 'hod-result-ogr',
        component: () => import('../views/hod/ResultOGRView.vue')
    },
    {
        path: 'hod-course-allocation',
        name: 'hod-course-allocation',
        component: () => import('../views/hod/CourseAllocationView.vue')
    },
    {
        path: 'account',
        name: 'hod-account',
        component: () => import('../views/hod/HodAccountView.vue')
    }
]

export const deanRoutes = [
    {
        path: '',
        component: () => import('../views/dean/DashboardView.vue')
    },
    {
        path: 'dean-results',
        name: 'dean-results',
        component: () => import('../views/dean/ResultsView.vue')
    },
    {
        path: 'dean-result-ogr/:resultId',
        name: 'dean-result-ogr',
        component: () => import('../views/dean/ResultOGRView.vue')
    },
    {
        path: 'account',
        name: 'dean-account',
        component: () => import('../views/dean/DeanAccountView.vue')
    }
]

export const advisorRoutes = [
    {
        path: '',
        component: () => import('../views/advisor/DashboardView.vue')
    },
    {
        path: 'advisor-results',
        name: 'advisor-results',
        component: () => import('../views/advisor/ResultsView.vue')
    },
    {
        path: 'add-result/:staffId/:session/:semester/:level/:course/:scoped',
        name: 'advisor-add-result',
        component: () => import('../views/advisor/AddResultView.vue')
    },
    {
        path: 'result-ogr/:staffId/:session/:semester/:level/:course',
        name: 'advisor-result-ogr',
        component: () => import('../views/advisor/ResultOGRView.vue')
    },
    {
        path: 'edit-result/:resultId',
        name: 'advisor-edit-result',
        component: () => import('../views/advisor/EditResultView.vue')
    },
    {
        path: 'advisor-class',
        name: 'advisor-class',
        component: () => import('../views/advisor/ClassView.vue')
    },
    {
        path: 'class-result-ogr/:session/:semester/:level/:course',
        name: 'class-result-ogr',
        component: () => import('../views/advisor/ClassResultOGRView.vue')
    },
    {
        path: 'class-result-all-courses/:classId/:session/:semester/:level',
        name: 'class-result-all-courses',
        component: () => import('../views/advisor/AllCoursesResultView.vue')
    },
    {
        path: 'advisor-student/:id',
        name: 'advisor-student-profile',
        component: () => import('../views/advisor/StudentProfileView.vue')
    },
    {
        path: 'student-transcript/:studentId/',
        name: 'student-transcript',
        component: () => import('../views/advisor/StudentTranscriptView.vue')
    },
    {
        path: 'student-course-registration-details/:studentId/:session',
        name: 'advisor-student-course-registration-details',
        component: () => import('../views/advisor/StudentCourseRegDetailsView.vue')
    },
    {
        path: 'account',
        name: 'advisor-account',
        component: () => import('../views/advisor/AdvisorAccountView.vue')
    }
]

export const staffRoutes = [
    {
        path: '',
        component: () => import('../views/staff/DashboardView.vue')
    },
    {
        path: 'staff-results',
        name: 'staff-results',
        component: () => import('../views/staff/ResultsView.vue')
    },
    {
        path: 'add-result/:staffId/:session/:semester/:level/:course',
        name: 'staff-add-result',
        component: () => import('../views/staff/AddResultView.vue')
    },
    {
        path: 'edit-result/:resultId',
        name: 'staff-edit-result',
        component: () => import('../views/staff/EditResultView.vue')
    },
    {
        path: 'result-ogr/:staffId/:session/:semester/:level/:course',
        name: 'result-ogr',
        component: () => import('../views/staff/ResultOGRView.vue')
    },
    {
        path: 'account',
        name: 'staff-account',
        component: () => import('../views/staff/StaffAccountView.vue')
    }
]


export const studentRoutes = [
    {
        path: '',
        component: () => import('../views/student/DashboardView.vue')
    },
    {
        path: 'registered-courses',
        name: 'registered-courses',
        component: () => import('../views/student/RegisteredCoursesView.vue')
    },
    {
        path: 'course-registration/:sessionId/:semester/:level',
        name: 'course-registration',
        component: () => import('../views/student/CourseRegistrationView.vue')
    },
    {
        path: 'course-registration-details/:id',
        name: 'course-registration-details',
        component: () => import('../views/student/CourseRegDetailsView.vue')
    },
    {
        path: 'student-results',
        name: 'student-results',
        component: () => import('../views/student/StudentResultsView.vue')
    },
    {
        path: 'result-details/:id',
        name: 'student-result-details',
        component: () => import('../views/student/ResultDetailsView.vue')
    },
    {
        path: 'account',
        name: 'student-account',
        component: () => import('../views/student/StudentAccountView.vue')
    }
]