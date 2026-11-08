import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import onboardingRoutes from './routes/onboarding.js';
import adminRoutes from './routes/admin.js';
import ambassadorProgramRoutes from './routes/ambassador-program.js';
import careersRoutes from './routes/careers.js';
import dashboardRoutes from './routes/dashboard.js';
import intelRoutes from './routes/intel.js';
import practiceRoutes from './routes/practice.js';
import skillsRoutes from './routes/skills.js';
import driveRoutes from './routes/drive.js';
import squadRoutes from './routes/squad.js';
import interviewRoutes from './routes/interview.js';
import projectsRoutes from './routes/projects.js';
import syllabusRoutes from './routes/syllabus.js';
import launchpadRoutes from './routes/launchpad.js';
import notificationsRoutes from './routes/notifications.js';
// Home front page owns /home, /posts, /reports, /profile/avatar, /moderation
// under the /api prefix (see src/routes/home.js).
import homeRoutes from './routes/home.js';
import personalizeRoutes from './routes/personalize.js';
import opportunitiesRoutes from './routes/opportunities.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/onboarding', onboardingRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/ambassadors', ambassadorProgramRoutes);
  app.use('/api/careers', careersRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/intel', intelRoutes);
  app.use('/api/practice', practiceRoutes);
  app.use('/api/skills', skillsRoutes);
  app.use('/api/drive', driveRoutes);
  app.use('/api/squad', squadRoutes);
  app.use('/api/interview', interviewRoutes);
  app.use('/api/projects', projectsRoutes);
  app.use('/api/syllabus', syllabusRoutes);
  app.use('/api/launchpad', launchpadRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api', homeRoutes);
  app.use('/api/personalize', personalizeRoutes);
  app.use('/api/opportunities', opportunitiesRoutes);

  // Any /api path no route handled answers as JSON, never an HTML error page
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
  });

  return app;
}
