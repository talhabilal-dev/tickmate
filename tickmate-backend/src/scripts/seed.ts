import db from "../config/db.config.js";
import { usersTable, ticketsTable } from "../models/model.js";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import { upsertResolvedPublicTicketVector } from "../utils/vector-db.utils.js";

const SAMPLE_TICKETS = [
  {
    title: "Login page not loading",
    description: "When I try to access the login page, I get a white screen. The page loads for about 5 seconds and then shows nothing. I've tried clearing my browser cache and using incognito mode, but the issue persists. This is blocking me from accessing my account.",
    category: "Bug",
    priority: "high" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "This was caused by a CORS configuration issue. The authentication endpoint was not allowing requests from the frontend origin. Fixed by updating the CORS_ORIGINS environment variable to include the frontend URL.",
    relatedSkills: ["React", "CORS", "Authentication"],
  },
  {
    title: "Cannot reset password",
    description: "I clicked on 'Forgot Password' and entered my email, but I never received the reset link. I checked my spam folder and it's not there either. I need to access my account urgently for a project deadline.",
    category: "Bug",
    priority: "high" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Email delivery was failing due to incorrect RESEND_API_KEY. After updating the API key and verifying the sender domain, password reset emails started working. Also added better error messaging for users.",
    relatedSkills: ["Email", "Resend", "Authentication"],
  },
  {
    title: "Add dark mode to dashboard",
    description: "It would be great to have a dark mode option for the dashboard. I work late hours and the bright white background is hard on my eyes. Many modern apps have this feature and I think it would improve the user experience significantly.",
    category: "Feature Request",
    priority: "medium" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Implemented using next-themes package. Added theme toggle in the header with smooth transitions. Used CSS variables for colors to make theme switching efficient. All components now support both light and dark modes.",
    relatedSkills: ["CSS", "React", "Next.js", "UI/UX"],
  },
  {
    title: "Slow database queries on tickets page",
    description: "The tickets page takes 10-15 seconds to load when there are more than 100 tickets. This is way too slow and affecting productivity. The page seems to hang while loading and sometimes times out completely.",
    category: "Performance",
    priority: "high" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Added database indexes on frequently queried columns (status, createdBy, assignedTo, createdAt). Also implemented pagination to load only 20 tickets at a time. Query time reduced from 15s to 200ms.",
    relatedSkills: ["PostgreSQL", "Database Optimization", "Performance"],
  },
  {
    title: "Export tickets to CSV",
    description: "I need to be able to export all my tickets to a CSV file for reporting purposes. This would help me analyze trends and share data with stakeholders who don't have access to the system.",
    category: "Feature Request",
    priority: "medium" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Added CSV export functionality using Papa Parse library. Users can now export their tickets with all fields including status, priority, timestamps, and replies. Also added filtering options before export.",
    relatedSkills: ["TypeScript", "CSV", "Data Export"],
  },
  {
    title: "How to assign tickets to specific users?",
    description: "I'm new to the system and I can't figure out how to assign a ticket to a specific team member. Is this feature available? If so, where can I find it in the interface?",
    category: "Question",
    priority: "low" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Assignment feature is available in the admin dashboard. Navigate to Admin > Tickets > Click on a ticket > Select assignee from dropdown. The system also auto-assigns tickets to moderators based on their skills.",
    relatedSkills: ["User Support", "Documentation"],
  },
  {
    title: "Mobile app crashing on startup",
    description: "The mobile app crashes immediately after opening. I see the splash screen for a second and then it closes. I'm using an iPhone 12 with iOS 16.5. This started happening after the last update.",
    category: "Bug",
    priority: "high" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Crash was caused by a null pointer exception in the authentication flow. The app was trying to access user data before initialization was complete. Fixed by adding proper null checks and loading states.",
    relatedSkills: ["React Native", "Mobile", "Debugging"],
  },
  {
    title: "Add two-factor authentication",
    description: "For security reasons, I would like to enable two-factor authentication on my account. This is especially important since we handle sensitive customer data. Is this feature on the roadmap?",
    category: "Feature Request",
    priority: "high" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Implemented 2FA using TOTP (Time-based One-Time Password). Users can enable it in their profile settings. Supports any authenticator app like Google Authenticator or Authy. Recovery codes are also generated for backup access.",
    relatedSkills: ["Security", "Authentication", "TOTP"],
  },
  {
    title: "Dashboard shows incorrect ticket count",
    description: "My dashboard shows 45 tickets, but when I go to the tickets page, I only see 32. The numbers don't match and I'm not sure which one is correct. This is confusing for tracking our team's workload.",
    category: "Bug",
    priority: "medium" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Dashboard was counting soft-deleted tickets. Updated the query to filter out tickets where deletedAt is not null. Both dashboard and tickets page now show consistent numbers.",
    relatedSkills: ["SQL", "PostgreSQL", "Dashboard"],
  },
  {
    title: "Add bulk ticket operations",
    description: "It would be very useful to be able to select multiple tickets and perform bulk actions like changing status, assigning to a user, or adding tags. Right now I have to do this one by one which is time-consuming.",
    category: "Feature Request",
    priority: "medium" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Implemented bulk operations UI with checkboxes for ticket selection. Users can now bulk update status, priority, or assignee. Added confirmation dialog to prevent accidental bulk changes. Maximum 50 tickets per bulk operation.",
    relatedSkills: ["React", "UI/UX", "Bulk Operations"],
  },
  {
    title: "API returns 500 error when creating ticket",
    description: "When I try to create a ticket via the API, I get a 500 Internal Server Error. The request body is valid JSON and includes all required fields. This is blocking our integration with the external ticketing system.",
    category: "Bug",
    priority: "high" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Error was caused by Zod validation failing silently on the 'deadline' field. The date string format wasn't being parsed correctly. Fixed by using coerce.date() in the schema and adding better error messages for validation failures.",
    relatedSkills: ["Express", "API", "Zod", "Validation"],
  },
  {
    title: "Notifications not working on Firefox",
    description: "I don't receive any browser notifications when new tickets are assigned to me, but only on Firefox. It works fine on Chrome. I've checked my browser permissions and notifications are allowed.",
    category: "Bug",
    priority: "medium" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Firefox has stricter requirements for the Notification API. Added proper permission request flow and fallback for when notifications are blocked. Also improved error handling for notification failures across all browsers.",
    relatedSkills: ["JavaScript", "Browser API", "Notifications"],
  },
  {
    title: "Add search functionality to tickets",
    description: "It's difficult to find specific tickets when we have hundreds in the system. A search bar that can filter by title, description, or category would be extremely helpful for our team's workflow.",
    category: "Feature Request",
    priority: "high" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Implemented full-text search using PostgreSQL's built-in search capabilities. Search queries now match against title, description, and category. Also added filters for status, priority, and date range. Results are highlighted for better visibility.",
    relatedSkills: ["PostgreSQL", "Full-Text Search", "React"],
  },
  {
    title: "File upload fails for PDFs larger than 5MB",
    description: "When I try to attach a PDF file to a ticket, it fails if the file is larger than 5MB. I get an error message saying 'Upload failed'. We often need to attach documentation that's larger than this limit.",
    category: "Bug",
    priority: "medium" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Express body-parser was limiting request size to 5MB by default. Increased limit to 50MB and added proper error messages for file size validation. Also implemented chunked upload for files larger than 10MB to improve reliability.",
    relatedSkills: ["Express", "File Upload", "Node.js"],
  },
  {
    title: "Add email notifications for ticket updates",
    description: "I would like to receive email notifications when someone replies to my ticket or when the status changes. Currently, I have to keep checking the dashboard to see if there are any updates.",
    category: "Feature Request",
    priority: "high" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Implemented email notifications using Resend API and Inngest for async processing. Users can customize notification preferences in their profile. Emails are batched to avoid spam (max 1 email per hour per ticket).",
    relatedSkills: ["Resend", "Email", "Inngest", "Async Jobs"],
  },
  {
    title: "Tickets page layout breaks on mobile",
    description: "The tickets page doesn't display properly on mobile devices. The table is too wide and I have to scroll horizontally to see all columns. Some buttons are also too small to tap accurately.",
    category: "Bug",
    priority: "medium" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Redesigned tickets page with responsive card layout for mobile devices. Added bottom sheet for actions on mobile. Tested on various screen sizes using Chrome DevTools and real devices. Now fully responsive from 320px to 4K.",
    relatedSkills: ["CSS", "Responsive Design", "Mobile", "Tailwind CSS"],
  },
  {
    title: "Add webhook support for integrations",
    description: "We want to integrate this system with Slack and Discord. It would be great to have webhook support so we can send notifications to our team channels when tickets are created or updated.",
    category: "Feature Request",
    priority: "medium" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Implemented webhook system with configurable endpoints in admin settings. Supports POST requests with customizable payload format. Added retry logic for failed webhook deliveries. Tested with Slack, Discord, and custom webhook receivers.",
    relatedSkills: ["Webhooks", "Integrations", "API", "Async Jobs"],
  },
  {
    title: "User profile picture not displaying",
    description: "After uploading a profile picture, it doesn't show up anywhere in the app. The upload seems to succeed (no error message), but my old picture or default avatar is still visible everywhere.",
    category: "Bug",
    priority: "low" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Profile pictures were being uploaded to Cloudinary but the URL wasn't being saved to the database. Fixed by updating the user record with the image URL after successful upload. Also added cache-busting query parameter to force image refresh.",
    relatedSkills: ["Cloudinary", "File Upload", "Database"],
  },
  {
    title: "Add keyboard shortcuts for common actions",
    description: "Power users would benefit from keyboard shortcuts for creating tickets, searching, and navigating between views. This would significantly speed up our workflow and reduce reliance on the mouse.",
    category: "Feature Request",
    priority: "low" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Implemented keyboard shortcuts using a custom hook. Common shortcuts: 'C' for create ticket, '/' for search, 'G D' for dashboard, 'G T' for tickets. Added shortcuts help modal (press '?'). Shortcuts are context-aware and don't interfere with form inputs.",
    relatedSkills: ["React", "UI/UX", "Keyboard Navigation"],
  },
  {
    title: "Session timeout too aggressive",
    description: "I keep getting logged out every 30 minutes even when I'm actively using the app. This is disruptive to my workflow and I have to log in multiple times per day. Can the session duration be increased?",
    category: "Question",
    priority: "medium" as const,
    status: "completed" as const,
    isPublic: true,
    helpfulNotes: "Session timeout was set to 30 minutes for security. Increased to 8 hours and implemented automatic token refresh when user is active. Added 'Remember me' option for 30-day sessions. Users now receive a warning 5 minutes before session expires.",
    relatedSkills: ["Authentication", "JWT", "Session Management"],
  },
  // Pending tickets (not completed yet)
  {
    title: "Add advanced filtering options",
    description: "The current filters are basic. We need more advanced options like filtering by date range, multiple assignees, custom fields, and saved filter presets. This would help us manage large numbers of tickets more efficiently.",
    category: "Feature Request",
    priority: "high" as const,
    status: "in_progress" as const,
    isPublic: true,
    helpfulNotes: "Working on implementing advanced filters with a filter builder UI. Estimated completion: 2 weeks.",
    relatedSkills: ["React", "UI/UX", "Database"],
  },
  {
    title: "Database connection pool exhausted",
    description: "Getting intermittent errors about database connection pool being exhausted during peak hours. This causes some requests to fail with 503 Service Unavailable. Happens around 3-4 PM when usage is highest.",
    category: "Bug",
    priority: "high" as const,
    status: "in_progress" as const,
    isPublic: false,
    helpfulNotes: "Currently investigating connection leaks. May need to increase pool size or implement connection timeout.",
    relatedSkills: ["PostgreSQL", "Performance", "Node.js"],
  },
  {
    title: "Add priority escalation rules",
    description: "Tickets should automatically increase in priority if they remain unresolved for a certain period. For example, medium priority tickets should become high priority after 48 hours without a response.",
    category: "Feature Request",
    priority: "medium" as const,
    status: "pending" as const,
    isPublic: true,
    helpfulNotes: "",
    relatedSkills: ["Automation", "Scheduling"],
  },
  {
    title: "Export functionality timing out",
    description: "When trying to export more than 500 tickets to CSV, the request times out after 30 seconds. We need to be able to export our entire ticket history for compliance reporting.",
    category: "Bug",
    priority: "medium" as const,
    status: "pending" as const,
    isPublic: false,
    helpfulNotes: "",
    relatedSkills: ["Performance", "CSV Export"],
  },
  {
    title: "Add comment functionality to tickets",
    description: "Instead of just replies from moderators, it would be helpful to have a comment section where users can add updates or additional information to their tickets without creating new ones.",
    category: "Feature Request",
    priority: "low" as const,
    status: "pending" as const,
    isPublic: true,
    helpfulNotes: "",
    relatedSkills: ["React", "Database", "Real-time"],
  },
];

