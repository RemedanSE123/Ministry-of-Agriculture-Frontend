```text
ministry-agriculture-frontend/
├── public/
│   ├── icons/
│   ├── images/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── overview/
│   │   │   ├── projects/
│   │   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── collected-data/
│   │   │   ├── maps/
│   │   │   ├── charts/
│   │   │   ├── users/
│   │   │   ├── settings/
│   │   │   └── admin/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   ├── data/
│   │   │   └── users/
│   │   └── layout.tsx and page tsx 
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── sidebar/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── sidebar-item.tsx
│   │   │   │   └── projects-list.tsx
│   │   │   ├── header.tsx
│   │   │   └── layout-provider.tsx
│   │   ├── charts/
│   │   │   ├── chart-generator.tsx
│   │   │   ├── bar-chart.tsx
│   │   │   ├── line-chart.tsx
│   │   │   └── pie-chart.tsx
│   │   ├── maps/
│   │   │   ├── regional-map.tsx
│   │   │   ├── zone-map.tsx
│   │   │   └── woreda-map.tsx
│   │   ├── data/
│   │   │   ├── data-table.tsx
│   │   │   ├── data-sync.tsx
│   │   │   └── form-columns.tsx
│   │   ├── projects/
│   │   │   ├── project-card.tsx
│   │   │   └── project-form.tsx
│   │   └── auth/
│   │       ├── protected-route.tsx
│   │       └── role-guard.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── validations.ts
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-projects.ts
│   │   ├── use-data.ts
│   │   ├── use-sync.ts
│   │   └── use-charts.ts
│   ├── store/
│   │   ├── index.ts
│   │   ├── auth-store.ts
│   │   ├── project-store.ts
│   │   └── data-store.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── project.ts
│   │   ├── data.ts
│   │   └── user.ts
│   └── utils/
│       ├── formatters.ts
│       ├── validators.ts
│       └── helpers.ts
├── tailwind.config.js
├── next.config.js
└── package.json ministry-agriculture-backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── dataController.js
│   │   ├── userController.js
│   │   └── syncController.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── data.js
│   │   ├── users.js
│   │   └── sync.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── DataCollection.js
│   │   ├── ApiToken.js
│   │   └── SyncLog.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── role-check.js
│   │   ├── rate-limit.js
│   │   └── error-handler.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── projectService.js
│   │   ├── dataService.js
│   │   ├── syncService.js
│   │   ├── chartService.js
│   │   └── mapService.js
│   ├── utils/
│   │   ├── database.js
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   └── logger.js
│   ├── jobs/
│   │   ├── syncJobs.js
│   │   └── cleanupJobs.js
│   ├── config/
│   │   ├── database.js
│   │   ├── auth.js
│   │   └── environment.js
│   └── app.js
├── package.json
└── .env  my boss toled me to use this kind of foder structure for the project
```