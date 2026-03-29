Role: You are an expert Full-Stack Developer specializing in Next.js, Tailwind CSS, and SaaS monetization.

Task: Create a professional Micro-SaaS for a "Free Instagram Likes & Views" service.

Technical Stack: > - Framework: Next.js (App Router).

Styling: Tailwind CSS (Dark Mode, Instagram-inspired gradients).

Database: Supabase or MongoDB (to track user cooldowns).

Key Features & Requirements:

User Interface: Create a high-conversion landing page. Include a glassmorphism card with an input for "Instagram Username" only. Add a toggle for "Likes" or "Views".

Cooldown Logic: Implement a 30-minute cooldown per username using the database. If a user tries again before the timer ends, show a countdown timer.

Monetization (CRITICAL): >    - Integrate placeholders for Adsterra Social Bar in the layout.

Create a "Processing" state that lasts 10 seconds after clicking "Submit". In this state, show a "Verify you are human" button that links to an Adsterra Direct Link.

The actual API call to the SMM provider must only trigger after the user interacts with the ad or the timer finishes.

Backend Security: Create a Next.js API route to handle the SMM Panel request. Hide the API Key using environment variables (process.env.SMM_API_KEY).

Anti-Abuse: Implement basic rate-limiting to prevent bots from draining my API balance.

Deliverable: Give me the page.tsx for the frontend and the route.ts for the backend API handling the SMM Panel.