const SAMPLE_USERS = [
  {
    name: "Admin User",
    username: "admin",
    email: "admin@tickmate.com",
    password: "admin123",
    role: "admin" as const,
    skills: ["System Administration", "User Management", "Security"],
  },
  {
    name: "John Moderator",
    username: "john_mod",
    email: "john@tickmate.com",
    password: "moderator123",
    role: "moderator" as const,
    skills: ["React", "Node.js", "PostgreSQL", "Authentication", "API"],
  },
  {
    name: "Sarah Tech Lead",
    username: "sarah_tech",
    email: "sarah@tickmate.com",
    password: "moderator123",
    role: "moderator" as const,
    skills: ["Performance", "Database Optimization", "Architecture", "Security"],
  },
  {
    name: "Mike Frontend Dev",
    username: "mike_frontend",
    email: "mike@tickmate.com",
    password: "moderator123",
    role: "moderator" as const,
    skills: ["React", "CSS", "UI/UX", "Responsive Design", "Tailwind CSS"],
  },
  {
    name: "Alice Backend Dev",
    username: "alice_backend",
    email: "alice@tickmate.com",
    password: "moderator123",
    role: "moderator" as const,
    skills: ["Express", "PostgreSQL", "API", "Async Jobs", "Webhooks"],
  },
  {
    name: "Regular User 1",
    username: "user1",
    email: "user1@example.com",
    password: "user123",
    role: "user" as const,
    skills: [],
  },
  {
    name: "Regular User 2",
    username: "user2",
    email: "user2@example.com",
    password: "user123",
    role: "user" as const,
    skills: [],
  },
  {
    name: "Regular User 3",
    username: "user3",
    email: "user3@example.com",
    password: "user123",
    role: "user" as const,
    skills: [],
  },
];

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Create users
    console.log("\n👥 Creating users...");
    const createdUsers: { [key: string]: number } = {};

    for (const userData of SAMPLE_USERS) {
      const hashedPassword = await argon2.hash(userData.password);

      const [existingUser] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, userData.email));

      if (existingUser) {
        console.log(`   ⏭️  User ${userData.username} already exists, skipping...`);
        createdUsers[userData.username] = existingUser.id;
        continue;
      }

      const [user] = await db
        .insert(usersTable)
        .values({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          skills: userData.skills,
          isActive: true,
        })
        .returning({ id: usersTable.id });

      createdUsers[userData.username] = user.id;
      console.log(`   ✅ Created ${userData.role}: ${userData.username} (ID: ${user.id})`);
    }

    // Create tickets
    console.log("\n🎫 Creating tickets...");
    let completedPublicCount = 0;

    for (let i = 0; i < SAMPLE_TICKETS.length; i++) {
      const ticketData = SAMPLE_TICKETS[i];

      // Randomly assign creator (prefer regular users)
      const userKeys = Object.keys(createdUsers);
      const regularUsers = userKeys.filter(k => k.startsWith("user"));
      const creatorKey = regularUsers.length > 0
        ? regularUsers[Math.floor(Math.random() * regularUsers.length)]
        : userKeys[Math.floor(Math.random() * userKeys.length)];

      // Assign to moderator based on skills for completed tickets
      let assignedToId = null;
      if (ticketData.status !== "pending") {
        const moderatorKeys = ["john_mod", "sarah_tech", "mike_frontend", "alice_backend"];
        const matchingModerator = moderatorKeys.find(modKey => {
          const modSkills = SAMPLE_USERS.find(u => u.username === modKey)?.skills || [];
          return ticketData.relatedSkills.some(skill =>
            modSkills.some(modSkill => modSkill.toLowerCase().includes(skill.toLowerCase()))
          );
        });
        assignedToId = matchingModerator
          ? createdUsers[matchingModerator]
          : createdUsers["john_mod"];
      }

      const [ticket] = await db
        .insert(ticketsTable)
        .values({
          title: ticketData.title,
          description: ticketData.description,
          category: ticketData.category,
          priority: ticketData.priority,
          status: ticketData.status,
          isPublic: ticketData.isPublic,
          helpfulNotes: ticketData.helpfulNotes || null,
          relatedSkills: ticketData.relatedSkills,
          createdBy: createdUsers[creatorKey],
          assignedTo: assignedToId,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        })
        .returning();

      console.log(`   ✅ Created ticket #${ticket.id}: "${ticketData.title}" [${ticketData.status}]`);

      // Create embeddings for completed public tickets
      if (ticket.status === "completed" && ticket.isPublic) {
        try {
          await upsertResolvedPublicTicketVector(ticket);
          completedPublicCount++;
          console.log(`      🔍 Created embedding for ticket #${ticket.id}`);
        } catch (error) {
          console.error(`      ⚠️  Failed to create embedding for ticket #${ticket.id}:`, error instanceof Error ? error.message : error);
        }
      }
    }

    console.log("\n✨ Seed completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   👥 Users created: ${Object.keys(createdUsers).length}`);
    console.log(`   🎫 Tickets created: ${SAMPLE_TICKETS.length}`);
    console.log(`   🔍 Embeddings created: ${completedPublicCount}`);
    console.log(`\n💡 Test Credentials:`);
    console.log(`   Admin: admin@tickmate.com / admin123`);
    console.log(`   Moderator: john@tickmate.com / moderator123`);
    console.log(`   User: user1@example.com / user123`);

  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("\n✅ Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed script failed:", error);
    process.exit(1);
  });
