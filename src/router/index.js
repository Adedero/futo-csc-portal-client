import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { adminRoutes, HODRoutes, deanRoutes, advisorRoutes, staffRoutes, studentRoutes } from '@/data/children.routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LoginView
    },
    {
      path: '/password-recovery',
      component: () => import('../views/RecoverPasswordView.vue')
    },
    {
      path: '/password-reset/:userId/:token',
      name: 'password-reset',
      component: () => import('../views/ResetPasswordView.vue'),
      beforeEnter: (to, from, next) => {
          const { userId, token } = to.params;
          if (!userId || !token) {
            next('/');
            
          }
          const resetToken = sessionStorage.getItem('reset_token');
          if (!resetToken || resetToken !== token) {
            next('/');
            return;
          }
        next();
      }
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminMain.vue'),
      meta: {
        requiresAuth: true,
        role: 'ADMIN'
      },
      children: adminRoutes
    },
    {
      path: '/hod',
      component: () => import('../views/hod/HodMain.vue'),
      meta: {
        requiresAuth: true,
        role: 'HOD'
      },
      children: HODRoutes
    },
    {
      path: '/dean',
      component: () => import('../views/dean/DeanMain.vue'),
      meta: {
        requiresAuth: true,
        role: 'DEAN'
      },
      children: deanRoutes
    },
    {
      path: '/advisor',
      component: () => import('../views/advisor/AdvisorMain.vue'),
      meta: {
        requiresAuth: true,
        role: 'ADVISOR'
      },
      children: advisorRoutes
    },
    {
      path: '/staff',
      component: () => import('../views/staff/StaffMain.vue'),
      meta: {
        requiresAuth: true,
        role: 'STAFF'
      },
      children: staffRoutes
    },
    {
      path: '/student',
      component: () => import('../views/student/StudentMain.vue'),
      meta: {
        requiresAuth: true,
        role: 'STUDENT'
      },
      children: studentRoutes
    }
  ]
})


router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user) {
      next('/');
    } else {
      //In production, make an API call here to get the user details
      if (to.matched.some(record => record.meta.role && user.role === record.meta.role)) {
          next();
      } else {
        next('/');
      }
    }
  } else {
    next();
  }
})

/* function isSessionExpired() {
  const sessionId = document.cookie.replace(/(?:(?:^|.*;\s*)PHPSESSID\s*=\s*([^;]*).*$)|^.*$/, '$1');

  if (!sessionId) {
    return true;
  }

  const sessionLifetimeInSeconds = 60 * 60 * 1000; 

  // Check if the session has expired
  const currentTimeInSeconds = Math.floor(Date.now()); 
  const sessionExpireTimeInSeconds = parseInt(sessionId.substring(0, 10), 10) + sessionLifetimeInSeconds;

  return currentTimeInSeconds >= sessionExpireTimeInSeconds;
} */

export default router
